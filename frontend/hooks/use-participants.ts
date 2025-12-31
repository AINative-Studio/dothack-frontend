import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import {
  getNextPageParam,
  flattenPages,
  createPaginationParams,
  DEFAULT_PAGE_SIZE,
  type PageSize
} from '../lib/pagination'

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

export function useInfiniteParticipantsByHackathon(
  hackathonId: string,
  pageSize: PageSize = DEFAULT_PAGE_SIZE
) {
  return useInfiniteQuery({
    queryKey: [HACKATHON_PARTICIPANTS_QUERY_KEY, 'infinite', { hackathon_id: hackathonId, pageSize }],
    queryFn: ({ pageParam = 0 }) =>
      listHackathonParticipants({
        hackathon_id: hackathonId,
        ...createPaginationParams(pageSize, pageParam)
      }),
    getNextPageParam: (lastPage, allPages) => getNextPageParam(lastPage, allPages, pageSize),
    enabled: !!hackathonId,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      items: flattenPages(data.pages)
    })
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
