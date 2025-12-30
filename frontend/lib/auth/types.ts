export interface User {
  user_id: string
  email: string
  name: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface AuthError extends Error {
  code?: string
  statusCode?: number
}
