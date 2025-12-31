import { getSubmissionsByHackathon, type Submission } from '@/lib/api/submissions'
import { listRubrics, type Rubric } from '@/lib/api/rubrics'
import { createScore, type CreateScoreInput, type Score } from '@/lib/api/scores'
import { APIError } from '@/lib/error-handling'

export interface JudgingInput {
  hackathonId: string
  submissionId: string
  judgeId: string
  criteriaScores: Record<string, number>
  feedback?: string
}

export interface JudgingResult {
  score: Score
  totalScore: number
}

export interface JudgingError extends Error {
  phase: 'validation' | 'rubric_fetch' | 'score_create'
  submissionId?: string
  canRetry: boolean
}

export async function scoreSubmission(input: JudgingInput): Promise<JudgingResult> {
  const { hackathonId, submissionId, judgeId, criteriaScores, feedback } = input

  if (!submissionId?.trim()) {
    throw createJudgingError('validation', 'Submission ID is required', false)
  }

  if (!judgeId?.trim()) {
    throw createJudgingError('validation', 'Judge ID is required', false)
  }

  if (!criteriaScores || Object.keys(criteriaScores).length === 0) {
    throw createJudgingError('validation', 'At least one criterion score is required', false)
  }

  let rubric: Rubric

  try {
    const rubrics = await listRubrics({ hackathon_id: hackathonId, limit: 1 })

    if (!rubrics || rubrics.length === 0) {
      throw new Error('No rubric found for this hackathon')
    }

    rubric = rubrics[0]
  } catch (error) {
    throw createJudgingError(
      'rubric_fetch',
      `Failed to fetch rubric: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    )
  }

  let criteria: Record<string, { weight: number; max_score: number }>

  try {
    criteria = JSON.parse(rubric.criteria_json)
  } catch (error) {
    throw createJudgingError(
      'validation',
      'Invalid rubric criteria format',
      false,
      submissionId
    )
  }

  for (const criterionName of Object.keys(criteria)) {
    if (!(criterionName in criteriaScores)) {
      throw createJudgingError(
        'validation',
        `Missing score for criterion: ${criterionName}`,
        false,
        submissionId
      )
    }

    const score = criteriaScores[criterionName]
    const maxScore = criteria[criterionName].max_score

    if (score < 0 || score > maxScore) {
      throw createJudgingError(
        'validation',
        `Score for ${criterionName} must be between 0 and ${maxScore}`,
        false,
        submissionId
      )
    }
  }

  const totalScore = calculateTotalScore(criteriaScores, criteria)

  let score: Score

  try {
    score = await createScore({
      submission_id: submissionId,
      judge_id: judgeId,
      score_json: JSON.stringify(criteriaScores),
      total_score: totalScore,
      feedback,
    })
  } catch (error) {
    throw createJudgingError(
      'score_create',
      `Failed to create score: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true,
      submissionId
    )
  }

  return {
    score,
    totalScore,
  }
}

export function calculateTotalScore(
  criteriaScores: Record<string, number>,
  criteria: Record<string, { weight: number; max_score: number }>
): number {
  let weightedSum = 0
  let totalWeight = 0

  for (const [criterionName, criterionScore] of Object.entries(criteriaScores)) {
    const criterion = criteria[criterionName]
    if (criterion) {
      const normalizedScore = criterionScore / criterion.max_score
      weightedSum += normalizedScore * criterion.weight
      totalWeight += criterion.weight
    }
  }

  if (totalWeight === 0) {
    return 0
  }

  return (weightedSum / totalWeight) * 100
}

export async function getSubmissionsForJudging(
  hackathonId: string,
  trackId?: string
): Promise<Submission[]> {
  try {
    const submissions = await getSubmissionsByHackathon(hackathonId)

    if (!trackId) {
      return submissions
    }

    return submissions
  } catch (error) {
    throw new APIError(
      `Failed to fetch submissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}

export function validateAllCriteriaScored(
  criteriaScores: Record<string, number>,
  criteria: Record<string, { weight: number; max_score: number }>
): boolean {
  const criteriaNames = Object.keys(criteria)
  const scoredCriteria = Object.keys(criteriaScores)

  return criteriaNames.every((name) => scoredCriteria.includes(name))
}

function createJudgingError(
  phase: JudgingError['phase'],
  message: string,
  canRetry: boolean,
  submissionId?: string
): JudgingError {
  const error = new Error(message) as JudgingError
  error.name = 'JudgingError'
  error.phase = phase
  error.canRetry = canRetry
  error.submissionId = submissionId
  return error
}

export function isJudgingError(error: unknown): error is JudgingError {
  return error instanceof Error && error.name === 'JudgingError'
}
