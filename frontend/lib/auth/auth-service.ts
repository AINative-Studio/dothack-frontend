import { handleAPIError, APIError } from '@/lib/error-handling'
import type {
  User,
  AuthTokens,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  AuthError
} from './types'

const AUTH_API_BASE = process.env.NEXT_PUBLIC_AINATIVE_AUTH_URL || 'https://api.ainative.studio/v1/auth'
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'

class AuthService {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || AUTH_API_BASE
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(
          errorData.message || errorData.error || 'Login failed',
          response.status
        )
      }

      const data: AuthResponse = await response.json()

      // Store tokens and user info
      this.setTokens(data.tokens)
      this.setUser(data.user)

      return data
    } catch (error: any) {
      const apiError = handleAPIError(error, {
        endpoint: '/auth/login',
        method: 'POST',
        payload: { email: credentials.email }
      })
      throw apiError
    }
  }

  /**
   * Sign up new user
   */
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(
          errorData.message || errorData.error || 'Signup failed',
          response.status
        )
      }

      const data: AuthResponse = await response.json()

      // Store tokens and user info
      this.setTokens(data.tokens)
      this.setUser(data.user)

      return data
    } catch (error: any) {
      const apiError = handleAPIError(error, {
        endpoint: '/auth/register',
        method: 'POST',
        payload: { email: credentials.email, name: credentials.name }
      })
      throw apiError
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken()

      if (token) {
        // Call logout endpoint to invalidate token on server
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {
          // Ignore errors on logout - we'll clear local state anyway
        })
      }
    } finally {
      // Always clear local state
      this.clearAuth()
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken()

      if (!refreshToken) {
        throw new APIError('No refresh token available', 401)
      }

      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (!response.ok) {
        throw new APIError('Token refresh failed', response.status)
      }

      const data = await response.json()
      const newToken = data.access_token || data.token

      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken)
        return newToken
      }

      throw new APIError('No token in refresh response', 500)
    } catch (error: any) {
      // If refresh fails, clear auth state
      this.clearAuth()
      throw handleAPIError(error, {
        endpoint: '/auth/refresh',
        method: 'POST'
      })
    }
  }

  /**
   * Get current user from server
   */
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken()

      if (!token) {
        throw new APIError('No authentication token', 401)
      }

      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const newToken = await this.refreshToken()
          // Retry with new token
          return this.getCurrentUser()
        }
        throw new APIError('Failed to get user', response.status)
      }

      const user: User = await response.json()
      this.setUser(user)
      return user
    } catch (error: any) {
      throw handleAPIError(error, {
        endpoint: '/auth/me',
        method: 'GET'
      })
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Get stored user info
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const userJson = localStorage.getItem(USER_KEY)
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch {
      return null
    }
  }

  /**
   * Store auth tokens
   */
  private setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(TOKEN_KEY, tokens.access_token)

    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
    }
  }

  /**
   * Store user info
   */
  private setUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  /**
   * Clear all auth data
   */
  private clearAuth(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export const authService = new AuthService()
