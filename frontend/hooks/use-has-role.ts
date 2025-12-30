import { useQuery } from '@tanstack/react-query'
import { getUserRole, isOrganizer, isJudge, isBuilder, isMentor, isParticipant } from '@/lib/auth/check-role'
import type { UserRole } from '@/lib/auth/route-protection'

/**
 * Hook to check if user has a specific role in a hackathon
 */
export function useHasRole(
  participantId: string | undefined,
  hackathonId: string | undefined,
  role: UserRole
) {
  return useQuery({
    queryKey: ['user-role', participantId, hackathonId, role],
    queryFn: async () => {
      if (!participantId || !hackathonId) {
        return false
      }

      switch (role) {
        case 'ORGANIZER':
          return isOrganizer(participantId, hackathonId)
        case 'JUDGE':
          return isJudge(participantId, hackathonId)
        case 'BUILDER':
          return isBuilder(participantId, hackathonId)
        case 'MENTOR':
          return isMentor(participantId, hackathonId)
        default:
          return false
      }
    },
    enabled: !!participantId && !!hackathonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get user's role for a specific hackathon
 */
export function useUserRole(
  participantId: string | undefined,
  hackathonId: string | undefined
) {
  return useQuery({
    queryKey: ['user-role', participantId, hackathonId],
    queryFn: () => {
      if (!participantId || !hackathonId) {
        return null
      }
      return getUserRole(participantId, hackathonId)
    },
    enabled: !!participantId && !!hackathonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to check if user is an organizer
 */
export function useIsOrganizer(
  participantId: string | undefined,
  hackathonId: string | undefined
) {
  return useHasRole(participantId, hackathonId, 'ORGANIZER')
}

/**
 * Hook to check if user is a judge
 */
export function useIsJudge(
  participantId: string | undefined,
  hackathonId: string | undefined
) {
  return useHasRole(participantId, hackathonId, 'JUDGE')
}

/**
 * Hook to check if user is a builder
 */
export function useIsBuilder(
  participantId: string | undefined,
  hackathonId: string | undefined
) {
  return useHasRole(participantId, hackathonId, 'BUILDER')
}

/**
 * Hook to check if user is a mentor
 */
export function useIsMentor(
  participantId: string | undefined,
  hackathonId: string | undefined
) {
  return useHasRole(participantId, hackathonId, 'MENTOR')
}

/**
 * Hook to check if user is a participant (has any role)
 */
export function useIsParticipant(
  participantId: string | undefined,
  hackathonId: string | undefined
) {
  return useQuery({
    queryKey: ['is-participant', participantId, hackathonId],
    queryFn: () => {
      if (!participantId || !hackathonId) {
        return false
      }
      return isParticipant(participantId, hackathonId)
    },
    enabled: !!participantId && !!hackathonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
