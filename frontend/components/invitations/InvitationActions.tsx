'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { UseMutationResult } from '@tanstack/react-query'

interface InvitationActionsProps {
  invitation: any
  invToken: string
  isAuthenticated: boolean
  userEmail?: string
  acceptMutation: UseMutationResult<any, Error, { invToken: string; email: string; name?: string }>
  declineMutation: UseMutationResult<any, Error, { invToken: string }>
}

export function InvitationActions({
  invitation,
  invToken,
  isAuthenticated,
  userEmail,
  acceptMutation,
  declineMutation,
}: InvitationActionsProps) {
  const router = useRouter()
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)

  const inviteeEmail = invitation.invitee_email ?? invitation.email ?? ''
  const hackathonName = invitation.hackathon_name ?? invitation.hackathon?.name ?? 'this hackathon'
  const emailMismatch = isAuthenticated && userEmail && userEmail !== inviteeEmail

  async function handleAccept() {
    if (!isAuthenticated) {
      sessionStorage.setItem('pending_invitation', invToken)
      router.push(`/signup?email=${encodeURIComponent(inviteeEmail)}&redirect=/invitations/${invToken}`)
      return
    }

    if (emailMismatch) {
      toast.error('Email mismatch', {
        description: `This invitation is for ${inviteeEmail}, but you are logged in as ${userEmail}.`,
      })
      return
    }

    try {
      await acceptMutation.mutateAsync({ invToken, email: inviteeEmail })
      toast.success('Invitation accepted!', {
        description: `You have joined ${hackathonName} as a ${invitation.role}.`,
      })
      setTimeout(() => {
        router.push(`/hackathons/${invitation.hackathon_id}`)
      }, 1500)
    } catch (err) {
      toast.error('Failed to accept invitation', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  }

  async function handleDecline() {
    try {
      await declineMutation.mutateAsync({ invToken })
      toast.success('Invitation declined', {
        description: `You have declined the invitation to ${hackathonName}.`,
      })
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      toast.error('Failed to decline invitation', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setShowDeclineConfirm(false)
    }
  }

  const accepting = acceptMutation.isPending
  const declining = declineMutation.isPending

  // Shared button base styles
  const baseBtn: React.CSSProperties = {
    flex: 1,
    padding: '0.875rem 1.5rem',
    fontFamily: 'Archivo, sans-serif',
    fontWeight: 700,
    fontSize: '1rem',
    borderRadius: 0,
    cursor: accepting || declining ? 'not-allowed' : 'pointer',
    opacity: accepting || declining ? 0.7 : 1,
    transition: 'opacity 0.15s',
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Email mismatch warning */}
      {emailMismatch && (
        <div
          style={{
            border: '2px solid #16140f',
            background: '#f4f1e8',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: '#16140f', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Email Mismatch
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8c8676', fontSize: '0.8rem' }}>
            This invitation is for <strong style={{ color: '#16140f' }}>{inviteeEmail}</strong>, but
            you are signed in as <strong style={{ color: '#16140f' }}>{userEmail}</strong>. Please
            sign out and use the invited email to accept.
          </p>
        </div>
      )}

      {/* Unauthenticated notice */}
      {!isAuthenticated && (
        <div
          style={{
            border: '2px solid #16140f',
            background: '#f4f1e8',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: '#16140f', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Account Required
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8c8676', fontSize: '0.8rem' }}>
            You will need to create an account or sign in to accept this invitation.
          </p>
        </div>
      )}

      {/* Primary action buttons */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem' }}>
        <button
          onClick={handleAccept}
          disabled={accepting || declining || !!emailMismatch}
          style={{
            ...baseBtn,
            background: '#ff4d23',
            color: '#f4f1e8',
            border: '2px solid #ff4d23',
            opacity: accepting || declining || emailMismatch ? 0.6 : 1,
          }}
        >
          {accepting ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '0.875rem',
                  height: '0.875rem',
                  border: '2px solid #f4f1e8',
                  borderRightColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  marginRight: '0.5rem',
                  verticalAlign: 'middle',
                }}
              />
              Accepting...
            </>
          ) : isAuthenticated ? (
            'Accept Invitation'
          ) : (
            'Sign Up & Accept'
          )}
        </button>

        <button
          onClick={() => setShowDeclineConfirm(true)}
          disabled={accepting || declining}
          style={{
            ...baseBtn,
            background: 'transparent',
            color: '#16140f',
            border: '2px solid #16140f',
          }}
        >
          Decline
        </button>
      </div>

      {/* Inline decline confirmation */}
      {showDeclineConfirm && (
        <div
          style={{
            marginTop: '1rem',
            border: '2px solid #16140f',
            background: '#f4f1e8',
            padding: '1.25rem',
          }}
        >
          <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: '#16140f', marginBottom: '0.5rem' }}>
            Decline Invitation?
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8c8676', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Are you sure you want to decline the invitation to join{' '}
            <strong style={{ color: '#16140f' }}>{hackathonName}</strong> as a{' '}
            <strong style={{ color: '#16140f' }}>{invitation.role}</strong>? This action cannot be
            undone.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowDeclineConfirm(false)}
              disabled={declining}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'transparent',
                color: '#16140f',
                border: '2px solid #16140f',
                borderRadius: 0,
                fontFamily: 'Archivo, sans-serif',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDecline}
              disabled={declining}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#16140f',
                color: '#f4f1e8',
                border: '2px solid #16140f',
                borderRadius: 0,
                fontFamily: 'Archivo, sans-serif',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: declining ? 'not-allowed' : 'pointer',
                opacity: declining ? 0.6 : 1,
              }}
            >
              {declining ? 'Declining...' : 'Decline Invitation'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
