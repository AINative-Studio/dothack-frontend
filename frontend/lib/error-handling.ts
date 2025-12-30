export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request. Please check your input and try again.',
  401: 'Authentication failed. Please check your API credentials.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'Resource not found. Please verify the project ID or resource identifier.',
  422: 'Invalid request data. Please check all required fields are correctly formatted.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again later.',
  502: 'Bad gateway. The server is temporarily unavailable.',
  503: 'Service unavailable. Please try again later.',
  504: 'Gateway timeout. The request took too long to complete.'
}

export const NETWORK_ERROR_MESSAGE = 'Network error. Please check your internet connection.'

export function getUserFriendlyErrorMessage(statusCode?: number, originalMessage?: string): string {
  if (!statusCode) {
    return originalMessage || NETWORK_ERROR_MESSAGE
  }

  return ERROR_MESSAGES[statusCode] || `An unexpected error occurred (${statusCode})`
}

export function logAPIError(
  endpoint: string,
  method: string,
  statusCode?: number,
  error?: any,
  payload?: any
): void {
  const timestamp = new Date().toISOString()

  console.group(`[API Error] ${method} ${endpoint}`)
  console.error('Timestamp:', timestamp)
  console.error('Status Code:', statusCode || 'N/A')
  console.error('Error:', error)

  if (payload) {
    console.error('Request Payload:', payload)
  }

  if (error?.response) {
    console.error('Response Data:', error.response)
  }

  console.groupEnd()
}

export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
  retryableStatusCodes: number[]
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatusCodes: [500, 502, 503, 504]
}

export function shouldRetry(statusCode: number | undefined, config: RetryConfig = DEFAULT_RETRY_CONFIG): boolean {
  if (!statusCode) return true

  return config.retryableStatusCodes.includes(statusCode)
}

export function calculateBackoff(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = config.initialDelay * Math.pow(config.backoffFactor, attempt - 1)
  return Math.min(delay, config.maxDelay)
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      const statusCode = error.statusCode || error.response?.status

      if (!shouldRetry(statusCode, config) || attempt === config.maxRetries) {
        throw error
      }

      const backoffDelay = calculateBackoff(attempt, config)
      console.warn(`Retry attempt ${attempt}/${config.maxRetries} after ${backoffDelay}ms`)

      await delay(backoffDelay)
    }
  }

  throw lastError
}

export function isNetworkError(error: any): boolean {
  return (
    error.message === 'Network request failed' ||
    error.message === 'Failed to fetch' ||
    error.name === 'NetworkError' ||
    !navigator.onLine
  )
}

export function handleAPIError(error: any, context?: { endpoint?: string; method?: string; payload?: any }): APIError {
  const statusCode = error.statusCode || error.response?.status
  const originalMessage = error.message || error.response?.data?.error || 'Unknown error'

  if (context) {
    logAPIError(
      context.endpoint || 'unknown',
      context.method || 'unknown',
      statusCode,
      error,
      context.payload
    )
  }

  if (isNetworkError(error)) {
    return new APIError(NETWORK_ERROR_MESSAGE, undefined, error)
  }

  const userMessage = getUserFriendlyErrorMessage(statusCode, originalMessage)

  return new APIError(userMessage, statusCode, error)
}

export interface ErrorToastOptions {
  title?: string
  description: string
  duration?: number
}

export type ErrorToastFunction = (options: ErrorToastOptions) => void

let errorToastHandler: ErrorToastFunction | null = null

export function setErrorToastHandler(handler: ErrorToastFunction): void {
  errorToastHandler = handler
}

export function showErrorToast(error: APIError, title?: string): void {
  if (errorToastHandler) {
    errorToastHandler({
      title: title || 'Error',
      description: error.message,
      duration: 5000
    })
  } else {
    console.error('Error toast handler not set. Error:', error.message)
  }
}
