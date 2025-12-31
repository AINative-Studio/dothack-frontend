import { useQuery, useMutation, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query'
import type { Prize } from '@/lib/types'
import {
  createPrize,
  getPrizesByHackathon,
  getPrizeById,
  updatePrize,
  deletePrize,
  type CreatePrizeInput,
  type UpdatePrizeInput,
} from '@/lib/api/prizes'

export const PRIZES_QUERY_KEY = 'prizes'

export function usePrizesByHackathon(hackathonId: string | undefined): UseQueryResult<Prize[], Error> {
  return useQuery({
    queryKey: [PRIZES_QUERY_KEY, hackathonId],
    queryFn: () => getPrizesByHackathon(hackathonId!),
    enabled: !!hackathonId,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePrizeById(prizeId: string | undefined): UseQueryResult<Prize | null, Error> {
  return useQuery({
    queryKey: [PRIZES_QUERY_KEY, 'detail', prizeId],
    queryFn: () => getPrizeById(prizeId!),
    enabled: !!prizeId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreatePrize(): UseMutationResult<Prize, Error, CreatePrizeInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPrize,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PRIZES_QUERY_KEY, data.hackathon_id] })
    },
  })
}

export function useUpdatePrize(): UseMutationResult<Prize, Error, UpdatePrizeInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePrize,
    onMutate: async (input) => {
      const prize = await queryClient.getQueryData<Prize | null>([PRIZES_QUERY_KEY, 'detail', input.prize_id])
      if (!prize) return

      await queryClient.cancelQueries({ queryKey: [PRIZES_QUERY_KEY, prize.hackathon_id] })

      const previousPrizes = queryClient.getQueryData<Prize[]>([PRIZES_QUERY_KEY, prize.hackathon_id])

      if (previousPrizes) {
        queryClient.setQueryData<Prize[]>(
          [PRIZES_QUERY_KEY, prize.hackathon_id],
          previousPrizes.map((p) => (p.prize_id === input.prize_id ? { ...p, ...input } : p))
        )
      }

      return { previousPrizes }
    },
    onError: (err, input, context) => {
      const prize = queryClient.getQueryData<Prize | null>([PRIZES_QUERY_KEY, 'detail', input.prize_id])
      if (prize && context?.previousPrizes) {
        queryClient.setQueryData([PRIZES_QUERY_KEY, prize.hackathon_id], context.previousPrizes)
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [PRIZES_QUERY_KEY, data.hackathon_id] })
        queryClient.invalidateQueries({ queryKey: [PRIZES_QUERY_KEY, 'detail', data.prize_id] })
      }
    },
  })
}

export function useDeletePrize(): UseMutationResult<void, Error, { prizeId: string; hackathonId: string }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ prizeId }) => deletePrize(prizeId),
    onMutate: async ({ prizeId, hackathonId }) => {
      await queryClient.cancelQueries({ queryKey: [PRIZES_QUERY_KEY, hackathonId] })

      const previousPrizes = queryClient.getQueryData<Prize[]>([PRIZES_QUERY_KEY, hackathonId])

      if (previousPrizes) {
        queryClient.setQueryData<Prize[]>(
          [PRIZES_QUERY_KEY, hackathonId],
          previousPrizes.filter((p) => p.prize_id !== prizeId)
        )
      }

      return { previousPrizes }
    },
    onError: (err, { hackathonId }, context) => {
      if (context?.previousPrizes) {
        queryClient.setQueryData([PRIZES_QUERY_KEY, hackathonId], context.previousPrizes)
      }
    },
    onSettled: (_, __, { hackathonId }) => {
      queryClient.invalidateQueries({ queryKey: [PRIZES_QUERY_KEY, hackathonId] })
    },
  })
}
