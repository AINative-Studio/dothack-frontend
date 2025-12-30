import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Submission } from '../lib/types'
import {
  createSubmission,
  listSubmissions,
  getSubmissionsByHackathon,
  getSubmissionByProject,
  parseArtifactLinks,
  type CreateSubmissionInput,
  type ListSubmissionsParams,
  type ArtifactLink
} from '../lib/api/submissions'

export const SUBMISSIONS_QUERY_KEY = 'submissions'

export { parseArtifactLinks, type ArtifactLink }

export function useSubmissions(params: ListSubmissionsParams = {}) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, params],
    queryFn: () => listSubmissions(params)
  })
}

export function useSubmissionsByHackathon(hackathonId: string) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, { hackathon_id: hackathonId }],
    queryFn: () => getSubmissionsByHackathon(hackathonId),
    enabled: !!hackathonId
  })
}

export function useSubmissionByProject(projectId: string) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, { project_id: projectId }],
    queryFn: () => getSubmissionByProject(projectId),
    enabled: !!projectId
  })
}

export function useCreateSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSubmissionInput) => createSubmission(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUBMISSIONS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [SUBMISSIONS_QUERY_KEY, { project_id: data.project_id }]
      })
    }
  })
}
