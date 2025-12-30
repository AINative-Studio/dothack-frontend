import { zeroDBClient } from '@/lib/zerodb'
import { validateUUID } from '@/lib/validation'
import type { UserRole } from './route-protection'

interface HackathonParticipant {
  hackathon_id: string
  participant_id: string
  role: UserRole
}

/**
 * Check if a user has a specific role in a hackathon
 */
export async function hasRole(
  participantId: string,
  hackathonId: string,
  role: UserRole
): Promise<boolean> {
  try {
    validateUUID(participantId, 'participant_id')
    validateUUID(hackathonId, 'hackathon_id')

    const response = await zeroDBClient.queryRows<HackathonParticipant>(
      'hackathon_participants',
      {
        filter: {
          hackathon_id: hackathonId,
          participant_id: participantId,
          role: role
        },
        limit: 1
      }
    )

    return !!(response.success && response.rows && response.rows.length > 0)
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

/**
 * Check if user is an organizer for a hackathon
 */
export async function isOrganizer(
  participantId: string,
  hackathonId: string
): Promise<boolean> {
  return hasRole(participantId, hackathonId, 'ORGANIZER')
}

/**
 * Check if user is a judge for a hackathon
 */
export async function isJudge(
  participantId: string,
  hackathonId: string
): Promise<boolean> {
  return hasRole(participantId, hackathonId, 'JUDGE')
}

/**
 * Check if user is a builder for a hackathon
 */
export async function isBuilder(
  participantId: string,
  hackathonId: string
): Promise<boolean> {
  return hasRole(participantId, hackathonId, 'BUILDER')
}

/**
 * Check if user is a mentor for a hackathon
 */
export async function isMentor(
  participantId: string,
  hackathonId: string
): Promise<boolean> {
  return hasRole(participantId, hackathonId, 'MENTOR')
}

/**
 * Get user's role for a specific hackathon
 */
export async function getUserRole(
  participantId: string,
  hackathonId: string
): Promise<UserRole | null> {
  try {
    validateUUID(participantId, 'participant_id')
    validateUUID(hackathonId, 'hackathon_id')

    const response = await zeroDBClient.queryRows<HackathonParticipant>(
      'hackathon_participants',
      {
        filter: {
          hackathon_id: hackathonId,
          participant_id: participantId
        },
        limit: 1
      }
    )

    if (response.success && response.rows && response.rows.length > 0) {
      return response.rows[0].role
    }

    return null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Get all hackathons where user has a specific role
 */
export async function getHackathonsByRole(
  participantId: string,
  role: UserRole
): Promise<string[]> {
  try {
    validateUUID(participantId, 'participant_id')

    const response = await zeroDBClient.queryRows<HackathonParticipant>(
      'hackathon_participants',
      {
        filter: {
          participant_id: participantId,
          role: role
        }
      }
    )

    if (response.success && response.rows) {
      return response.rows.map(row => row.hackathon_id)
    }

    return []
  } catch (error) {
    console.error('Error getting hackathons by role:', error)
    return []
  }
}

/**
 * Check if user has any role in a hackathon
 */
export async function isParticipant(
  participantId: string,
  hackathonId: string
): Promise<boolean> {
  try {
    validateUUID(participantId, 'participant_id')
    validateUUID(hackathonId, 'hackathon_id')

    const response = await zeroDBClient.queryRows<HackathonParticipant>(
      'hackathon_participants',
      {
        filter: {
          hackathon_id: hackathonId,
          participant_id: participantId
        },
        limit: 1
      }
    )

    return !!(response.success && response.rows && response.rows.length > 0)
  } catch (error) {
    console.error('Error checking participation:', error)
    return false
  }
}
