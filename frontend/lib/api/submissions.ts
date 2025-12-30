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

export interface SubmissionEmbeddingMetadata {
  hackathon_id: string
  track_id?: string
  team_id: string
  project_id: string
  submitted_at: string
}

export async function createSubmissionWithEmbedding(
  input: CreateSubmissionInput,
  metadata: SubmissionEmbeddingMetadata
): Promise<SubmissionWithMetadata> {
  const submission = await createSubmission(input)

  const namespace = submission.namespace

  try {
    const embeddingResponse = await zeroDBClient.embedAndStore({
      documents: [{
        id: `submission:${submission.submission_id}`,
        text: submission.submission_text,
        metadata: {
          hackathon_id: metadata.hackathon_id,
          track_id: metadata.track_id,
          team_id: metadata.team_id,
          project_id: metadata.project_id,
          submitted_at: metadata.submitted_at
        }
      }],
      namespace
    })

    if (!embeddingResponse.success) {
      console.error('Embedding storage failed:', embeddingResponse.error)
      throw new Error(`Submission created but embedding failed: ${embeddingResponse.error}`)
    }

    return submission
  } catch (error) {
    console.error('Failed to store embedding:', error)
    throw error
  }
}
