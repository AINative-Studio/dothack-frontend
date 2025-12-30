/**
 * Route Protection Utilities
 *
 * Helper functions for determining route access requirements
 */

export type UserRole = 'BUILDER' | 'ORGANIZER' | 'JUDGE' | 'MENTOR'

/**
 * Check if a route is public (no authentication required)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/features',
    '/pricing',
    '/docs',
    '/contact',
    '/privacy',
    '/terms',
    '/public-hackathons',
  ]

  return publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/hackathons',
    '/profile',
    '/settings',
  ]

  return protectedRoutes.some(route => pathname.startsWith(route))
}

/**
 * Get required roles for a specific route
 */
export function getRequiredRoles(pathname: string): UserRole[] | null {
  // Organizer-only routes
  if (
    pathname.match(/^\/hackathons\/[^/]+\/setup/) ||
    pathname.match(/^\/hackathons\/[^/]+\/participants/) ||
    pathname.match(/^\/hackathons\/[^/]+\/prizes/) ||
    pathname.startsWith('/api-settings')
  ) {
    return ['ORGANIZER']
  }

  // Judge-only routes
  if (pathname.match(/^\/hackathons\/[^/]+\/judging/)) {
    return ['JUDGE']
  }

  // Builder/Team routes (accessible by builders and organizers)
  if (
    pathname.match(/^\/hackathons\/[^/]+\/teams/) ||
    pathname.match(/^\/hackathons\/[^/]+\/projects/) ||
    pathname.match(/^\/hackathons\/[^/]+\/submissions/)
  ) {
    return ['BUILDER', 'ORGANIZER']
  }

  // No specific role required
  return null
}

/**
 * Check if a user role has access to a route
 */
export function hasAccess(userRole: UserRole, pathname: string): boolean {
  const requiredRoles = getRequiredRoles(pathname)

  // No specific roles required
  if (!requiredRoles) {
    return true
  }

  // Check if user's role is in the required roles
  return requiredRoles.includes(userRole)
}

/**
 * Extract hackathon ID from pathname
 */
export function extractHackathonId(pathname: string): string | null {
  const match = pathname.match(/^\/hackathons\/([^/]+)/)
  return match ? match[1] : null
}
