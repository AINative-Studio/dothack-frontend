import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import type { Submission } from '../lib/types'
import type { SearchResult } from '../lib/zerodb'
import {
  createSubmission,
  createSubmissionWithEmbedding,
  listSubmissions,
  getSubmissionsByHackathon,
  getSubmissionByProject,
  searchSubmissions,
  parseArtifactLinks,
  type CreateSubmissionInput,
  type ListSubmissionsParams,
  type ArtifactLink,
  type SubmissionEmbeddingMetadata,
  type SearchSubmissionsParams
} from '../lib/api/submissions'
import {
  getNextPageParam,
  flattenPages,
  createPaginationParams,
  DEFAULT_PAGE_SIZE,
  type PageSize
} from '../lib/pagination'

export const SUBMISSIONS_QUERY_KEY = 'submissions'
export const SUBMISSION_SEARCH_QUERY_KEY = 'submission_search'

export { parseArtifactLinks, type ArtifactLink, type SubmissionEmbeddingMetadata, type SearchResult }

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

export function useInfiniteSubmissionsByHackathon(
  hackathonId: string,
  pageSize: PageSize = DEFAULT_PAGE_SIZE
) {
  return useInfiniteQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, 'infinite', { hackathon_id: hackathonId, pageSize }],
    queryFn: ({ pageParam = 0 }) =>
      listSubmissions({
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

export function useCreateSubmissionWithEmbedding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      submission: CreateSubmissionInput
      metadata: SubmissionEmbeddingMetadata
    }) => createSubmissionWithEmbedding(input.submission, input.metadata),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUBMISSIONS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [SUBMISSIONS_QUERY_KEY, { project_id: data.project_id }]
      })
    }
  })
}

export function useSearchSubmissions(params: Omit<SearchSubmissionsParams, 'query'>) {
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const searchQuery = useQuery({
    queryKey: [SUBMISSION_SEARCH_QUERY_KEY, { ...params, query: debouncedQuery }],
    queryFn: () => searchSubmissions({ ...params, query: debouncedQuery }),
    enabled: !!params.hackathon_id && debouncedQuery.length >= 3
  })

  return {
    ...searchQuery,
    query,
    setQuery
  }
}
