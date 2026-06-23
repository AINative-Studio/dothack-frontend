'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      await login({ email, password })
      router.push('/hackathons')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.')
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
        Sign In
      </h2>
      <p
        className="font-inter text-sm mb-8"
        style={{ color: '#8c8676' }}
      >
        Enter your AINative credentials to continue
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
        {/* Email */}
        <div className="mb-5">
          <label
            htmlFor="login-email"
            className="block font-mono text-xs uppercase mb-2"
            style={{ color: '#8c8676', letterSpacing: '0.08em' }}
          >
            Email Address
          </label>
          <input
            id="login-email"
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="login-password"
              className="block font-mono text-xs uppercase"
              style={{ color: '#8c8676', letterSpacing: '0.08em' }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-inter text-xs underline transition-colors"
              style={{ color: '#8c8676' }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
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
          {busy ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Footer link */}
      <p
        className="mt-6 text-center font-inter text-sm"
        style={{ color: '#8c8676' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold underline transition-colors"
          style={{ color: '#16140f' }}
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
