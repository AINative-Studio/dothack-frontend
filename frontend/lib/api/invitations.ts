import { handleAPIError, showErrorToast, APIError } from '@/lib/error-handling'

export interface Invitation {
  invitation_id: string
  hackathon_id: string
  hackathon_name: string
  invitee_email: string
  invitee_name?: string
  role: 'BUILDER' | 'ORGANIZER' | 'JUDGE' | 'MENTOR'
  inviter_name: string
  custom_message?: string
  token: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  expires_at: string
  created_at: string
}

export interface InvitationDetails extends Invitation {
  hackathon_description?: string
  hackathon_start_at?: string
  hackathon_end_at?: string
}

/**
 * Fetch invitation details by token
 */
export async function getInvitationByToken(token: string): Promise<InvitationDetails> {
  try {
    if (!token || token.trim().length === 0) {
      throw new APIError('Invalid invitation token')
    }

    // In a real implementation, this would call:
    // const response = await fetch(`/api/v1/invitations/${token}`)

    // For now, we'll simulate with a mock response
    // This should be replaced with actual API call when backend is ready

    // Mock implementation - remove when backend is ready
    throw new APIError(
      'Invitations API not yet implemented. Please contact the hackathon organizer.',
      501
    )

    // Real implementation (uncomment when backend ready):
    /*
    const response = await fetch(`/api/v1/invitations/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError('Invitation not found or has expired', 404)
      }
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        errorData.message || errorData.error || 'Failed to fetch invitation',
        response.status
      )
    }

    const data: InvitationDetails = await response.json()
    return data
    */
  } catch (error: any) {
    const apiError = handleAPIError(error, {
      endpoint: `/api/v1/invitations/${token}`,
      method: 'GET'
    })
    throw apiError
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string): Promise<{
  success: boolean
  participant_id?: string
  hackathon_id?: string
}> {
  try {
    if (!token || token.trim().length === 0) {
      throw new APIError('Invalid invitation token')
    }

    // Mock implementation - remove when backend is ready
    throw new APIError(
      'Invitations API not yet implemented. Please contact the hackathon organizer.',
      501
    )

    // Real implementation (uncomment when backend ready):
    /*
    const response = await fetch(`/api/v1/invitations/${token}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError('Invitation not found or has expired', 404)
      }
      if (response.status === 409) {
        throw new APIError('Invitation has already been accepted', 409)
      }
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        errorData.message || errorData.error || 'Failed to accept invitation',
        response.status
      )
    }

    const data = await response.json()
    return {
      success: true,
      participant_id: data.participant_id,
      hackathon_id: data.hackathon_id
    }
    */
  } catch (error: any) {
    const apiError = handleAPIError(error, {
      endpoint: `/api/v1/invitations/${token}/accept`,
      method: 'PUT'
    })
    showErrorToast(apiError, 'Failed to accept invitation')
    throw apiError
  }
}

/**
 * Decline an invitation
 */
export async function declineInvitation(token: string): Promise<{ success: boolean }> {
  try {
    if (!token || token.trim().length === 0) {
      throw new APIError('Invalid invitation token')
    }

    // Mock implementation - remove when backend is ready
    throw new APIError(
      'Invitations API not yet implemented. Please contact the hackathon organizer.',
      501
    )

    // Real implementation (uncomment when backend ready):
    /*
    const response = await fetch(`/api/v1/invitations/${token}/decline`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError('Invitation not found or has expired', 404)
      }
      if (response.status === 409) {
        throw new APIError('Invitation has already been declined', 409)
      }
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        errorData.message || errorData.error || 'Failed to decline invitation',
        response.status
      )
    }

    return { success: true }
    */
  } catch (error: any) {
    const apiError = handleAPIError(error, {
      endpoint: `/api/v1/invitations/${token}/decline`,
      method: 'PUT'
    })
    showErrorToast(apiError, 'Failed to decline invitation')
    throw apiError
  }
}
