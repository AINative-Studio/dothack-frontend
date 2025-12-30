'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useHasRole } from '@/hooks/use-has-role'
import type { UserRole } from '@/lib/auth/route-protection'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  hackathonId?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Component to protect routes based on authentication and role
 *
 * Usage:
 * <ProtectedRoute requiredRole="ORGANIZER" hackathonId={id}>
 *   <OrganizerContent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRole,
  hackathonId,
  fallback,
  redirectTo = '/unauthorized'
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()

  // Get participant_id from user (this assumes user has participant_id)
  // You may need to adjust this based on your User type
  const participantId = user?.user_id

  // Check role if required
  const { data: hasRole, isLoading: roleLoading } = useHasRole(
    participantId,
    hackathonId,
    requiredRole || 'BUILDER' // Default to BUILDER if no role specified
  )

  const isLoading = authLoading || (requiredRole && roleLoading)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
      return
    }

    // Check role access if required
    if (!authLoading && !roleLoading && requiredRole && hackathonId) {
      if (!hasRole) {
        router.push(redirectTo)
      }
    }
  }, [
    isAuthenticated,
    authLoading,
    hasRole,
    roleLoading,
    requiredRole,
    hackathonId,
    redirectTo,
    router,
    pathname
  ])

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Requires role but user doesn't have it
  if (requiredRole && hackathonId && !hasRole) {
    return null
  }

  // Authorized - render children
  return <>{children}</>
}
