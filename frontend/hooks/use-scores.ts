import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Score } from '../lib/types'
import {
  createScore,
  listScores,
  getScoresBySubmission,
  getScoresByJudge,
  getScoresByHackathon,
  parseCriterionScores,
  calculateAverageScore,
  type CreateScoreInput,
  type ListScoresParams,
  type CriterionScore
} from '../lib/api/scores'
import {
  getNextPageParam,
  flattenPages,
  createPaginationParams,
  DEFAULT_PAGE_SIZE,
  type PageSize
} from '../lib/pagination'

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

export function useScoresByHackathon(hackathonId: string) {
  return useQuery({
    queryKey: [SCORES_QUERY_KEY, { hackathon_id: hackathonId }],
    queryFn: () => getScoresByHackathon(hackathonId),
    enabled: !!hackathonId
  })
}

export function useInfiniteScoresByHackathon(
  hackathonId: string,
  pageSize: PageSize = DEFAULT_PAGE_SIZE
) {
  return useInfiniteQuery({
    queryKey: [SCORES_QUERY_KEY, 'infinite', { hackathon_id: hackathonId, pageSize }],
    queryFn: ({ pageParam = 0 }) =>
      listScores({
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

export function useCreateScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateScoreInput) => createScore(input),
    onMutate: async (newScore) => {
      const submissionQueryKey = [SCORES_QUERY_KEY, { submission_id: newScore.submission_id }]
      const judgeQueryKey = [SCORES_QUERY_KEY, { judge_participant_id: newScore.judge_id }]

      await queryClient.cancelQueries({ queryKey: submissionQueryKey })
      await queryClient.cancelQueries({ queryKey: judgeQueryKey })

      const previousSubmissionScores = queryClient.getQueryData<Score[]>(submissionQueryKey)
      const previousJudgeScores = queryClient.getQueryData<Score[]>(judgeQueryKey)

      const optimisticScore: Score = {
        score_id: `temp-${Date.now()}`,
        submission_id: newScore.submission_id,
        judge_id: newScore.judge_id,
        score_json: newScore.score_json,
        total_score: newScore.total_score,
        feedback: newScore.feedback,
      }

      queryClient.setQueryData<Score[]>(submissionQueryKey, (old) =>
        old ? [...old, optimisticScore] : [optimisticScore]
      )

      queryClient.setQueryData<Score[]>(judgeQueryKey, (old) =>
        old ? [...old, optimisticScore] : [optimisticScore]
      )

      return { previousSubmissionScores, previousJudgeScores, submissionQueryKey, judgeQueryKey }
    },
    onError: (_err, _newScore, context) => {
      if (context?.previousSubmissionScores) {
        queryClient.setQueryData(context.submissionQueryKey, context.previousSubmissionScores)
      }
      if (context?.previousJudgeScores) {
        queryClient.setQueryData(context.judgeQueryKey, context.previousJudgeScores)
      }
    },
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
