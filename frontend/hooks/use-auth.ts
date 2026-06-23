'use client'

/**
 * useAuth hook
 *
 * Manages authentication state for the DotHack frontend using the AINative
 * auth endpoints via lib/api/auth.ts.
 *
 * - Tokens and the user object are persisted in localStorage.
 * - On mount the hook validates the stored token via GET /auth/me and
 *   auto-refreshes using the stored refresh token if the access token has
 *   expired (401 response).
 * - Exposes login / logout functions and reactive { user, token,
 *   isAuthenticated, isLoading } state.
 *
 * Usage:
 *   const { user, token, login, logout, isAuthenticated, isLoading } = useAuth()
 *
 * The hook must be used inside a component tree wrapped by <AuthProvider>.
 * Import AuthProvider from this same file.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  login as apiLogin,
  refreshToken as apiRefreshToken,
  getMe,
  getMeWithApiKey,
  type AuthUser,
} from '@/lib/api/auth'

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const ACCESS_TOKEN_KEY = 'dothack_access_token'
const REFRESH_TOKEN_KEY = 'dothack_refresh_token'
const USER_KEY = 'dothack_user'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, value)
}

function clearStorage(...keys: string[]): void {
  if (typeof window === 'undefined') return
  keys.forEach(k => localStorage.removeItem(k))
}

function readUserStorage(): AuthUser | null {
  const raw = readStorage(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithApiKey: (apiKey: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Prevent concurrent refresh attempts
  const refreshPromiseRef = useRef<Promise<void> | null>(null)

  // ---- internal helpers --------------------------------------------------

  const applyTokens = useCallback(
    (accessToken: string, refreshTokenValue?: string, userData?: AuthUser) => {
      setToken(accessToken)
      writeStorage(ACCESS_TOKEN_KEY, accessToken)
      if (refreshTokenValue) {
        writeStorage(REFRESH_TOKEN_KEY, refreshTokenValue)
      }
      if (userData) {
        setUser(userData)
        writeStorage(USER_KEY, JSON.stringify(userData))
      }
    },
    []
  )

  const clearAuth = useCallback(() => {
    setToken(null)
    setUser(null)
    clearStorage(ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY)
  }, [])

  // ---- refresh -----------------------------------------------------------

  const refresh = useCallback(async (): Promise<void> => {
    // Deduplicate simultaneous refresh calls
    if (refreshPromiseRef.current) return refreshPromiseRef.current

    const storedRefresh = readStorage(REFRESH_TOKEN_KEY)
    if (!storedRefresh) {
      clearAuth()
      return
    }

    const promise = (async () => {
      try {
        const data = await apiRefreshToken(storedRefresh)
        const newAccess = data.access_token
        applyTokens(newAccess, data.refresh_token)
        // Fetch fresh user with the new token
        const me = await getMe(newAccess)
        setUser(me)
        writeStorage(USER_KEY, JSON.stringify(me))
      } catch {
        clearAuth()
      }
    })()

    refreshPromiseRef.current = promise
    try {
      await promise
    } finally {
      refreshPromiseRef.current = null
    }
  }, [applyTokens, clearAuth])

  // ---- initialize on mount -----------------------------------------------

  useEffect(() => {
    async function init() {
      const storedToken = readStorage(ACCESS_TOKEN_KEY)
      const cachedUser = readUserStorage()

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      // Optimistically apply cached state for instant UI
      if (cachedUser) setUser(cachedUser)
      setToken(storedToken)

      try {
        const me = await getMe(storedToken)
        setUser(me)
        writeStorage(USER_KEY, JSON.stringify(me))
      } catch (err: any) {
        if (err?.status === 401) {
          // Access token expired — try refresh
          await refresh()
        } else {
          clearAuth()
        }
      } finally {
        setIsLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- login -------------------------------------------------------------

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true)
      try {
        const data = await apiLogin(email, password)
        const accessToken = data.tokens?.access_token ?? data.access_token ?? ''
        const refreshTokenValue = data.tokens?.refresh_token ?? data.refresh_token
        applyTokens(accessToken, refreshTokenValue, data.user)
      } finally {
        setIsLoading(false)
      }
    },
    [applyTokens]
  )

  // ---- login with API key ------------------------------------------------

  const loginWithApiKey = useCallback(
    async (apiKey: string): Promise<void> => {
      setIsLoading(true)
      try {
        const me = await getMeWithApiKey(apiKey)
        // Use the API key as the "token" for subsequent requests
        applyTokens(apiKey, undefined, me)
      } finally {
        setIsLoading(false)
      }
    },
    [applyTokens]
  )

  // ---- logout ------------------------------------------------------------

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  // ---- context value -----------------------------------------------------

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    loginWithApiKey,
    logout,
    refresh,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return ctx
}
