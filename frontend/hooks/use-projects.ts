import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project } from '../lib/types'
import {
  createProject,
  updateProject,
  listProjects,
  getProjectsByHackathon,
  getProjectsByTeam,
  getProjectsByStatus,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ListProjectsParams
} from '../lib/api/projects'
import {
  getNextPageParam,
  flattenPages,
  createPaginationParams,
  DEFAULT_PAGE_SIZE,
  type PageSize
} from '../lib/pagination'

export const PROJECTS_QUERY_KEY = 'projects'

export function useProjects(params: ListProjectsParams = {}) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, params],
    queryFn: () => listProjects(params)
  })
}

export function useProjectsByHackathon(hackathonId: string) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, { hackathon_id: hackathonId }],
    queryFn: () => getProjectsByHackathon(hackathonId),
    enabled: !!hackathonId
  })
}

export function useProjectsByTeam(teamId: string) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, { team_id: teamId }],
    queryFn: () => getProjectsByTeam(teamId),
    enabled: !!teamId
  })
}

export function useProjectsByStatus(
  hackathonId: string,
  status: 'IDEA' | 'BUILDING' | 'SUBMITTED'
) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, { hackathon_id: hackathonId, status }],
    queryFn: () => getProjectsByStatus(hackathonId, status),
    enabled: !!hackathonId
  })
}

export function useInfiniteProjectsByHackathon(
  hackathonId: string,
  pageSize: PageSize = DEFAULT_PAGE_SIZE
) {
  return useInfiniteQuery({
    queryKey: [PROJECTS_QUERY_KEY, 'infinite', { hackathon_id: hackathonId, pageSize }],
    queryFn: ({ pageParam = 0 }) =>
      listProjects({
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

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [PROJECTS_QUERY_KEY, { hackathon_id: data.hackathon_id }]
      })
      queryClient.invalidateQueries({
        queryKey: [PROJECTS_QUERY_KEY, { team_id: data.team_id }]
      })
    }
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [PROJECTS_QUERY_KEY, { hackathon_id: data.hackathon_id }]
      })
      queryClient.invalidateQueries({
        queryKey: [PROJECTS_QUERY_KEY, { team_id: data.team_id }]
      })
    }
  })
}
