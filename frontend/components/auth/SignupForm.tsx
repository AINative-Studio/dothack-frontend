'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
  return null
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null

  const strength =
    password.length < 8
      ? { label: 'Weak', width: '33%', color: '#ff4d23' }
      : validatePassword(password)
      ? { label: 'Fair', width: '66%', color: '#9a7b1a' }
      : { label: 'Strong', width: '100%', color: '#9fe0ac' }

  return (
    <div className="mt-2">
      <div
        className="h-0.5 w-full"
        style={{ backgroundColor: '#ddd6c6' }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{ width: strength.width, backgroundColor: strength.color }}
        />
      </div>
      <p
        className="mt-1 font-mono text-xs uppercase"
        style={{ color: strength.color, letterSpacing: '0.06em' }}
      >
        {strength.label}
      </p>
    </div>
  )
}

export function SignupForm() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const pwdError = validatePassword(password)
    if (pwdError) {
      setError(pwdError)
      return
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions to continue')
      return
    }

    setSubmitting(true)
    try {
      await signup({ name, email, password })
      router.push('/hackathons')
    } catch (err: any) {
      setError(err.message || 'Account creation failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const busy = isLoading || submitting

  return (
    <div>
      {/* Page heading */}
      <h2
        className="font-archivo font-black uppercase mb-2"
        style={{
          fontSize: '36px',
          lineHeight: '1.05',
          letterSpacing: '-0.03em',
          color: '#16140f',
        }}
      >
        Create Account
      </h2>
      <p
        className="font-mono text-xs uppercase mb-8"
        style={{ color: '#8c8676', letterSpacing: '0.06em' }}
      >
        Uses your AINative Studio account
      </p>

      {/* Error banner */}
      {error && (
        <div
          className="mb-6 px-4 py-3 text-sm font-inter border-2"
          style={{
            borderColor: '#ff4d23',
            backgroundColor: 'rgba(255,77,35,0.06)',
            color: '#b8442c',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full name */}
        <div className="mb-5">
          <label
            htmlFor="signup-name"
            className="block font-mono text-xs uppercase mb-2"
            style={{ color: '#8c8676', letterSpacing: '0.08em' }}
          >
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            required
            disabled={busy}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="w-full px-4 py-3 font-inter text-sm border-2 outline-none transition-colors"
            style={{
              backgroundColor: '#fbfaf5',
              borderColor: '#16140f',
              color: '#16140f',
              borderRadius: 0,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d23')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#16140f')}
          />
        </div>

        {/* Email */}
        <div className="mb-5">
          <label
            htmlFor="signup-email"
            className="block font-mono text-xs uppercase mb-2"
            style={{ color: '#8c8676', letterSpacing: '0.08em' }}
          >
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            disabled={busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@ainative.studio"
            className="w-full px-4 py-3 font-inter text-sm border-2 outline-none transition-colors"
            style={{
              backgroundColor: '#fbfaf5',
              borderColor: '#16140f',
              color: '#16140f',
              borderRadius: 0,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d23')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#16140f')}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label
            htmlFor="signup-password"
            className="block font-mono text-xs uppercase mb-2"
            style={{ color: '#8c8676', letterSpacing: '0.08em' }}
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            disabled={busy}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 font-inter text-sm border-2 outline-none transition-colors"
            style={{
              backgroundColor: '#fbfaf5',
              borderColor: '#16140f',
              color: '#16140f',
              borderRadius: 0,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d23')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#16140f')}
          />
          <PasswordStrengthBar password={password} />
        </div>

        {/* Confirm password */}
        <div className="mb-7">
          <label
            htmlFor="signup-confirm-password"
            className="block font-mono text-xs uppercase mb-2"
            style={{ color: '#8c8676', letterSpacing: '0.08em' }}
          >
            Confirm Password
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            autoComplete="new-password"
            required
            disabled={busy}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 font-inter text-sm border-2 outline-none transition-colors"
            style={{
              backgroundColor: '#fbfaf5',
              borderColor:
                confirmPassword && confirmPassword !== password
                  ? '#ff4d23'
                  : '#16140f',
              color: '#16140f',
              borderRadius: 0,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d23')}
            onBlur={(e) =>
              (e.currentTarget.style.borderColor =
                confirmPassword && confirmPassword !== password
                  ? '#ff4d23'
                  : '#16140f')
            }
          />
          {confirmPassword && confirmPassword !== password && (
            <p
              className="mt-1 font-mono text-xs uppercase"
              style={{ color: '#ff4d23', letterSpacing: '0.06em' }}
            >
              Passwords do not match
            </p>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="mb-8 flex items-start gap-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={acceptTerms}
            onClick={() => setAcceptTerms(!acceptTerms)}
            disabled={busy}
            className="mt-0.5 w-5 h-5 border-2 flex-shrink-0 flex items-center justify-center transition-colors"
            style={{
              borderColor: '#16140f',
              backgroundColor: acceptTerms ? '#16140f' : 'transparent',
              borderRadius: 0,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
            aria-label="Accept terms and conditions"
          >
            {acceptTerms && (
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
              >
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="#f4f1e8"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            )}
          </button>
          <p className="font-inter text-sm" style={{ color: '#8c8676' }}>
            I agree to the{' '}
            <Link
              href="/terms"
              className="underline transition-colors"
              style={{ color: '#16140f' }}
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline transition-colors"
              style={{ color: '#16140f' }}
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-4 font-archivo font-black uppercase text-sm tracking-widest border-2 transition-opacity"
          style={{
            backgroundColor: busy ? '#8c8676' : '#ff4d23',
            borderColor: busy ? '#8c8676' : '#ff4d23',
            color: '#f4f1e8',
            borderRadius: 0,
            letterSpacing: '0.1em',
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Footer link */}
      <p
        className="mt-6 text-center font-inter text-sm"
        style={{ color: '#8c8676' }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold underline transition-colors"
          style={{ color: '#16140f' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
