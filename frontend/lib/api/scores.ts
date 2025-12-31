import { zeroDBClient } from '../zerodb'
import type { Score } from '../types'

export interface CriterionScore {
  criterion_id: string
  score: number
}

export interface CreateScoreInput {
  submission_id: string
  judge_participant_id: string
  criterion_scores: CriterionScore[]
  feedback?: string
}

export interface ListScoresParams {
  submission_id?: string
  judge_participant_id?: string
  limit?: number
  offset?: number
}

export function calculateTotalScore(criterionScores: CriterionScore[]): number {
  return criterionScores.reduce((sum, cs) => sum + cs.score, 0)
}

export async function createScore(input: CreateScoreInput): Promise<Score> {
  const totalScore = calculateTotalScore(input.criterion_scores)

  const score: Partial<Score> = {
    score_id: crypto.randomUUID(),
    submission_id: input.submission_id,
    judge_participant_id: input.judge_participant_id,
    score_json: JSON.stringify(input.criterion_scores),
    total_score: totalScore,
    feedback: input.feedback
  }

  const response = await zeroDBClient.insertRows<Partial<Score>>('scores', [score])

  if (!response.success) {
    throw new Error(response.error || 'Failed to create score')
  }

  return score as Score
}

export async function listScores(params: ListScoresParams = {}): Promise<Score[]> {
  const filter: Record<string, any> = {}

  if (params.submission_id) {
    filter.submission_id = params.submission_id
  }

  if (params.judge_participant_id) {
    filter.judge_participant_id = params.judge_participant_id
  }

  const response = await zeroDBClient.queryRows<Score>('scores', {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    limit: params.limit || 100,
    offset: params.offset || 0
  })

  if (!response.success) {
    throw new Error(response.error || 'Failed to list scores')
  }

  return response.rows || []
}

export async function getScoresBySubmission(submissionId: string): Promise<Score[]> {
  return listScores({ submission_id: submissionId })
}

export async function getScoresByJudge(judgeParticipantId: string): Promise<Score[]> {
  return listScores({ judge_participant_id: judgeParticipantId })
}

export function parseCriterionScores(score: Score): CriterionScore[] {
  try {
    return JSON.parse(score.score_json)
  } catch (error) {
    console.error('Failed to parse criterion scores:', error)
    return []
  }
}

export function calculateAverageScore(scores: Score[]): number {
  if (scores.length === 0) return 0
  const sum = scores.reduce((acc, score) => acc + score.total_score, 0)
  return sum / scores.length
}

export async function getScoresByHackathon(hackathonId: string): Promise<Score[]> {
  // Get all submissions for this hackathon
  const submissionsResponse = await zeroDBClient.queryRows('submissions', {
    filter: { hackathon_id: hackathonId },
  })

  if (!submissionsResponse.success || !submissionsResponse.rows || submissionsResponse.rows.length === 0) {
    return []
  }

  const submissionIds = submissionsResponse.rows.map((s: any) => s.submission_id)

  // Get all scores
  const response = await zeroDBClient.queryRows<Score>('scores', {
    limit: 1000,
  })

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch scores')
  }

  // Filter scores to only those matching our submission IDs
  const allScores = response.rows || []
  return allScores.filter(s => submissionIds.includes(s.submission_id))
}
