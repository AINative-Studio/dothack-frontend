import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Track } from '../lib/types'
import {
  createTrack,
  listTracks,
  getTracksByHackathon,
  updateTrack,
  deleteTrack,
  type CreateTrackInput,
  type UpdateTrackInput,
  type ListTracksParams
} from '../lib/api/tracks'

export const TRACKS_QUERY_KEY = 'tracks'

export function useTracks(params: ListTracksParams = {}) {
  return useQuery({
    queryKey: [TRACKS_QUERY_KEY, params],
    queryFn: () => listTracks(params)
  })
}

export function useTracksByHackathon(hackathonId: string) {
  return useQuery({
    queryKey: [TRACKS_QUERY_KEY, { hackathon_id: hackathonId }],
    queryFn: () => getTracksByHackathon(hackathonId),
    enabled: !!hackathonId
  })
}

export function useCreateTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTrackInput) => createTrack(input),
    onMutate: async (newTrack) => {
      const queryKey = [TRACKS_QUERY_KEY, { hackathon_id: newTrack.hackathon_id }]

      await queryClient.cancelQueries({ queryKey })

      const previousTracks = queryClient.getQueryData<Track[]>(queryKey)

      const optimisticTrack: Track = {
        track_id: `temp-${Date.now()}`,
        hackathon_id: newTrack.hackathon_id,
        name: newTrack.name,
        description: newTrack.description,
      }

      queryClient.setQueryData<Track[]>(queryKey, (old) =>
        old ? [...old, optimisticTrack] : [optimisticTrack]
      )

      return { previousTracks, queryKey }
    },
    onError: (_err, _newTrack, context) => {
      if (context?.previousTracks) {
        queryClient.setQueryData(context.queryKey, context.previousTracks)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TRACKS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [TRACKS_QUERY_KEY, { hackathon_id: data.hackathon_id }]
      })
    }
  })
}

export function useUpdateTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTrackInput) => updateTrack(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TRACKS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [TRACKS_QUERY_KEY, { hackathon_id: data.hackathon_id }]
      })
    }
  })
}

export function useDeleteTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (trackId: string) => deleteTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRACKS_QUERY_KEY] })
    }
  })
}
