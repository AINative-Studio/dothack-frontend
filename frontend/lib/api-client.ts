import { env } from './env'
import {
  ApiError,
  NetworkError,
  TimeoutError,
  createErrorFromResponse,
} from './errors/api-errors'

/**
 * Request options for API calls
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  timeout?: number
  retry?: boolean
  retryAttempts?: number
  retryDelay?: number
  skipAuth?: boolean
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

/**
 * Retry configuration
 */
interface RetryConfig {
  attempts: number
  delay: number
  backoffMultiplier: number
}

/**
 * Centralized API client for backend communication
 * Handles authentication, error handling, retries, and timeouts
 */
export class ApiClient {
  private baseUrl: string
  private apiVersion: string
  private token: string | null = null
  private defaultTimeout: number = 30000 // 30 seconds
  private defaultRetryConfig: RetryConfig = {
    attempts: 3,
    delay: 1000, // 1 second
    backoffMultiplier: 2,
  }

  /**
   * Request interceptors - called before each request
   */
  private requestInterceptors: Array<
    (config: RequestInit) => RequestInit | Promise<RequestInit>
  > = []

  /**
   * Response interceptors - called after each response
   */
  private responseInterceptors: Array<
    (response: Response) => Response | Promise<Response>
  > = []

  constructor(baseUrl?: string, apiVersion?: string) {
    this.baseUrl = baseUrl || env.apiUrl
    this.apiVersion = apiVersion || env.apiVersion
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.token = token
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.token = null
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.token
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(
    interceptor: (config: RequestInit) => RequestInit | Promise<RequestInit>
  ): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Build full URL with API version
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

    // If baseUrl already includes /api/v1, just append the endpoint
    if (this.baseUrl.includes('/api/')) {
      return `${this.baseUrl}/${cleanEndpoint}`
    }

    // If endpoint already includes /api/, use it as-is
    if (cleanEndpoint.startsWith('api/')) {
      return `${this.baseUrl}/${cleanEndpoint}`
    }

    // Otherwise, add API version prefix
    return `${this.baseUrl}/api/${this.apiVersion}/${cleanEndpoint}`
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestInit): Promise<RequestInit> {
    let modifiedConfig = { ...config }

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig)
    }

    return modifiedConfig
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse)
    }

    return modifiedResponse
  }

  /**
   * Generic request method with timeout, retry, and error handling
   */
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retry = true,
      retryAttempts = this.defaultRetryConfig.attempts,
      retryDelay = this.defaultRetryConfig.delay,
      skipAuth = false,
      ...fetchOptions
    } = options

    const url = this.buildUrl(endpoint)
    let lastError: Error | null = null

    // Retry loop
    for (let attempt = 0; attempt < (retry ? retryAttempts : 1); attempt++) {
      try {
        // Add delay for retries (except first attempt)
        if (attempt > 0) {
          const delay = retryDelay * Math.pow(this.defaultRetryConfig.backoffMultiplier, attempt - 1)
          await new Promise(resolve => setTimeout(resolve, delay))

          if (env.isDevelopment) {
            console.log(`Retrying request (attempt ${attempt + 1}/${retryAttempts}): ${url}`)
          }
        }

        // Build headers
        const headers = new Headers(fetchOptions.headers)

        // Add Content-Type if not present and body exists
        if (fetchOptions.body && !headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json')
        }

        // Add authentication token
        if (!skipAuth && this.token) {
          headers.set('Authorization', `Bearer ${this.token}`)
        }

        // Build final config
        let config: RequestInit = {
          ...fetchOptions,
          headers,
        }

        // Apply request interceptors
        config = await this.applyRequestInterceptors(config)

        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
          // Make request
          let response = await fetch(url, {
            ...config,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          // Apply response interceptors
          response = await this.applyResponseInterceptors(response)

          // Handle error responses
          if (!response.ok) {
            const errorData = await this.parseErrorResponse(response)
            const error = createErrorFromResponse(
              response.status,
              errorData.message || response.statusText,
              errorData,
              url,
              fetchOptions.method
            )

            // Don't retry on client errors (4xx)
            if (response.status >= 400 && response.status < 500) {
              throw error
            }

            lastError = error
            continue // Retry on server errors (5xx)
          }

          // Parse successful response
          const data = await this.parseResponse<T>(response)
          return data
        } catch (error: any) {
          clearTimeout(timeoutId)

          // Handle abort (timeout)
          if (error.name === 'AbortError') {
            lastError = new TimeoutError(`Request timeout after ${timeout}ms`, { url })
            continue // Retry on timeout
          }

          throw error
        }
      } catch (error: any) {
        // Network errors or unexpected errors
        if (error instanceof ApiError) {
          throw error
        }

        lastError = new NetworkError(error.message || 'Network request failed', {
          url,
          originalError: error,
        })

        // Don't retry on network errors for non-GET requests
        if (fetchOptions.method && fetchOptions.method !== 'GET') {
          break
        }
      }
    }

    // All retries exhausted
    if (lastError) {
      if (env.isDevelopment) {
        console.error('API request failed after retries:', lastError)
      }
      throw lastError
    }

    // Fallback error (should never reach here)
    throw new ApiError('Request failed', { url })
  }

  /**
   * Parse response body
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('Content-Type')

    if (contentType?.includes('application/json')) {
      return await response.json()
    }

    if (contentType?.includes('text/')) {
      return (await response.text()) as any
    }

    // Default to JSON
    try {
      return await response.json()
    } catch {
      return (await response.text()) as any
    }
  }

  /**
   * Parse error response body
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      return await response.json()
    } catch {
      return {
        message: response.statusText,
        status: response.status,
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
