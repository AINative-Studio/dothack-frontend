/**
 * DotHack typed fetch wrapper
 *
 * A lightweight, typed fetch wrapper that attaches the Authorization header
 * when a token is provided. All API modules in lib/api/* use this as their
 * single transport layer.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://dothack.ainative.studio/api/v1'

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { token?: string },
  _retryCount = 0
): Promise<T> {
  const { token, ...fetchOptions } = options || {}

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers })

  // Auto-retry on 429 rate limit (up to 3 times with backoff)
  if (res.status === 429 && _retryCount < 3) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10)
    const delay = Math.min(retryAfter * 1000, 15000) * (_retryCount + 1)
    await new Promise(r => setTimeout(r, delay))
    return apiClient<T>(path, options, _retryCount + 1)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: 'Request failed' } }))
    const message: string =
      body?.error?.message ||
      body?.message ||
      body?.detail ||
      `Request failed with status ${res.status}`
    throw new ApiRequestError(message, res.status, body)
  }

  // 204 No Content
  if (res.status === 204) return null as T

  return res.json()
}
