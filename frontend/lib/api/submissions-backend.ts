/**
 * DotHack Submissions API
 *
 * Wraps the submissions endpoints from the DotHack backend:
 *   GET /submissions            — list submissions with filters
 *   GET /submissions/:id        — single submission
 *   GET /submissions/:id/similar — semantically similar submissions
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'SCORED'

export interface SubmissionFile {
  file_name: string
  file_type: string
  file_size: number
}

export interface Submission {
  submission_id: string
  team_id: string
  team_name: string
  hackathon_id: string
  hackathon_name: string
  project_name: string
  description: string
  track: string
  status: SubmissionStatus
  repository_url: string | null
  demo_url: string | null
  video_url: string | null
  submitted_at: string
  files: SubmissionFile[]
}

export interface ListSubmissionsParams {
  hackathon_id?: string
  status?: SubmissionStatus
  limit?: number
  skip?: number
}

export interface ListSubmissionsResponse {
  submissions: Submission[]
  total: number
  skip: number
  limit: number
}

export interface SimilarSubmission {
  submission_id: string
  project_name: string
  team_name: string
  description: string
  similarity_score: number
  status: SubmissionStatus
}

export interface SimilarSubmissionsResponse {
  submission_id: string
  similar_submissions: SimilarSubmission[]
  total_found: number
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /submissions */
export async function listSubmissions(
  params: ListSubmissionsParams = {},
  token?: string
): Promise<ListSubmissionsResponse> {
  const qs = new URLSearchParams()
  if (params.hackathon_id) qs.set('hackathon_id', params.hackathon_id)
  if (params.status) qs.set('status', params.status)
  if (params.limit !== undefined) qs.set('limit', String(params.limit))
  if (params.skip !== undefined) qs.set('skip', String(params.skip))
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return apiClient<ListSubmissionsResponse>(`/submissions${query}`, { token })
}

/** GET /submissions/:id */
export async function getSubmission(id: string, token?: string): Promise<Submission> {
  return apiClient<Submission>(`/submissions/${id}`, { token })
}

/** GET /submissions/:id/similar */
export async function getSimilarSubmissions(
  id: string,
  token?: string
): Promise<SimilarSubmissionsResponse> {
  return apiClient<SimilarSubmissionsResponse>(`/submissions/${id}/similar`, { token })
}
