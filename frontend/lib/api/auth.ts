/**
 * DotHack auth API functions
 *
 * Wraps the three auth endpoints:
 *   POST /auth/login    — exchange credentials for tokens + user
 *   POST /auth/refresh  — exchange a refresh token for a new access token
 *   GET  /auth/me       — fetch the currently-authenticated user
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface AuthUser {
  user_id: string
  email: string
  name: string
  role?: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

export interface LoginResponse {
  user: AuthUser
  tokens: AuthTokens
  /** Some backends return access_token at the top level */
  access_token?: string
  refresh_token?: string
}

export interface RefreshResponse {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

// ---------------------------------------------------------------------------
// Auth API functions
// ---------------------------------------------------------------------------

/**
 * Authenticate with email + password.
 * Returns the user object along with access and refresh tokens.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/**
 * Exchange a refresh token for a new access token.
 */
export async function refreshToken(refresh: string): Promise<RefreshResponse> {
  return apiClient<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refresh }),
  })
}

/**
 * Fetch the currently-authenticated user.
 * Requires a valid access token.
 */
export async function getMe(token: string): Promise<AuthUser> {
  return apiClient<AuthUser>('/auth/me', {
    method: 'GET',
    token,
  })
}

/**
 * Authenticate with an AINative API key.
 * Calls GET /auth/me with X-API-Key header.
 */
export async function getMeWithApiKey(apiKey: string): Promise<AuthUser> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dothack.ainative.studio/api/v1'
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: { 'X-API-Key': apiKey },
  })
  if (!res.ok) throw new Error('Invalid API key')
  return res.json()
}
