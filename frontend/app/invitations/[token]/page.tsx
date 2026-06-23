'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useInvitationByToken, useAcceptInvitation, useDeclineInvitation } from '@/hooks/use-api'
import { InvitationCard } from '@/components/invitations/InvitationCard'
import { InvitationActions } from '@/components/invitations/InvitationActions'

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user, token: authToken } = useAuth()
  const invToken = params.token as string

  const { data: invitation, isLoading, error } = useInvitationByToken(invToken)
  const acceptMutation = useAcceptInvitation()
  const declineMutation = useDeclineInvitation()

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#f4f1e8' }}
      >
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin border-4 border-solid border-r-transparent"
            style={{ borderColor: '#16140f', borderRightColor: 'transparent' }}
          />
          <p
            className="mt-4"
            style={{ fontFamily: 'Inter, sans-serif', color: '#16140f', opacity: 0.6 }}
          >
            Loading invitation...
          </p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Hard error — no invitation to show
  // ---------------------------------------------------------------------------
  if (error && !invitation) {
    const msg =
      error instanceof Error
        ? error.message.includes('404') || error.message.includes('not found')
          ? 'This invitation link is invalid or has been removed.'
          : error.message
        : 'Failed to load invitation.'

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#f4f1e8' }}
      >
        <div
          className="max-w-md w-full p-8 text-center"
          style={{ border: '2px solid #16140f', background: '#f4f1e8' }}
        >
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center mb-4"
            style={{ border: '2px solid #16140f' }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#ff4d23' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#16140f', marginBottom: '0.5rem' }}>
            Invalid Invitation
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8c8676', marginBottom: '1.5rem' }}>{msg}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: '#ff4d23',
              color: '#f4f1e8',
              border: '2px solid #ff4d23',
              borderRadius: 0,
              fontFamily: 'Archivo, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Status checks
  // ---------------------------------------------------------------------------
  const expiresAt = invitation ? new Date(invitation.expires_at) : null
  const isExpired = expiresAt ? expiresAt < new Date() : false
  const isPending = invitation?.status === 'PENDING'
  const canAct = isPending && !isExpired

  const statusWarning = isExpired
    ? 'This invitation has expired.'
    : !isPending && invitation?.status === 'ACCEPTED'
    ? 'This invitation has already been accepted.'
    : !isPending && invitation?.status === 'DECLINED'
    ? 'This invitation has been declined.'
    : null

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ background: '#f4f1e8' }}
    >
      <div className="max-w-2xl mx-auto">
        {invitation && (
          <InvitationCard invitation={invitation} />
        )}

        {statusWarning && (
          <div
            className="mt-6 p-4"
            style={{ border: '2px solid #16140f', background: '#f4f1e8' }}
          >
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#8c8676', fontSize: '0.875rem' }}>
              {statusWarning}
            </p>
          </div>
        )}

        {canAct && invitation && (
          <InvitationActions
            invitation={invitation}
            invToken={invToken}
            isAuthenticated={isAuthenticated}
            userEmail={user?.email}
            acceptMutation={acceptMutation}
            declineMutation={declineMutation}
          />
        )}

        {!canAct && !statusWarning && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontWeight: 700,
                color: '#ff4d23',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
