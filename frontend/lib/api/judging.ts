/**
 * DotHack Judging API
 *
 * Wraps the judging endpoints from the DotHack backend:
 *   GET  /judging/assignments                   — assigned submissions for the judge
 *   POST /judging/scores                        — submit a score for a submission
 *   GET  /judging/hackathons/:id/results        — leaderboard for a hackathon
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JudgeAssignment {
  submission_id: string
  project_name: string
  team_name: string
  track: string
  hackathon_id: string
  status: 'PENDING' | 'SCORED'
}

export interface JudgeAssignmentsResponse {
  assignments: JudgeAssignment[]
}

export interface SubmitScoreParams {
  submission_id: string
  hackathon_id: string
  rubric_id: string
  judge_id: string
  criteria: Record<string, number>
  score: number
  comment?: string
}

export interface ScoreResponse {
  id: string
  submission_id: string
  hackathon_id: string
  rubric_id: string
  judge_id: string
  criteria: Record<string, number>
  score: number
  comment?: string
  created_at: string
}

export interface LeaderboardEntry {
  rank: number
  submission_id: string
  team_name: string
  project_title: string
  total_score: number
  average_score: number
  score_count: number
}

export interface LeaderboardResponse {
  hackathon_id: string
  hackathon_name: string
  entries: LeaderboardEntry[]
  total_entries: number
  last_updated: string
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /judging/assignments */
export async function getJudgeAssignments(
  token: string
): Promise<JudgeAssignmentsResponse> {
  return apiClient<JudgeAssignmentsResponse>('/judging/assignments', { token })
}

/**
 * POST /judging/scores
 *
 * The backend accepts submission_id, hackathon_id, and rubric_id as query
 * parameters while the remaining fields go in the request body.
 */
export async function submitScore(
  params: SubmitScoreParams,
  token: string
): Promise<ScoreResponse> {
  const qs = new URLSearchParams({
    submission_id: params.submission_id,
    hackathon_id: params.hackathon_id,
    rubric_id: params.rubric_id,
  })

  return apiClient<ScoreResponse>(`/judging/scores?${qs.toString()}`, {
    method: 'POST',
    body: JSON.stringify({
      judge_id: params.judge_id,
      criteria: params.criteria,
      score: params.score,
      comment: params.comment,
    }),
    token,
  })
}

/** GET /judging/hackathons/:id/results */
export async function getLeaderboard(
  hackathonId: string,
  token: string
): Promise<LeaderboardResponse> {
  return apiClient<LeaderboardResponse>(`/judging/hackathons/${hackathonId}/results`, {
    token,
  })
}
