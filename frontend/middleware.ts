import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware for Route Protection
 *
 * Runs on every matched request and enforces authentication rules:
 *
 *  - Marketing / public pages are always accessible.
 *  - All /hackathons/* routes, /profile, /settings, and /api-settings
 *    require a valid auth token (read from the `dothack_access_token` cookie
 *    or the Authorization header).
 *  - Unauthenticated visitors are redirected to /login with the original
 *    path preserved as the `redirect` query parameter.
 *  - Role checks (organizer, judge) are deferred to client-side ProtectedRoute
 *    components because decoding a JWT inside the Edge runtime would require
 *    bringing in a crypto dependency.
 */

// ---------------------------------------------------------------------------
// Route lists
// ---------------------------------------------------------------------------

/**
 * Public (marketing) routes that never require authentication.
 * Prefix matching is used for all entries except the root "/".
 */
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
  '/internal-hackathons',
]

/**
 * Route prefixes that require a valid auth token.
 * /hackathons/* is intentionally included — the public hackathon listing
 * page lives at /public-hackathons (no auth required).
 */
const PROTECTED_ROUTES = [
  '/hackathons',
  '/profile',
  '/settings',
  '/api-settings',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Resolve the auth token from either the dedicated cookie set by the auth
 * flow (`dothack_access_token`) or from the Authorization header as a
 * fallback for programmatic clients.
 *
 * Note: localStorage is not accessible in Edge middleware.  The token must
 * be mirrored to a cookie (HttpOnly-optional) during the login flow for
 * server-side route protection to work.
 */
function resolveToken(request: NextRequest): string | undefined {
  // Primary: dedicated DotHack cookie
  const cookie = request.cookies.get('dothack_access_token')?.value
  if (cookie) return cookie

  // Secondary: legacy generic cookie used by the existing auth flow
  const legacyCookie = request.cookies.get('auth_token')?.value
  if (legacyCookie) return legacyCookie

  // Tertiary: Authorization header (API / programmatic access)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)

  return undefined
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pass through Next.js internals, static assets, and Next API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Always allow public / marketing pages
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Enforce auth on all other routes that match PROTECTED_ROUTES
  if (isProtectedRoute(pathname)) {
    const token = resolveToken(request)

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Role-based access (organizer/judge sub-routes) is enforced client-side
  // via the ProtectedRoute component — the Edge runtime cannot safely decode
  // JWTs without a crypto dependency.

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
