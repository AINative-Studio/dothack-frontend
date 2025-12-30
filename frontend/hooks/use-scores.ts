import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Score } from '../lib/types'
import {
  createScore,
  listScores,
  getScoresBySubmission,
  getScoresByJudge,
  parseCriterionScores,
  calculateAverageScore,
  type CreateScoreInput,
  type ListScoresParams,
  type CriterionScore
} from '../lib/api/scores'

export const SCORES_QUERY_KEY = 'scores'

export { parseCriterionScores, calculateAverageScore, type CriterionScore }

export function useScores(params: ListScoresParams = {}) {
  return useQuery({
    queryKey: [SCORES_QUERY_KEY, params],
    queryFn: () => listScores(params)
  })
}

export function useScoresBySubmission(submissionId: string) {
  return useQuery({
    queryKey: [SCORES_QUERY_KEY, { submission_id: submissionId }],
    queryFn: () => getScoresBySubmission(submissionId),
    enabled: !!submissionId
  })
}

export function useScoresByJudge(judgeParticipantId: string) {
  return useQuery({
    queryKey: [SCORES_QUERY_KEY, { judge_participant_id: judgeParticipantId }],
    queryFn: () => getScoresByJudge(judgeParticipantId),
    enabled: !!judgeParticipantId
  })
}

export function useCreateScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateScoreInput) => createScore(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SCORES_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [SCORES_QUERY_KEY, { submission_id: data.submission_id }]
      })
      queryClient.invalidateQueries({
        queryKey: [SCORES_QUERY_KEY, { judge_participant_id: data.judge_participant_id }]
      })
    }
  })
}
