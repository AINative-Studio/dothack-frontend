'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

type AuthMode = 'credentials' | 'apikey'

export function LoginForm() {
  const router = useRouter()
  const { login, loginWithApiKey, isLoading } = useAuth()
  const [mode, setMode] = useState<AuthMode>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'apikey') {
        if (!apiKey.trim()) { setError('Please enter your API key'); return }
        await loginWithApiKey(apiKey.trim())
      } else {
        if (!email || !password) { setError('Please fill in all fields'); return }
        await login({ email, password })
      }
      router.push('/hackathons')
    } catch (err: any) {
      setError(
        mode === 'apikey'
          ? 'Invalid API key. Check your AINative API key and try again.'
          : 'Invalid credentials. Check your AINative email and password.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const busy = isLoading || submitting

  const tabClass = (active: boolean) =>
    `flex-1 py-3 font-mono text-xs uppercase tracking-widest text-center cursor-pointer border-b-2 transition-colors ${
      active
        ? 'border-[#ff4d23] text-[#16140f] font-bold'
        : 'border-transparent text-[#8c8676] hover:text-[#16140f]'
    }`

  return (
    <div>
      <h2
        className="font-archivo font-black uppercase mb-2"
        style={{ fontSize: '36px', lineHeight: '1.05', letterSpacing: '-0.03em', color: '#16140f' }}
      >
        Sign In
      </h2>
      <p className="font-inter text-sm mb-6" style={{ color: '#8c8676' }}>
        Enter your AINative credentials or API key
      </p>

      {/* Auth mode tabs */}
      <div className="flex border-b-2 border-[#e2ddd0] mb-6">
        <button type="button" className={tabClass(mode === 'credentials')} onClick={() => { setMode('credentials'); setError('') }}>
          Email &amp; Password
        </button>
        <button type="button" className={tabClass(mode === 'apikey')} onClick={() => { setMode('apikey'); setError('') }}>
          API Key
        </button>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 text-sm font-inter border-2"
          style={{ borderColor: '#ff4d23', backgroundColor: 'rgba(255,77,35,0.06)', color: '#b8442c' }}
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate autoComplete={mode === 'apikey' ? 'off' : 'on'} data-form-type={mode === 'apikey' ? 'other' : 'login'}>
        {mode === 'credentials' ? (
          <>
            <div className="mb-5">
              <label htmlFor="login-email" className="block font-mono text-xs uppercase mb-2" style={{ color: '#8c8676', letterSpacing: '0.08em' }}>
                Email Address
              </label>
              <input
                id="login-email" type="email" autoComplete="email" required disabled={busy}
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ainative.studio"
                className="w-full px-4 py-3 font-inter text-sm border-2 outline-none transition-colors"
                style={{ backgroundColor: '#fbfaf5', borderColor: '#16140f', color: '#16140f', borderRadius: 0 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d23')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#16140f')}
              />
            </div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block font-mono text-xs uppercase" style={{ color: '#8c8676', letterSpacing: '0.08em' }}>
                  Password
                </label>
                <Link href="/forgot-password" className="font-inter text-xs underline transition-colors" style={{ color: '#8c8676' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password" type="password" autoComplete="current-password" required disabled={busy}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 font-inter text-sm border-2 outline-none transition-colors"
                style={{ backgroundColor: '#fbfaf5', borderColor: '#16140f', color: '#16140f', borderRadius: 0 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d23')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#16140f')}
              />
            </div>
          </>
        ) : (
          <div className="mb-8">
            <label htmlFor="login-apikey" className="block font-mono text-xs uppercase mb-2" style={{ color: '#8c8676', letterSpacing: '0.08em' }}>
              AINative API Key
            </label>
            <input
              id="login-apikey" type="text" autoComplete="off" data-form-type="other" data-lpignore="true" required disabled={busy}
              value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your AINative API key here"
              className="w-full px-4 py-3 font-mono text-sm border-2 outline-none transition-colors"
              style={{ backgroundColor: '#fbfaf5', borderColor: '#16140f', color: '#16140f', borderRadius: 0 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#ff4d23')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#16140f')}
            />
            <p className="font-mono text-xs mt-2" style={{ color: '#8c8676' }}>
              Find your API key in your AINative Studio settings
            </p>
          </div>
        )}

        <button
          type="submit" disabled={busy}
          className="w-full py-4 font-archivo font-black uppercase text-sm tracking-widest border-2 transition-opacity"
          style={{
            backgroundColor: busy ? '#8c8676' : '#ff4d23',
            borderColor: busy ? '#8c8676' : '#ff4d23',
            color: '#f4f1e8', borderRadius: 0, letterSpacing: '0.1em',
            cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center font-inter text-sm" style={{ color: '#8c8676' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold underline transition-colors" style={{ color: '#16140f' }}>
          Sign up
        </Link>
      </p>
    </div>
  )
}
