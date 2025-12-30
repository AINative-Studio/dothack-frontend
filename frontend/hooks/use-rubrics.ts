import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Rubric } from '../lib/types'
import {
  createRubric,
  listRubrics,
  getRubricByHackathon,
  parseCriteria,
  validateCriteria,
  type CreateRubricInput,
  type ListRubricsParams,
  type RubricCriterion
} from '../lib/api/rubrics'

export const RUBRICS_QUERY_KEY = 'rubrics'

export { parseCriteria, validateCriteria, type RubricCriterion }

export function useRubrics(params: ListRubricsParams = {}) {
  return useQuery({
    queryKey: [RUBRICS_QUERY_KEY, params],
    queryFn: () => listRubrics(params)
  })
}

export function useRubricByHackathon(hackathonId: string) {
  return useQuery({
    queryKey: [RUBRICS_QUERY_KEY, { hackathon_id: hackathonId }],
    queryFn: () => getRubricByHackathon(hackathonId),
    enabled: !!hackathonId
  })
}

export function useCreateRubric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRubricInput) => {
      const validationError = validateCriteria(input.criteria)
      if (validationError) {
        throw new Error(validationError)
      }
      return createRubric(input)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [RUBRICS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [RUBRICS_QUERY_KEY, { hackathon_id: data.hackathon_id }]
      })
    }
  })
}
