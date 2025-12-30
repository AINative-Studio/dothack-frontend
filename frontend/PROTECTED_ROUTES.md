# Protected Routes & RBAC Guide

This document explains how route protection and role-based access control (RBAC) works in the DotHack platform.

## Overview

The platform uses a multi-layered approach to route protection:

1. **Server-side (Middleware)** - Next.js middleware protects routes at the edge
2. **Client-side (Components)** - React components check roles and permissions
3. **API-level (Hooks)** - React Query hooks fetch and cache role data

## Architecture

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       ▼
┌─────────────────┐
│  Middleware     │ ◄── Check auth token
│  (Edge)         │ ◄── Redirect if not authenticated
└──────┬──────────┘
       ▼
┌─────────────────┐
│  Page/Component │
└──────┬──────────┘
       ▼
┌─────────────────┐
│  ProtectedRoute │ ◄── Check role requirements
│  (Client)       │ ◄── Fetch role from API
└──────┬──────────┘
       ▼
┌─────────────────┐
│  Content        │
└─────────────────┘
```

## User Roles

The platform supports four roles:

- **BUILDER** - Participants creating projects
- **ORGANIZER** - Hackathon administrators
- **JUDGE** - Evaluating submissions
- **MENTOR** - Guiding participants

Roles are hackathon-specific (same user can have different roles in different hackathons).

## Route Protection Matrix

| Route Pattern | Auth Required | Allowed Roles | Notes |
|--------------|---------------|---------------|-------|
| `/` | No | All | Public homepage |
| `/login` | No | All | Public login |
| `/signup` | No | All | Public signup |
| `/hackathons` | Yes | All | List hackathons |
| `/hackathons/[id]` | Yes | All | View hackathon |
| `/hackathons/[id]/setup` | Yes | ORGANIZER | Setup only |
| `/hackathons/[id]/participants` | Yes | ORGANIZER | Manage participants |
| `/hackathons/[id]/prizes` | Yes | ORGANIZER | Manage prizes |
| `/hackathons/[id]/judging` | Yes | JUDGE | Judge submissions |
| `/hackathons/[id]/teams` | Yes | BUILDER, ORGANIZER | Team management |
| `/hackathons/[id]/projects` | Yes | BUILDER, ORGANIZER | Project management |
| `/hackathons/[id]/submissions` | Yes | BUILDER, ORGANIZER | Submit projects |
| `/api-settings` | Yes | ORGANIZER | API configuration |
| `/profile` | Yes | All | User profile |

## Middleware Protection

Server-side protection using Next.js middleware (`middleware.ts`):

```typescript
// Public routes - no auth required
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/features']

// Protected routes - auth required
const PROTECTED_ROUTES = ['/hackathons', '/profile', '/settings']

// Middleware checks token and redirects to login if missing
```

**How it works:**
1. Runs on every request at the edge
2. Checks for `auth_token` cookie or Authorization header
3. Redirects unauthenticated users to `/login?redirect=...`
4. Passes authenticated requests to the page

**Limitations:**
- Can only check for presence of token, not decode it
- Cannot check roles (done client-side)
- Fast but basic protection

## Client-Side Protection

### ProtectedRoute Component

Wrap components that require specific roles:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

<ProtectedRoute
  requiredRole="ORGANIZER"
  hackathonId={hackathonId}
>
  <OrganizerDashboard />
</ProtectedRoute>
```

**Props:**
- `requiredRole` - Required role (BUILDER, ORGANIZER, JUDGE, MENTOR)
- `hackathonId` - Hackathon UUID (required for role check)
- `fallback` - Optional loading component
- `redirectTo` - Redirect URL on unauthorized (default: `/unauthorized`)

**How it works:**
1. Checks if user is authenticated
2. Fetches user's role for the hackathon from API
3. Shows loading state while checking
4. Redirects to `/unauthorized` if role check fails
5. Renders children if authorized

### Role Checking Hooks

Check roles in your components:

```typescript
import { useIsOrganizer, useIsJudge, useIsBuilder } from '@/hooks/use-has-role'

function MyComponent({ hackathonId }: { hackathonId: string }) {
  const { user } = useAuth()
  const { data: isOrganizer, isLoading } = useIsOrganizer(
    user?.user_id,
    hackathonId
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {isOrganizer && <Button>Edit Hackathon</Button>}
    </div>
  )
}
```

**Available Hooks:**
- `useHasRole(participantId, hackathonId, role)` - Check specific role
- `useUserRole(participantId, hackathonId)` - Get user's role
- `useIsOrganizer(participantId, hackathonId)` - Check organizer
- `useIsJudge(participantId, hackathonId)` - Check judge
- `useIsBuilder(participantId, hackathonId)` - Check builder
- `useIsMentor(participantId, hackathonId)` - Check mentor
- `useIsParticipant(participantId, hackathonId)` - Check any participation

**Features:**
- React Query caching (5 minute stale time)
- Automatic refetching
- Loading states
- Error handling

## Role Checking Functions

Direct API calls without React hooks:

```typescript
import { isOrganizer, getUserRole } from '@/lib/auth/check-role'

// Check if user is organizer
const hasAccess = await isOrganizer(participantId, hackathonId)

// Get user's role
const role = await getUserRole(participantId, hackathonId)
// Returns: 'ORGANIZER' | 'JUDGE' | 'BUILDER' | 'MENTOR' | null
```

**Available Functions:**
- `hasRole(participantId, hackathonId, role)` - Generic role check
- `isOrganizer(participantId, hackathonId)` - Check organizer
- `isJudge(participantId, hackathonId)` - Check judge
- `isBuilder(participantId, hackathonId)` - Check builder
- `isMentor(participantId, hackathonId)` - Check mentor
- `getUserRole(participantId, hackathonId)` - Get user's role
- `getHackathonsByRole(participantId, role)` - List hackathons by role
- `isParticipant(participantId, hackathonId)` - Check participation

## Route Protection Helpers

Utility functions for route logic:

```typescript
import {
  isPublicRoute,
  isProtectedRoute,
  getRequiredRoles,
  hasAccess
} from '@/lib/auth/route-protection'

// Check if route is public
const isPublic = isPublicRoute('/login') // true

// Get required roles for a route
const roles = getRequiredRoles('/hackathons/123/setup')
// Returns: ['ORGANIZER']

// Check if user role has access
const canAccess = hasAccess('ORGANIZER', '/hackathons/123/setup')
// Returns: true
```

## Usage Examples

### Example 1: Protect a Page

```typescript
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useParams } from 'next/navigation'

export default function SetupPage() {
  const params = useParams()
  const hackathonId = params.hackathonId as string

  return (
    <ProtectedRoute
      requiredRole="ORGANIZER"
      hackathonId={hackathonId}
    >
      <div>
        <h1>Hackathon Setup</h1>
        {/* Organizer-only content */}
      </div>
    </ProtectedRoute>
  )
}
```

### Example 2: Conditional Rendering

```typescript
'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useIsOrganizer } from '@/hooks/use-has-role'

export function HackathonHeader({ hackathonId }: { hackathonId: string }) {
  const { user } = useAuth()
  const { data: isOrganizer } = useIsOrganizer(user?.user_id, hackathonId)

  return (
    <header>
      <h1>My Hackathon</h1>
      {isOrganizer && (
        <Button href={`/hackathons/${hackathonId}/setup`}>
          Edit Settings
        </Button>
      )}
    </header>
  )
}
```

### Example 3: Multiple Roles

```typescript
'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useUserRole } from '@/hooks/use-has-role'

export function Dashboard({ hackathonId }: { hackathonId: string }) {
  const { user } = useAuth()
  const { data: role } = useUserRole(user?.user_id, hackathonId)

  if (role === 'ORGANIZER') {
    return <OrganizerDashboard />
  }

  if (role === 'JUDGE') {
    return <JudgeDashboard />
  }

  if (role === 'BUILDER') {
    return <BuilderDashboard />
  }

  return <div>No access</div>
}
```

## Data Model

Roles are stored in the `hackathon_participants` table:

```sql
hackathon_participants
  - hackathon_id: UUID
  - participant_id: UUID
  - role: 'BUILDER' | 'ORGANIZER' | 'JUDGE' | 'MENTOR'
```

A user can have multiple roles across different hackathons, but only one role per hackathon.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Client-side checks are for UX only**
   - Never rely solely on client-side role checks
   - Always validate permissions on the backend

2. **Middleware limitations**
   - Edge middleware cannot decode JWTs (no crypto APIs)
   - Can only check for token presence
   - Role checks must happen client-side or API-side

3. **Token storage**
   - Currently using localStorage
   - For production, consider httpOnly cookies

4. **API protection**
   - Backend APIs must validate roles independently
   - Never trust client-provided role claims

5. **Logging**
   - Log all unauthorized access attempts
   - Monitor for suspicious patterns

## Error Handling

### Unauthorized Access

When users try to access restricted content:

1. **Not authenticated** → Redirect to `/login?redirect=...`
2. **Wrong role** → Redirect to `/unauthorized`
3. **Not enrolled** → Redirect to `/unauthorized`

### Loading States

All role checks show loading states:

```typescript
const { data: isOrganizer, isLoading } = useIsOrganizer(userId, hackathonId)

if (isLoading) {
  return <Spinner />
}
```

### Error States

Role check failures are handled gracefully:

```typescript
const { data: isOrganizer, error } = useIsOrganizer(userId, hackathonId)

if (error) {
  console.error('Role check failed:', error)
  // Assume no access on error
}
```

## Troubleshooting

### "Access Denied" on valid page
- Verify user is enrolled in hackathon
- Check user's role in `hackathon_participants` table
- Ensure role matches route requirements

### Infinite redirect loop
- Check middleware config matcher
- Verify public routes list
- Check auth token is being set correctly

### Role check always returns false
- Verify participant_id is correct (matches user_id)
- Check hackathon_id is valid UUID
- Ensure row exists in `hackathon_participants` table

### Middleware not running
- Check `middleware.ts` is at root of `frontend/` directory
- Verify matcher config includes the route
- Restart Next.js dev server

## Performance

Role checks are optimized:

- **Caching**: React Query caches for 5 minutes
- **Deduplication**: Multiple components share same query
- **Prefetching**: Can prefetch roles on page load
- **Conditional**: Only fetches when needed (enabled flag)

## Future Improvements

Planned enhancements:

- [ ] Migrate to httpOnly cookies for tokens
- [ ] Add CSRF protection
- [ ] Implement permission-based access (beyond roles)
- [ ] Add role delegation (sub-organizers)
- [ ] Add audit log for access attempts
- [ ] Add rate limiting for role checks
- [ ] Support multiple roles per user per hackathon

## Reference Files

- Middleware: `middleware.ts`
- Route Protection: `lib/auth/route-protection.ts`
- Role Checking: `lib/auth/check-role.ts`
- Protected Component: `components/ProtectedRoute.tsx`
- Role Hooks: `hooks/use-has-role.ts`
- Unauthorized Page: `app/unauthorized/page.tsx`

---

**Last Updated:** 2025-12-31
**Version:** 1.0.0
