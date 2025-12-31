'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InvitationCard } from '@/components/invitations/InvitationCard'
import { InvitationActions } from '@/components/invitations/InvitationActions'
import { getInvitationByToken } from '@/lib/api/invitations'
import type { InvitationDetails } from '@/lib/api/invitations'
import { useAuth } from '@/lib/auth/auth-context'

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvitation() {
      try {
        setLoading(true)
        setError(null)
        const data = await getInvitationByToken(token)

        // Check if invitation is expired
        const expiresAt = new Date(data.expires_at)
        if (expiresAt < new Date()) {
          setError('This invitation has expired')
          setInvitation(data) // Still show the card for context
          return
        }

        // Check if already accepted/declined
        if (data.status !== 'PENDING') {
          setError(
            data.status === 'ACCEPTED'
              ? 'This invitation has already been accepted'
              : 'This invitation has been declined'
          )
          setInvitation(data)
          return
        }

        setInvitation(data)
      } catch (err) {
        console.error('Error loading invitation:', err)
        if (err instanceof Error) {
          if (err.message.includes('not yet implemented')) {
            setError('The invitation system is not yet available. Please contact the hackathon organizer directly.')
          } else if (err.message.includes('404') || err.message.includes('not found')) {
            setError('This invitation link is invalid or has been removed')
          } else {
            setError(err.message || 'Failed to load invitation')
          }
        } else {
          setError('Failed to load invitation')
        }
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadInvitation()
    }
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const canAcceptInvitation = invitation && !error && invitation.status === 'PENDING'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {invitation && <InvitationCard invitation={invitation} />}

        {error && invitation && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="ml-3 text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {canAcceptInvitation && (
          <InvitationActions
            invitation={invitation}
            token={token}
            isAuthenticated={isAuthenticated}
            userEmail={user?.email}
          />
        )}

        {!canAcceptInvitation && !error && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
