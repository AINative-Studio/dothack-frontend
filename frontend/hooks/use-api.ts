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
  })
}

export function useHackathon(id: string): UseQueryResult<Hackathon, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.hackathons.detail(id),
    queryFn: () => getHackathon(id, token ?? undefined),
    enabled: !!id,
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
    enabled: !!hackathonId,
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
    enabled: !!hackathonId,
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
  })
}

export function useSubmission(id: string): UseQueryResult<Submission, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.submissions.detail(id),
    queryFn: () => getSubmission(id, token ?? undefined),
    enabled: !!id,
  })
}

export function useSimilarSubmissions(
  id: string
): UseQueryResult<SimilarSubmissionsResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.submissions.similar(id),
    queryFn: () => getSimilarSubmissions(id, token ?? undefined),
    enabled: !!id,
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
  params: SearchParams,
  options?: { enabled?: boolean }
): UseQueryResult<SearchResponse, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.search(params),
    queryFn: () => search(params, token ?? undefined),
    enabled: options?.enabled !== false && !!params.query,
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
    enabled: !!hackathonId,
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
    enabled: !!hackathonId && !!trackId,
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
    enabled: !!hackathonId,
  })
}

export function useActiveRubric(
  hackathonId: string
): UseQueryResult<Rubric, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.rubrics.active(hackathonId),
    queryFn: () => getActiveRubric(hackathonId, token ?? undefined),
    enabled: !!hackathonId,
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
    enabled: !!hackathonId,
  })
}

export function useTeam(teamId: string): UseQueryResult<TeamDetail, Error> {
  const { token } = useAuth()
  return useQuery({
    queryKey: DotHackQueryKeys.teams.detail(teamId),
    queryFn: () => getTeam(teamId, token ?? undefined),
    enabled: !!teamId,
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
    enabled: !!hackathonId,
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
    enabled: !!hackathonId,
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
// Re-export types for consumers
// ---------------------------------------------------------------------------

export type {
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
}
