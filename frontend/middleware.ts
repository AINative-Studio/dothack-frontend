import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware for Route Protection
 *
 * This middleware runs on every request and protects routes based on
 * authentication status.
 */

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
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

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/hackathons',
  '/profile',
  '/settings',
]

// Routes that require specific roles (organizer)
const ORGANIZER_ROUTES = [
  '/api-settings',
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

function requiresOrganizer(pathname: string): boolean {
  return ORGANIZER_ROUTES.some(route => pathname.startsWith(route))
}

function requiresJudge(pathname: string): boolean {
  // Check if path matches /hackathons/[id]/judging
  return /^\/hackathons\/[^/]+\/judging/.test(pathname)
}

function requiresOrganizerForHackathon(pathname: string): boolean {
  // Check if path matches organizer-only routes for specific hackathons
  const organizerPatterns = [
    /^\/hackathons\/[^/]+\/setup/,
    /^\/hackathons\/[^/]+\/participants/,
    /^\/hackathons\/[^/]+\/prizes/,
  ]

  return organizerPatterns.some(pattern => pattern.test(pathname))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if user has auth token
  const token = request.cookies.get('auth_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated and accessing protected route
  if (!token && (isProtectedRoute(pathname) || requiresOrganizer(pathname) || requiresJudge(pathname) || requiresOrganizerForHackathon(pathname))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For role-based routes, we'll check roles on the client side
  // since we can't easily decode JWT in edge middleware without crypto libraries
  // The client-side ProtectedRoute component will handle role checks

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
