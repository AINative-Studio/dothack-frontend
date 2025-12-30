import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Participant, HackathonParticipant } from '../lib/types'
import {
  createParticipant,
  enrollParticipant,
  registerAndEnroll,
  listParticipants,
  listHackathonParticipants,
  getParticipantsByHackathon,
  getParticipantsByRole,
  type CreateParticipantInput,
  type EnrollParticipantInput,
  type ListParticipantsParams,
  type ListHackathonParticipantsParams
} from '../lib/api/participants'

export const PARTICIPANTS_QUERY_KEY = 'participants'
export const HACKATHON_PARTICIPANTS_QUERY_KEY = 'hackathon_participants'

export function useParticipants(params: ListParticipantsParams = {}) {
  return useQuery({
    queryKey: [PARTICIPANTS_QUERY_KEY, params],
    queryFn: () => listParticipants(params)
  })
}

export function useHackathonParticipants(params: ListHackathonParticipantsParams = {}) {
  return useQuery({
    queryKey: [HACKATHON_PARTICIPANTS_QUERY_KEY, params],
    queryFn: () => listHackathonParticipants(params)
  })
}

export function useParticipantsByHackathon(hackathonId: string) {
  return useQuery({
    queryKey: [HACKATHON_PARTICIPANTS_QUERY_KEY, { hackathon_id: hackathonId }],
    queryFn: () => getParticipantsByHackathon(hackathonId),
    enabled: !!hackathonId
  })
}

export function useParticipantsByRole(
  hackathonId: string,
  role: 'BUILDER' | 'JUDGE' | 'MENTOR' | 'ORGANIZER' | 'SPONSOR'
) {
  return useQuery({
    queryKey: [HACKATHON_PARTICIPANTS_QUERY_KEY, { hackathon_id: hackathonId, role }],
    queryFn: () => getParticipantsByRole(hackathonId, role),
    enabled: !!hackathonId
  })
}

export function useCreateParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateParticipantInput) => createParticipant(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTICIPANTS_QUERY_KEY] })
    }
  })
}

export function useEnrollParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EnrollParticipantInput) => enrollParticipant(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [HACKATHON_PARTICIPANTS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [HACKATHON_PARTICIPANTS_QUERY_KEY, { hackathon_id: data.hackathon_id }]
      })
    }
  })
}

export function useRegisterAndEnroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      participant: CreateParticipantInput
      enrollment: Omit<EnrollParticipantInput, 'participant_id'>
    }) => registerAndEnroll(input.participant, input.enrollment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PARTICIPANTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [HACKATHON_PARTICIPANTS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [HACKATHON_PARTICIPANTS_QUERY_KEY, { hackathon_id: data.enrollment.hackathon_id }]
      })
    }
  })
}
