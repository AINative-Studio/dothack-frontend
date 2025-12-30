import { zeroDBClient } from '../zerodb'
import type { Submission } from '../types'

export interface ArtifactLink {
  url: string
  type: string
  label?: string
}

export interface CreateSubmissionInput {
  project_id: string
  hackathon_id: string
  submission_text: string
  artifact_links: ArtifactLink[]
}

export interface ListSubmissionsParams {
  project_id?: string
  hackathon_id?: string
  limit?: number
  offset?: number
}

export interface SubmissionWithMetadata extends Submission {
  namespace: string
}

export function generateSubmissionNamespace(hackathonId: string): string {
  return `hackathons/${hackathonId}/submissions`
}

export async function createSubmission(input: CreateSubmissionInput): Promise<SubmissionWithMetadata> {
  const namespace = generateSubmissionNamespace(input.hackathon_id)

  const submission: Partial<SubmissionWithMetadata> = {
    submission_id: crypto.randomUUID(),
    project_id: input.project_id,
    submitted_at: new Date().toISOString(),
    submission_text: input.submission_text,
    artifact_links_json: JSON.stringify(input.artifact_links),
    namespace
  }

  const response = await zeroDBClient.insertRows<Partial<SubmissionWithMetadata>>('submissions', [submission])

  if (!response.success) {
    throw new Error(response.error || 'Failed to create submission')
  }

  return submission as SubmissionWithMetadata
}

export async function listSubmissions(params: ListSubmissionsParams = {}): Promise<Submission[]> {
  const filter: Record<string, any> = {}

  if (params.project_id) {
    filter.project_id = params.project_id
  }

  if (params.hackathon_id) {
    filter.hackathon_id = params.hackathon_id
  }

  const response = await zeroDBClient.queryRows<Submission>('submissions', {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    limit: params.limit || 100,
    offset: params.offset || 0
  })

  if (!response.success) {
    throw new Error(response.error || 'Failed to list submissions')
  }

  return response.rows || []
}

export async function getSubmissionsByHackathon(hackathonId: string): Promise<Submission[]> {
  return listSubmissions({ hackathon_id: hackathonId })
}

export async function getSubmissionByProject(projectId: string): Promise<Submission | null> {
  const submissions = await listSubmissions({ project_id: projectId, limit: 1 })
  return submissions.length > 0 ? submissions[0] : null
}

export function parseArtifactLinks(submission: Submission): ArtifactLink[] {
  try {
    return JSON.parse(submission.artifact_links_json)
  } catch (error) {
    console.error('Failed to parse artifact links:', error)
    return []
  }
}
