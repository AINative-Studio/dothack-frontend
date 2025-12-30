# Authentication Guide

This document explains how authentication works in the DotHack platform.

## Overview

The platform uses AINative Studio authentication with JWT tokens for user session management.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Auth Pages  │────▶│ Auth Service│
│             │     │ /login       │     │             │
│             │     │ /signup      │     │             │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                                         ┌──────────────┐
                                         │ Auth Context │
                                         │ (React)      │
                                         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │ AINative API │
                                         │ /v1/auth     │
                                         └──────────────┘
```

## Components

### 1. Auth Service (`lib/auth/auth-service.ts`)

Core authentication logic:
- `login()` - Authenticate with email/password
- `signup()` - Create new account
- `logout()` - End session
- `refreshToken()` - Renew access token
- `getCurrentUser()` - Fetch user profile
- `isAuthenticated()` - Check auth status

### 2. Auth Context (`lib/auth/auth-context.tsx`)

React context providing auth state:
- `user` - Current user object or null
- `isLoading` - Loading state
- `isAuthenticated` - Boolean auth status
- `login()` - Login function
- `signup()` - Signup function
- `logout()` - Logout function
- `refreshUser()` - Refresh user data

### 3. Auth Pages

**Login (`app/(auth)/login/page.tsx`)**
- Email/password form
- Error handling
- Redirect to /hackathons on success
- Link to signup

**Signup (`app/(auth)/signup/page.tsx`)**
- Name/email/password form
- Password strength indicator
- Terms acceptance
- Password validation
- Link to login

### 4. User Menu (`components/UserMenu.tsx`)

Displays user info and actions:
- User avatar with initials
- Dropdown with user name/email
- Navigation to hackathons/profile
- Logout button
- Shows sign in/up buttons when not authenticated

## Usage

### In Components

```typescript
import { useAuth } from '@/lib/auth/auth-context'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <p>Please log in</p>
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Log out</button>
    </div>
  )
}
```

### Login Flow

```typescript
const { login } = useAuth()

async function handleLogin() {
  try {
    await login({
      email: 'user@example.com',
      password: 'password123'
    })
    // User is now logged in
    router.push('/hackathons')
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

### Signup Flow

```typescript
const { signup } = useAuth()

async function handleSignup() {
  try {
    await signup({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123'
    })
    // User is created and logged in
    router.push('/hackathons')
  } catch (error) {
    console.error('Signup failed:', error)
  }
}
```

## Token Storage

**Current Implementation:** localStorage
- `auth_token` - Access token
- `refresh_token` - Refresh token (if provided)
- `auth_user` - Cached user object

**Security Note:** For production, consider using httpOnly cookies for better security.

## API Endpoints

The auth service connects to:

```
Base URL: https://api.ainative.studio/v1/auth
```

**Endpoints:**
- `POST /register` - Create account
- `POST /login` - Authenticate
- `POST /logout` - Invalidate session
- `GET /me` - Get current user
- `POST /refresh` - Refresh token

## Environment Variables

```bash
# Required
NEXT_PUBLIC_AINATIVE_AUTH_URL=https://api.ainative.studio/v1/auth

# Optional
NEXT_PUBLIC_AINATIVE_APP_URL=http://localhost:3000
```

## Password Requirements

Passwords must:
- Be at least 8 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number

Password strength is indicated in the signup form:
- **Weak** - Less than 8 characters
- **Fair** - Meets some requirements
- **Strong** - Meets all requirements

## Error Handling

All auth errors are handled consistently:

```typescript
try {
  await login(credentials)
} catch (error) {
  // Error is an APIError with:
  // - message: User-friendly error message
  // - statusCode: HTTP status code
  // - originalError: Raw error object

  // Errors are automatically shown as toast notifications
}
```

Common error codes:
- `401` - Invalid credentials / Unauthorized
- `400` - Validation error (missing fields, weak password)
- `409` - Email already exists (signup)
- `500` - Server error

## Auto-Login

On app load, the auth system:
1. Checks for stored token
2. Loads cached user for instant UI
3. Validates token with `/auth/me`
4. Updates user with fresh data
5. Clears auth if validation fails

## Token Refresh

The auth service automatically refreshes tokens:
- When `/auth/me` returns 401
- Before making authenticated requests
- Clears auth if refresh fails

## Logout

Logout performs:
1. Calls `/auth/logout` to invalidate server session
2. Clears all local storage (tokens + user)
3. Updates auth context state
4. User is redirected to login page

## Integration with Pages

To add auth to a page:

```typescript
'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return <div>Protected content</div>
}
```

## Next Steps

### Planned Enhancements (Issue #4)
- Next.js middleware for route protection
- Role-based access control (RBAC)
- Automatic redirects for protected routes
- Per-hackathon role management

### Security Improvements
- Migrate to httpOnly cookies
- Add CSRF protection
- Implement rate limiting
- Add 2FA support

## Troubleshooting

### "Login failed" with no specific error
- Check that auth API URL is correct in `.env.local`
- Verify auth service is running
- Check browser console for network errors

### Token not persisting
- Check localStorage is enabled
- Verify not in private/incognito mode
- Check for localStorage quota issues

### Auto-login not working
- Check token is stored in localStorage
- Verify `/auth/me` endpoint is accessible
- Check token hasn't expired

### User redirected to login after refresh
- Token may have expired
- Refresh token may be invalid
- Auth service may be unreachable

## Reference

- Auth Service: `lib/auth/auth-service.ts`
- Auth Context: `lib/auth/auth-context.tsx`
- Auth Types: `lib/auth/types.ts`
- Login Page: `app/(auth)/login/page.tsx`
- Signup Page: `app/(auth)/signup/page.tsx`
- User Menu: `components/UserMenu.tsx`

---

**Last Updated:** 2025-12-31
**Version:** 1.0.0
