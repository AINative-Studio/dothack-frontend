'use client'

/**
 * React Query hooks for all DotHack API endpoints
 *
 * All hooks retrieve the auth token from useAuth() automatically, so
 * callers never need to pass a token manually.
 *
 * Query key structure:
 *   ['dothack', resource, ...params]
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { useAuth } from '@/lib/auth/auth-context'

// API modules
import {
  listHackathons,
  getHackathon,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  listParticipants,
  inviteJudges,
  listPrizes,
  createPrize,
  listTracks,
  getTrack,
  createTrack,
  updateTrack,
  deleteTrack,
  listRubrics,
  getActiveRubric,
  createRubric,
  updateRubric,
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  listProjects,
  listInvitations,
  createInvitation,
  getHackathonStats,
  exportHackathonData,
  listFeaturedHackathons,
  createFeaturedHackathon,
  updateFeaturedHackathon,
  deleteFeaturedHackathon,
  reorderFeaturedHackathon,
  listThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  reorderTheme,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  resendInvitation,
  uploadSubmissionFile,
  deleteFile,
  type Hackathon,
  type ListHackathonsParams,
  type ListHackathonsResponse,
  type ListParticipantsResponse,
  type ListPrizesResponse,
  type CreateHackathonInput,
  type UpdateHackathonInput,
  type CreatePrizeInput,
  type Participant,
  type Track,
  type TrackListResponse,
  type CreateTrackInput,
  type UpdateTrackInput,
  type Rubric,
  type RubricListResponse,
  type RubricCriterion,
  type CreateRubricInput,
  type UpdateRubricInput,
  type Team,
  type TeamDetail,
  type TeamListResponse,
  type ListTeamsParams,
  type CreateTeamInput,
  type UpdateTeamInput,
  type TeamStatus,
  type SubmissionV1,
  type CreateSubmissionInput,
  type UpdateSubmissionInput,
  type Project,
  type ProjectListResponse,
  type CreateProjectInput,
  type Invitation,
  type InvitationListResponse,
  type InvitationRole,
  type CreateInvitationInput,
  type HackathonStatsResponse,
  type ExportResponse,
} from '@/lib/api/hackathons-backend'

import {
  listSubmissions,
  getSubmission,
  getSimilarSubmissions,
  type ListSubmissionsParams,
  type ListSubmissionsResponse,
  type Submission,
  type SimilarSubmissionsResponse,
} from '@/lib/api/submissions-backend'

import {
  getJudgeAssignments,
  submitScore,
  getLeaderboard,
  type JudgeAssignmentsResponse,
  type SubmitScoreParams,
  type ScoreResponse,
  type LeaderboardResponse,
} from '@/lib/api/judging'

import {
  getOrganizerDashboard,
  getHackathonOverview,
  getAttendeeDashboard,
  type OrganizerDashboard,
  type HackathonOverview,
  type AttendeeDashboard,
} from '@/lib/api/dashboard-backend'

import {
  search,
  type SearchParams,
  type SearchResponse,
} from '@/lib/api/search-backend'

import {
  connectLuma,
  getLumaStatus,
  disconnectLuma,
  updateSyncOptions,
  listLumaEvents,
  importLumaEvent,
  syncLumaGuests,
  listLumaContacts,
  type LumaStatus,
  type SyncOptions,
  type LumaConnectResponse,
  type LumaEventsListResponse,
  type ImportEventResponse,
  type SyncGuestsResponse,
  type LumaContactsListResponse,
} from '@/lib/api/integrations'

import {
  connectZeroPipeline,
  getZeroPipelineStatus,
  disconnectZeroPipeline,
  updateZeroPipelineSyncOptions,
  listZeroPipelinePipelines,
  listZeroPipelineDeals,
  listZeroPipelineCustomers,
  importZeroPipelineCustomers,
  getZeroPipelineDashboard,
  type ZeroPipelineStatus,
  type ZeroPipelineSyncOptions,
  type ZeroPipelineConnectResponse,
  type PipelinesListResponse as ZPPipelinesListResponse,
  type DealsListResponse as ZPDealsListResponse,
  type CustomersListResponse as ZPCustomersListResponse,
  type ImportCustomersResponse as ZPImportCustomersResponse,
  type DashboardSummary as ZPDashboardSummary,
} from '@/lib/api/zeropipeline'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const DotHackQueryKeys = {
  hackathons: {
    all: (params?: ListHackathonsParams) =>
      ['dothack', 'hackathons', params] as const,
    detail: (id: string) => ['dothack', 'hackathons', id] as const,
  },
  participants: {
    byHackathon: (hackathonId: string, role?: string) =>
      ['dothack', 'participants', hackathonId, role] as const,
  },
  prizes: {
    byHackathon: (hackathonId: string) =>
      ['dothack', 'prizes', hackathonId] as const,
  },
  tracks: {
    byHackathon: (hackathonId: string) =>
      ['dothack', 'tracks', hackathonId] as const,
    detail: (hackathonId: string, trackId: string) =>
      ['dothack', 'tracks', hackathonId, trackId] as const,
  },
  rubrics: {
    byHackathon: (hackathonId: string) =>
      ['dothack', 'rubrics', hackathonId] as const,
    active: (hackathonId: string) =>
      ['dothack', 'rubrics', hackathonId, 'active'] as const,
    detail: (hackathonId: string, rubricId: string) =>
      ['dothack', 'rubrics', hackathonId, rubricId] as const,
  },
  teams: {
    byHackathon: (hackathonId: string, status?: TeamStatus) =>
      ['dothack', 'teams', hackathonId, status] as const,
    detail: (teamId: string) => ['dothack', 'teams', teamId] as const,
  },
  submissions: {
    all: (params?: ListSubmissionsParams) =>
      ['dothack', 'submissions', params] as const,
    detail: (id: string) => ['dothack', 'submissions', id] as const,
    similar: (id: string) => ['dothack', 'submissions', id, 'similar'] as const,
  },
  projects: {
    byHackathon: (hackathonId: string) =>
      ['dothack', 'projects', hackathonId] as const,
  },
  invitations: {
    byHackathon: (hackathonId: string) =>
      ['dothack', 'invitations', hackathonId] as const,
  },
  judging: {
    assignments: ['dothack', 'judging', 'assignments'] as const,
    leaderboard: (hackathonId: string) =>
      ['dothack', 'judging', hackathonId, 'leaderboard'] as const,
  },
  dashboard: {
    organizer: ['dothack', 'dashboard', 'organizer'] as const,
    hackathonOverview: (id: string) =>
      ['dothack', 'dashboard', 'hackathons', id, 'overview'] as const,
    attendee: ['dothack', 'dashboard', 'attendee'] as const,
  },
  analytics: {
    stats: (hackathonId: string) =>
      ['dothack', 'analytics', hackathonId, 'stats'] as const,
    export: (hackathonId: string, format: string) =>
      ['dothack', 'analytics', hackathonId, 'export', format] as const,
  },
  search: (params: SearchParams) => ['dothack', 'search', params] as const,
  featured: {
    all: () => ['dothack', 'featured'] as const,
    detail: (id: string) => ['dothack', 'featured', id] as const,
  },
  themes: {
    all: () => ['dothack', 'themes'] as const,
    detail: (id: string) => ['dothack', 'themes', id] as const,
  },
  integrations: {
    lumaStatus: () => ['dothack', 'integrations', 'luma', 'status'] as const,
    lumaEvents: () => ['dothack', 'integrations', 'luma', 'events'] as const,
    lumaContacts: () => ['dothack', 'integrations', 'luma', 'contacts'] as const,
    zpStatus: () => ['dothack', 'integrations', 'zeropipeline', 'status'] as const,
    zpPipelines: () => ['dothack', 'integrations', 'zeropipeline', 'pipelines'] as const,
    zpDeals: (pipelineId?: string) => ['dothack', 'integrations', 'zeropipeline', 'deals', pipelineId] as const,
    zpCustomers: () => ['dothack', 'integrations', 'zeropipeline', 'customers'] as const,
    zpDashboard: () => ['dothack', 'integrations', 'zeropipeline', 'dashboard'] as const,
  },
}

// ---------------------------------------------------------------------------
// Hackathon hooks
// ---------------------------------------------------------------------------

export function useHackathons(
  params: ListHackathonsParams = {}
): UseQueryResult<ListHackathonsResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.hackathons.all(params),
    queryFn: () => listHackathons(params, token ?? undefined),
    enabled: !!token,
  })
}

export function useHackathon(id: string): UseQueryResult<Hackathon, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.hackathons.detail(id),
    queryFn: () => getHackathon(id, token ?? undefined),
    enabled: !!id && !!token,
  })
}

export function useCreateHackathon(): UseMutationResult<
  Hackathon,
  Error,
  CreateHackathonInput
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHackathonInput) => createHackathon(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'hackathons'] })
    },
  })
}

export function useUpdateHackathon(): UseMutationResult<
  Hackathon,
  Error,
  { id: string; data: UpdateHackathonInput }
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateHackathon(id, data, token!),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.hackathons.detail(updated.hackathon_id),
      })
      queryClient.invalidateQueries({ queryKey: ['dothack', 'hackathons'] })
    },
  })
}

export function useDeleteHackathon(): UseMutationResult<
  { success: boolean; hackathon_id: string; message: string },
  Error,
  string
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteHackathon(id, token!),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: DotHackQueryKeys.hackathons.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['dothack', 'hackathons'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Participants hooks
// ---------------------------------------------------------------------------

export function useParticipants(
  hackathonId: string,
  role?: Participant['role']
): UseQueryResult<ListParticipantsResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.participants.byHackathon(hackathonId, role),
    queryFn: () => listParticipants(hackathonId, role, token ?? undefined),
    enabled: !!hackathonId && !!token,
  })
}

export function useInviteJudges(): UseMutationResult<
  { invited: string[]; status: string },
  Error,
  { hackathonId: string; emails: string[] }
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hackathonId, emails }) => inviteJudges(hackathonId, emails, token!),
    onSuccess: (_, { hackathonId }) => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.participants.byHackathon(hackathonId),
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Prize hooks
// ---------------------------------------------------------------------------

export function usePrizes(
  hackathonId: string
): UseQueryResult<ListPrizesResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.prizes.byHackathon(hackathonId),
    queryFn: () => listPrizes(hackathonId, token ?? undefined),
    enabled: !!hackathonId && !!token,
  })
}

export function useCreatePrize(): UseMutationResult<
  import('@/lib/api/hackathons-backend').Prize,
  Error,
  { hackathonId: string; data: CreatePrizeInput }
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hackathonId, data }) => createPrize(hackathonId, data, token!),
    onSuccess: (_, { hackathonId }) => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.prizes.byHackathon(hackathonId),
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Submission hooks
// ---------------------------------------------------------------------------

export function useSubmissions(
  params: ListSubmissionsParams = {}
): UseQueryResult<ListSubmissionsResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.submissions.all(params),
    queryFn: () => listSubmissions(params, token ?? undefined),
    enabled: !!token,
  })
}

export function useSubmission(id: string): UseQueryResult<Submission, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.submissions.detail(id),
    queryFn: () => getSubmission(id, token ?? undefined),
    enabled: !!id && !!token,
  })
}

export function useSimilarSubmissions(
  id: string
): UseQueryResult<SimilarSubmissionsResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.submissions.similar(id),
    queryFn: () => getSimilarSubmissions(id, token ?? undefined),
    enabled: !!id && !!token,
  })
}

// ---------------------------------------------------------------------------
// Judging hooks
// ---------------------------------------------------------------------------

export function useJudgeAssignments(): UseQueryResult<
  JudgeAssignmentsResponse,
  Error
> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.judging.assignments,
    queryFn: () => getJudgeAssignments(token!),
    enabled: !!token,
  })
}

export function useSubmitScore(): UseMutationResult<
  ScoreResponse,
  Error,
  SubmitScoreParams
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: SubmitScoreParams) => submitScore(params, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.judging.assignments })
    },
  })
}

export function useLeaderboard(
  hackathonId: string
): UseQueryResult<LeaderboardResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.judging.leaderboard(hackathonId),
    queryFn: () => getLeaderboard(hackathonId, token!),
    enabled: !!hackathonId && !!token,
  })
}

// ---------------------------------------------------------------------------
// Dashboard hooks
// ---------------------------------------------------------------------------

export function useOrganizerDashboard(): UseQueryResult<
  OrganizerDashboard,
  Error
> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.dashboard.organizer,
    queryFn: () => getOrganizerDashboard(token!),
    enabled: !!token,
  })
}

export function useHackathonOverview(
  hackathonId: string
): UseQueryResult<HackathonOverview, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.dashboard.hackathonOverview(hackathonId),
    queryFn: () => getHackathonOverview(hackathonId, token!),
    enabled: !!hackathonId && !!token,
  })
}

export function useAttendeeDashboard(): UseQueryResult<
  AttendeeDashboard,
  Error
> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.dashboard.attendee,
    queryFn: () => getAttendeeDashboard(token!),
    enabled: !!token,
  })
}

// ---------------------------------------------------------------------------
// Search hook
// ---------------------------------------------------------------------------

export function useSearch(
  params?: SearchParams | string,
  options?: { enabled?: boolean }
): UseQueryResult<SearchResponse, Error> {
  const { token } = useAuth()
  const resolvedParams: SearchParams | undefined = typeof params === 'string' ? { query: params } : params
  return useQuery({
    queryKey: DotHackQueryKeys.search(resolvedParams || { query: '' }),
    queryFn: () => search(resolvedParams!, token ?? undefined),
    enabled: options?.enabled !== false && !!resolvedParams?.query,
  })
}

// ---------------------------------------------------------------------------
// Tracks hooks
// ---------------------------------------------------------------------------

export function useTracks(
  hackathonId: string
): UseQueryResult<TrackListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.tracks.byHackathon(hackathonId),
    queryFn: () => listTracks(hackathonId, token ?? undefined),
    enabled: !!hackathonId && !!token,
  })
}

export function useTrack(
  hackathonId: string,
  trackId: string
): UseQueryResult<Track, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.tracks.detail(hackathonId, trackId),
    queryFn: () => getTrack(hackathonId, trackId, token ?? undefined),
    enabled: !!hackathonId && !!trackId && !!token,
  })
}

export function useCreateTrack(hackathonId: string): UseMutationResult<
  Track,
  Error,
  CreateTrackInput
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTrackInput) => createTrack(hackathonId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.tracks.byHackathon(hackathonId),
      })
    },
  })
}

export function useUpdateTrack(
  hackathonId: string,
  trackId: string
): UseMutationResult<Track, Error, UpdateTrackInput> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTrackInput) =>
      updateTrack(hackathonId, trackId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.tracks.byHackathon(hackathonId),
      })
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.tracks.detail(hackathonId, trackId),
      })
    },
  })
}

export function useDeleteTrack(
  hackathonId: string,
  trackId: string
): UseMutationResult<
  { success: boolean; track_id: string; message: string },
  Error,
  void
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteTrack(hackathonId, trackId, token!),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: DotHackQueryKeys.tracks.detail(hackathonId, trackId),
      })
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.tracks.byHackathon(hackathonId),
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Rubrics hooks
// ---------------------------------------------------------------------------

export function useRubrics(
  hackathonId: string
): UseQueryResult<RubricListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.rubrics.byHackathon(hackathonId),
    queryFn: () => listRubrics(hackathonId, token ?? undefined),
    enabled: !!hackathonId && !!token,
  })
}

export function useActiveRubric(
  hackathonId: string
): UseQueryResult<Rubric, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.rubrics.active(hackathonId),
    queryFn: () => getActiveRubric(hackathonId, token ?? undefined),
    enabled: !!hackathonId && !!token,
  })
}

export function useCreateRubric(hackathonId: string): UseMutationResult<
  Rubric,
  Error,
  CreateRubricInput
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRubricInput) => createRubric(hackathonId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.rubrics.byHackathon(hackathonId),
      })
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.rubrics.active(hackathonId),
      })
    },
  })
}

export function useUpdateRubric(
  hackathonId: string,
  rubricId: string
): UseMutationResult<Rubric, Error, UpdateRubricInput> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateRubricInput) =>
      updateRubric(hackathonId, rubricId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.rubrics.byHackathon(hackathonId),
      })
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.rubrics.detail(hackathonId, rubricId),
      })
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.rubrics.active(hackathonId),
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Teams hooks
// ---------------------------------------------------------------------------

export function useTeams(
  hackathonId: string,
  status?: TeamStatus
): UseQueryResult<TeamListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.teams.byHackathon(hackathonId, status),
    queryFn: () =>
      listTeams({ hackathon_id: hackathonId, status }, token ?? undefined),
    enabled: !!hackathonId && !!token,
  })
}

export function useTeam(teamId: string): UseQueryResult<TeamDetail, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.teams.detail(teamId),
    queryFn: () => getTeam(teamId, token ?? undefined),
    enabled: !!teamId && !!token,
  })
}

export function useCreateTeam(): UseMutationResult<Team, Error, CreateTeamInput> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTeamInput) => createTeam(data, token!),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.teams.byHackathon(created.hackathon_id),
      })
    },
  })
}

export function useUpdateTeam(
  teamId: string
): UseMutationResult<Team, Error, UpdateTeamInput> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTeamInput) => updateTeam(teamId, data, token!),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.teams.detail(teamId),
      })
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.teams.byHackathon(updated.hackathon_id),
      })
    },
  })
}

export function useDeleteTeam(
  teamId: string
): UseMutationResult<
  { success: boolean; team_id: string; message: string },
  Error,
  void
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteTeam(teamId, token!),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: DotHackQueryKeys.teams.detail(teamId),
      })
      queryClient.invalidateQueries({ queryKey: ['dothack', 'teams'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Submission full CRUD hooks (via /v1/submissions)
// ---------------------------------------------------------------------------

export function useCreateSubmission(): UseMutationResult<
  SubmissionV1,
  Error,
  CreateSubmissionInput
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSubmissionInput) => createSubmission(data, token!),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'submissions'] })
      if (created.hackathon_id) {
        queryClient.invalidateQueries({
          queryKey: DotHackQueryKeys.analytics.stats(created.hackathon_id),
        })
      }
    },
  })
}

export function useUpdateSubmission(
  submissionId: string
): UseMutationResult<SubmissionV1, Error, UpdateSubmissionInput> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateSubmissionInput) =>
      updateSubmission(submissionId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.submissions.detail(submissionId),
      })
      queryClient.invalidateQueries({ queryKey: ['dothack', 'submissions'] })
    },
  })
}

export function useDeleteSubmission(
  submissionId: string
): UseMutationResult<
  { success: boolean; submission_id: string; message: string },
  Error,
  void
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteSubmission(submissionId, token!),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: DotHackQueryKeys.submissions.detail(submissionId),
      })
      queryClient.invalidateQueries({ queryKey: ['dothack', 'submissions'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Projects hooks
// ---------------------------------------------------------------------------

export function useProjects(
  hackathonId: string
): UseQueryResult<ProjectListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.projects.byHackathon(hackathonId),
    queryFn: () => listProjects(hackathonId, token ?? undefined),
    enabled: !!hackathonId && !!token,
  })
}

// ---------------------------------------------------------------------------
// Invitations hooks
// ---------------------------------------------------------------------------

export function useInvitations(
  hackathonId: string
): UseQueryResult<InvitationListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.invitations.byHackathon(hackathonId),
    queryFn: () => listInvitations(hackathonId, token ?? undefined),
    enabled: !!hackathonId && !!token,
  })
}

export function useCreateInvitation(hackathonId: string): UseMutationResult<
  InvitationListResponse,
  Error,
  CreateInvitationInput
> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInvitationInput) =>
      createInvitation(hackathonId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.invitations.byHackathon(hackathonId),
      })
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.participants.byHackathon(hackathonId),
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Analytics hooks
// ---------------------------------------------------------------------------

export function useHackathonStats(
  hackathonId: string
): UseQueryResult<HackathonStatsResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.analytics.stats(hackathonId),
    queryFn: () => getHackathonStats(hackathonId, token!),
    enabled: !!hackathonId && !!token,
  })
}

export function useExportData(
  hackathonId: string,
  format: 'json' | 'csv' = 'json'
): UseQueryResult<ExportResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.analytics.export(hackathonId, format),
    queryFn: () => exportHackathonData(hackathonId, format, token!),
    enabled: !!hackathonId && !!token,
    // Export data is not stale - don't refetch automatically
    staleTime: Infinity,
    gcTime: 0,
  })
}

// ---------------------------------------------------------------------------
// Featured Hackathons hooks
// ---------------------------------------------------------------------------

export function useFeaturedHackathons(): UseQueryResult<any, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.featured.all(),
    queryFn: () => listFeaturedHackathons(token ?? undefined),
    enabled: !!token,
  })
}

export function useCreateFeatured(): UseMutationResult<any, Error, any> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => createFeaturedHackathon(body, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.featured.all() })
    },
  })
}

export function useUpdateFeatured(): UseMutationResult<any, Error, { id: string; body: any }> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => updateFeaturedHackathon(id, body, token ?? undefined),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.featured.all() })
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.featured.detail(id) })
    },
  })
}

export function useDeleteFeatured(): UseMutationResult<any, Error, string> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFeaturedHackathon(id, token ?? undefined),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.featured.all() })
      queryClient.removeQueries({ queryKey: DotHackQueryKeys.featured.detail(id) })
    },
  })
}

export function useReorderFeatured(): UseMutationResult<any, Error, { id: string; order: number }> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, order }) => reorderFeaturedHackathon(id, order, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.featured.all() })
    },
  })
}

// ---------------------------------------------------------------------------
// Themes hooks
// ---------------------------------------------------------------------------

export function useThemes(): UseQueryResult<any, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.themes.all(),
    queryFn: () => listThemes(token ?? undefined),
    enabled: !!token,
  })
}

export function useCreateTheme(): UseMutationResult<any, Error, any> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => createTheme(body, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.themes.all() })
    },
  })
}

export function useUpdateTheme(): UseMutationResult<any, Error, { id: string; body: any }> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => updateTheme(id, body, token ?? undefined),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.themes.all() })
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.themes.detail(id) })
    },
  })
}

export function useDeleteTheme(): UseMutationResult<any, Error, string> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTheme(id, token ?? undefined),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.themes.all() })
      queryClient.removeQueries({ queryKey: DotHackQueryKeys.themes.detail(id) })
    },
  })
}

export function useReorderTheme(): UseMutationResult<any, Error, { id: string; order: number }> {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, order }) => reorderTheme(id, order, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DotHackQueryKeys.themes.all() })
    },
  })
}

// ---------------------------------------------------------------------------
// Invitation token hooks
// ---------------------------------------------------------------------------

export function useInvitationByToken(token: string): UseQueryResult<any, Error> {
  const { token: authToken } = useAuth()
  return useQuery({
    queryKey: ['dothack', 'invitations', 'token', token] as const,
    queryFn: () => getInvitationByToken(token, authToken ?? undefined),
    enabled: !!token && !!authToken,
  })
}

export function useAcceptInvitation(): UseMutationResult<
  any,
  Error,
  { invToken: string; email: string; name?: string }
> {
  const { token: authToken } = useAuth()
  return useMutation({
    mutationFn: ({ invToken, email, name }) =>
      acceptInvitation(invToken, { email, name }, authToken ?? undefined),
  })
}

export function useDeclineInvitation(): UseMutationResult<
  any,
  Error,
  { invToken: string }
> {
  const { token: authToken } = useAuth()
  return useMutation({
    mutationFn: ({ invToken }) =>
      declineInvitation(invToken, { token: invToken }, authToken ?? undefined),
  })
}

export function useResendInvitation(): UseMutationResult<any, Error, string> {
  const { token: authToken } = useAuth()
  return useMutation({
    mutationFn: (id: string) => resendInvitation(id, authToken ?? undefined),
  })
}

// ---------------------------------------------------------------------------
// File hooks
// ---------------------------------------------------------------------------

export function useUploadFile(): UseMutationResult<
  any,
  Error,
  { submissionId: string; file: File }
> {
  const { token: authToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ submissionId, file }) =>
      uploadSubmissionFile(submissionId, file, authToken ?? undefined),
    onSuccess: (_data, { submissionId }) => {
      queryClient.invalidateQueries({
        queryKey: DotHackQueryKeys.submissions.detail(submissionId),
      })
      queryClient.invalidateQueries({ queryKey: ['dothack', 'submissions'] })
    },
  })
}

export function useDeleteFile(): UseMutationResult<any, Error, string> {
  const { token: authToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fileId: string) => deleteFile(fileId, authToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'submissions'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Luma Integration hooks
// ---------------------------------------------------------------------------

export function useLumaStatus(): UseQueryResult<LumaStatus, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.integrations.lumaStatus(),
    queryFn: () => getLumaStatus(token ?? undefined),
    enabled: !!token,
  })
}

export function useConnectLuma(): UseMutationResult<LumaConnectResponse, Error, string> {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (apiKey: string) => connectLuma(apiKey, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: DotHackQueryKeys.integrations.lumaStatus() }),
  })
}

export function useDisconnectLuma(): UseMutationResult<{ success: boolean; message: string }, Error, void> {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => disconnectLuma(token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: DotHackQueryKeys.integrations.lumaStatus() }),
  })
}

export function useUpdateSyncOptions(): UseMutationResult<LumaStatus, Error, SyncOptions> {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (options: SyncOptions) => updateSyncOptions(options, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: DotHackQueryKeys.integrations.lumaStatus() }),
  })
}

export function useLumaEvents(): UseQueryResult<LumaEventsListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.integrations.lumaEvents(),
    queryFn: () => listLumaEvents(token ?? undefined),
    enabled: !!token,
  })
}

export function useImportLumaEvent(): UseMutationResult<ImportEventResponse, Error, string> {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lumaEventId: string) => importLumaEvent(lumaEventId, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DotHackQueryKeys.hackathons.all() })
      qc.invalidateQueries({ queryKey: DotHackQueryKeys.integrations.lumaEvents() })
    },
  })
}

export function useSyncLumaGuests(): UseMutationResult<
  SyncGuestsResponse,
  Error,
  { lumaEventId: string; hackathonId: string }
> {
  const { token } = useAuth()
  return useMutation({
    mutationFn: (params: { lumaEventId: string; hackathonId: string }) =>
      syncLumaGuests(params.lumaEventId, params.hackathonId, token ?? undefined),
  })
}

export function useLumaContacts(): UseQueryResult<LumaContactsListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.integrations.lumaContacts(),
    queryFn: () => listLumaContacts(token ?? undefined),
    enabled: !!token,
  })
}

// ---------------------------------------------------------------------------
// ZeroPipeline Integration hooks
// ---------------------------------------------------------------------------

export function useZeroPipelineStatus(): UseQueryResult<ZeroPipelineStatus, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.integrations.zpStatus(),
    queryFn: () => getZeroPipelineStatus(token ?? undefined),
    enabled: !!token,
  })
}

export function useConnectZeroPipeline(): UseMutationResult<ZeroPipelineConnectResponse, Error, string> {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (apiKey: string) => connectZeroPipeline(apiKey, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: DotHackQueryKeys.integrations.zpStatus() }),
  })
}

export function useDisconnectZeroPipeline(): UseMutationResult<{ success: boolean; message: string }, Error, void> {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => disconnectZeroPipeline(token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: DotHackQueryKeys.integrations.zpStatus() }),
  })
}

export function useUpdateZeroPipelineSyncOptions(): UseMutationResult<ZeroPipelineStatus, Error, ZeroPipelineSyncOptions> {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (options: ZeroPipelineSyncOptions) => updateZeroPipelineSyncOptions(options, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: DotHackQueryKeys.integrations.zpStatus() }),
  })
}

export function useZeroPipelinePipelines(): UseQueryResult<ZPPipelinesListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.integrations.zpPipelines(),
    queryFn: () => listZeroPipelinePipelines(token ?? undefined),
    enabled: !!token,
  })
}

export function useZeroPipelineDeals(pipelineId?: string): UseQueryResult<ZPDealsListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.integrations.zpDeals(pipelineId),
    queryFn: () => listZeroPipelineDeals(pipelineId, token ?? undefined),
    enabled: !!token,
  })
}

export function useZeroPipelineCustomers(): UseQueryResult<ZPCustomersListResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.integrations.zpCustomers(),
    queryFn: () => listZeroPipelineCustomers(token ?? undefined),
    enabled: !!token,
  })
}

export function useImportZeroPipelineCustomers(): UseMutationResult<
  ZPImportCustomersResponse,
  Error,
  { hackathonId: string; pipelineId?: string }
> {
  const { token } = useAuth()
  return useMutation({
    mutationFn: (params: { hackathonId: string; pipelineId?: string }) =>
      importZeroPipelineCustomers(params.hackathonId, params.pipelineId, token ?? undefined),
  })
}

export function useZeroPipelineDashboard(): UseQueryResult<ZPDashboardSummary, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.integrations.zpDashboard(),
    queryFn: () => getZeroPipelineDashboard(token ?? undefined),
    enabled: !!token,
  })
}

// ---------------------------------------------------------------------------
// Re-export types for consumers
// ---------------------------------------------------------------------------

export type {
  LumaStatus,
  SyncOptions,
  LumaConnectResponse,
  LumaEventsListResponse,
  ImportEventResponse,
  SyncGuestsResponse,
  LumaContactsListResponse,
  Track,
  TrackListResponse,
  CreateTrackInput,
  UpdateTrackInput,
  Rubric,
  RubricListResponse,
  RubricCriterion,
  CreateRubricInput,
  UpdateRubricInput,
  Team,
  TeamDetail,
  TeamListResponse,
  TeamStatus,
  CreateTeamInput,
  UpdateTeamInput,
  SubmissionV1,
  CreateSubmissionInput,
  UpdateSubmissionInput,
  Project,
  ProjectListResponse,
  CreateProjectInput,
  Invitation,
  InvitationListResponse,
  InvitationRole,
  CreateInvitationInput,
  HackathonStatsResponse,
  ExportResponse,
  ZeroPipelineStatus,
  ZeroPipelineSyncOptions,
  ZeroPipelineConnectResponse,
  ZPPipelinesListResponse,
  ZPDealsListResponse,
  ZPCustomersListResponse,
  ZPImportCustomersResponse,
  ZPDashboardSummary,
}
