'use client'

import { format } from 'date-fns'
import type { InvitationDetails } from '@/lib/api/invitations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface InvitationCardProps {
  invitation: InvitationDetails
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const expiresAt = new Date(invitation.expires_at)
  const now = new Date()

  // Check if same calendar day
  const isSameDay =
    expiresAt.getFullYear() === now.getFullYear() &&
    expiresAt.getMonth() === now.getMonth() &&
    expiresAt.getDate() === now.getDate()

  // Check if tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow =
    expiresAt.getFullYear() === tomorrow.getFullYear() &&
    expiresAt.getMonth() === tomorrow.getMonth() &&
    expiresAt.getDate() === tomorrow.getDate()

  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const isExpired = expiresAt < now
  const expiryText = isExpired
    ? 'Expired'
    : isSameDay
    ? 'Expires today'
    : isTomorrow
    ? 'Expires tomorrow'
    : `Expires in ${daysUntilExpiry} days`

  const roleColors = {
    BUILDER: 'bg-blue-100 text-blue-800',
    ORGANIZER: 'bg-purple-100 text-purple-800',
    JUDGE: 'bg-green-100 text-green-800',
    MENTOR: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription className="text-base mt-2">
            {invitation.inviter_name} has invited you to join
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hackathon Name */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {invitation.hackathon_name}
          </h2>
        </div>

        {/* Role Badge */}
        <div className="flex justify-center">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${roleColors[invitation.role]}`}>
            Role: {invitation.role}
          </span>
        </div>

        {/* Description */}
        {invitation.hackathon_description && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 text-center">
              {invitation.hackathon_description}
            </p>
          </div>
        )}

        {/* Custom Message */}
        {invitation.custom_message && (
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">Message from {invitation.inviter_name}:</p>
            <p className="text-blue-800 italic">
              "{invitation.custom_message}"
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dates */}
          {invitation.hackathon_start_at && invitation.hackathon_end_at && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="h-5 w-5 text-gray-400 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Dates</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(invitation.hackathon_start_at), 'MMM d, yyyy')}
                    {' - '}
                    {format(new Date(invitation.hackathon_end_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expiration */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg
                className={`h-5 w-5 mt-0.5 ${isExpired ? 'text-red-400' : 'text-gray-400'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Invitation</p>
                <p className={`text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {expiryText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invitee Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span>Invited as:</span>
            <span className="font-medium text-gray-900">{invitation.invitee_email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
