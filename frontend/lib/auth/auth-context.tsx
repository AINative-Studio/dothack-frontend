'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from './auth-service'
import { getMeWithApiKey } from '@/lib/api/auth'
import { showErrorToast } from '@/lib/error-handling'
import type { User, LoginCredentials, SignupCredentials } from './types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  loginWithApiKey: (apiKey: string) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  async function initializeAuth() {
    try {
      // Check if we have a stored token
      if (authService.isAuthenticated()) {
        // Get stored user first for instant UI
        const storedUser = authService.getStoredUser()
        if (storedUser) {
          setUser(storedUser)
        }

        // Then fetch fresh user data from server
        try {
          const freshUser = await authService.getCurrentUser()
          setUser(freshUser)
        } catch (error) {
          // If fetching user fails, clear auth state
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(credentials: LoginCredentials) {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      setUser(response.user)
    } catch (error: any) {
      setUser(null)
      showErrorToast(error, 'Login Failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function loginWithApiKey(apiKey: string) {
    try {
      setIsLoading(true)
      const me = await getMeWithApiKey(apiKey)
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', apiKey)
        localStorage.setItem('auth_user', JSON.stringify(me))
        // Also set cookie so middleware can read it for route protection
        document.cookie = `auth_token=${apiKey}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }
      setUser(me as any)
    } catch (error: any) {
      setUser(null)
      throw new Error('Invalid API key')
    } finally {
      setIsLoading(false)
    }
  }

  async function signup(credentials: SignupCredentials) {
    try {
      setIsLoading(true)
      const response = await authService.signup(credentials)
      setUser(response.user)
    } catch (error: any) {
      setUser(null)
      showErrorToast(error, 'Signup Failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
    } catch (error: any) {
      showErrorToast(error, 'Logout Failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshUser() {
    try {
      if (authService.isAuthenticated()) {
        const freshUser = await authService.getCurrentUser()
        setUser(freshUser)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
    }
  }

  // Read token from localStorage for API hooks
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithApiKey,
    signup,
    logout,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
