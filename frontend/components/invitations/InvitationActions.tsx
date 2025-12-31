'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvitation, declineInvitation } from '@/lib/api/invitations'
import type { InvitationDetails } from '@/lib/api/invitations'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface InvitationActionsProps {
  invitation: InvitationDetails
  token: string
  isAuthenticated: boolean
  userEmail?: string
}

export function InvitationActions({
  invitation,
  token,
  isAuthenticated,
  userEmail,
}: InvitationActionsProps) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [showDeclineDialog, setShowDeclineDialog] = useState(false)

  // Check if authenticated user email matches invitation email
  const emailMismatch = isAuthenticated && userEmail && userEmail !== invitation.invitee_email

  async function handleAccept() {
    if (!isAuthenticated) {
      // Store token to redirect back after signup
      sessionStorage.setItem('pending_invitation', token)
      router.push(`/signup?email=${encodeURIComponent(invitation.invitee_email)}&redirect=/invitations/${token}`)
      return
    }

    if (emailMismatch) {
      toast.error('Email mismatch', {
        description: `This invitation is for ${invitation.invitee_email}, but you're logged in as ${userEmail}. Please log out and sign up with the invited email.`,
      })
      return
    }

    try {
      setAccepting(true)
      await acceptInvitation(token)

      toast.success('Invitation accepted!', {
        description: `You've joined ${invitation.hackathon_name} as a ${invitation.role}`,
      })

      // Redirect to hackathon page
      setTimeout(() => {
        router.push(`/hackathons/${invitation.hackathon_id}`)
      }, 1500)
    } catch (error) {
      console.error('Error accepting invitation:', error)
      if (error instanceof Error) {
        if (error.message.includes('not yet implemented')) {
          toast.error('Feature unavailable', {
            description: 'The invitation system is not yet available. Please contact the hackathon organizer.',
          })
        } else {
          toast.error('Failed to accept invitation', {
            description: error.message || 'Please try again later',
          })
        }
      } else {
        toast.error('Failed to accept invitation')
      }
    } finally {
      setAccepting(false)
    }
  }

  async function handleDecline() {
    try {
      setDeclining(true)
      await declineInvitation(token)

      toast.success('Invitation declined', {
        description: `You've declined the invitation to ${invitation.hackathon_name}`,
      })

      // Redirect to home after brief delay
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Error declining invitation:', error)
      if (error instanceof Error) {
        if (error.message.includes('not yet implemented')) {
          toast.error('Feature unavailable', {
            description: 'The invitation system is not yet available. Please contact the hackathon organizer.',
          })
        } else {
          toast.error('Failed to decline invitation', {
            description: error.message || 'Please try again later',
          })
        }
      } else {
        toast.error('Failed to decline invitation')
      }
    } finally {
      setDeclining(false)
      setShowDeclineDialog(false)
    }
  }

  return (
    <>
      <div className="mt-8 space-y-4">
        {/* Email mismatch warning */}
        {emailMismatch && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-yellow-400 mt-0.5"
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
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Email Mismatch</p>
                <p className="mt-1 text-sm text-yellow-700">
                  This invitation is for <strong>{invitation.invitee_email}</strong>, but you're
                  logged in as <strong>{userEmail}</strong>. Please log out and sign up with the
                  invited email to accept this invitation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Not authenticated info */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Account Required</p>
                <p className="mt-1 text-sm text-blue-700">
                  You'll need to create an account or sign in to accept this invitation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAccept}
            disabled={accepting || declining || emailMismatch}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
          >
            {accepting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                Accepting...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 mr-2 inline"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {!isAuthenticated ? 'Sign Up & Accept' : 'Accept Invitation'}
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowDeclineDialog(true)}
            disabled={accepting || declining}
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:bg-gray-50 py-6 text-lg font-semibold"
          >
            <svg
              className="h-5 w-5 mr-2 inline"
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
            Decline
          </Button>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-500">
          Have questions?{' '}
          <a
            href={`mailto:${invitation.inviter_email}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact {invitation.inviter_name}
          </a>
        </p>
      </div>

      {/* Decline confirmation dialog */}
      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline the invitation to join{' '}
              <strong>{invitation.hackathon_name}</strong> as a <strong>{invitation.role}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={declining}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              disabled={declining}
              className="bg-red-600 hover:bg-red-700"
            >
              {declining ? 'Declining...' : 'Decline Invitation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
