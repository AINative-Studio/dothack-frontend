/**
 * DotHack Hackathons API
 *
 * All hackathon CRUD operations backed by the live DotHack backend at
 * https://dothack.ainative.studio/api/v1. Endpoints are derived from
 * dothack-api.js (the reference API client).
 *
 * Every function accepts an optional `token` string for authorization.
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HackathonStatus = 'draft' | 'active' | 'judging' | 'completed' | 'cancelled'

export interface Hackathon {
  hackathon_id: string
  name: string
  description: string
  organizer_id: string
  start_date: string
  end_date: string
  location: string
  is_online: boolean
  participant_count: number
  status: HackathonStatus
  max_participants: number | null
  logo_url?: string | null
  website_url?: string | null
  rules?: string | null
  created_at: string
  updated_at: string
}

export interface ListHackathonsParams {
  status?: HackathonStatus
  limit?: number
  skip?: number
}

export interface ListHackathonsResponse {
  hackathons: Hackathon[]
  total: number
  skip: number
  limit: number
}

export interface Participant {
  participant_id: string
  name: string
  handle: string
  role: 'BUILDER' | 'JUDGE' | 'MENTOR' | 'ORGANIZER'
  team?: string
  joined_at: string
}

export interface ListParticipantsResponse {
  participants: Participant[]
  total: number
}

export interface Prize {
  prize_id: string
  hackathon_id: string
  title: string
  rank: number
  amount: number
  currency: string
  description: string
  sponsor?: string
}

export interface ListPrizesResponse {
  prizes: Prize[]
}

export type CreatePrizeInput = Omit<Prize, 'prize_id' | 'hackathon_id'>

export type CreateHackathonInput = Omit<
  Hackathon,
  'hackathon_id' | 'created_at' | 'updated_at' | 'participant_count'
>

export type UpdateHackathonInput = Partial<
  Omit<Hackathon, 'hackathon_id' | 'created_at' | 'updated_at'>
>

// ---------------------------------------------------------------------------
// Hackathon CRUD
// ---------------------------------------------------------------------------

/** GET /hackathons */
export async function listHackathons(
  params: ListHackathonsParams = {},
  token?: string
): Promise<ListHackathonsResponse> {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.limit !== undefined) qs.set('limit', String(params.limit))
  if (params.skip !== undefined) qs.set('skip', String(params.skip))
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return apiClient<ListHackathonsResponse>(`/hackathons${query}`, { token })
}

/** GET /hackathons/:id */
export async function getHackathon(id: string, token?: string): Promise<Hackathon> {
  return apiClient<Hackathon>(`/hackathons/${id}`, { token })
}

/** POST /hackathons */
export async function createHackathon(
  data: CreateHackathonInput,
  token: string
): Promise<Hackathon> {
  return apiClient<Hackathon>('/hackathons', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

/** PATCH /hackathons/:id */
export async function updateHackathon(
  id: string,
  data: UpdateHackathonInput,
  token: string
): Promise<Hackathon> {
  return apiClient<Hackathon>(`/hackathons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  })
}

/** DELETE /hackathons/:id  (soft delete) */
export async function deleteHackathon(
  id: string,
  token: string
): Promise<{ success: boolean; hackathon_id: string; message: string }> {
  return apiClient(`/hackathons/${id}`, {
    method: 'DELETE',
    token,
  })
}

// ---------------------------------------------------------------------------
// Participants
// ---------------------------------------------------------------------------

/** GET /hackathons/:id/participants */
export async function listParticipants(
  hackathonId: string,
  role?: Participant['role'],
  token?: string
): Promise<ListParticipantsResponse> {
  const qs = role ? `?role=${role}` : ''
  return apiClient<ListParticipantsResponse>(`/hackathons/${hackathonId}/participants${qs}`, {
    token,
  })
}

/** POST /hackathons/:id/invite-judges */
export async function inviteJudges(
  hackathonId: string,
  emails: string[],
  token: string
): Promise<{ invited: string[]; status: string }> {
  return apiClient(`/hackathons/${hackathonId}/invite-judges`, {
    method: 'POST',
    body: JSON.stringify({ emails }),
    token,
  })
}

// ---------------------------------------------------------------------------
// Prizes
// ---------------------------------------------------------------------------

/** GET /hackathons/:id/prizes */
export async function listPrizes(
  hackathonId: string,
  token?: string
): Promise<ListPrizesResponse> {
  return apiClient<ListPrizesResponse>(`/hackathons/${hackathonId}/prizes`, { token })
}

/** POST /hackathons/:id/prizes */
export async function createPrize(
  hackathonId: string,
  data: CreatePrizeInput,
  token: string
): Promise<Prize> {
  return apiClient<Prize>(`/hackathons/${hackathonId}/prizes`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

export interface Track {
  track_id: string
  hackathon_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface TrackListResponse {
  tracks: Track[]
  total: number
  hackathon_id: string
}

export type CreateTrackInput = {
  name: string
  description?: string | null
}

export type UpdateTrackInput = {
  name?: string | null
  description?: string | null
}

/** GET /hackathons/:id/tracks */
export async function listTracks(
  hackathonId: string,
  token?: string
): Promise<TrackListResponse> {
  return apiClient<TrackListResponse>(`/hackathons/${hackathonId}/tracks`, { token })
}

/** GET /hackathons/:id/tracks/:trackId */
export async function getTrack(
  hackathonId: string,
  trackId: string,
  token?: string
): Promise<Track> {
  return apiClient<Track>(`/hackathons/${hackathonId}/tracks/${trackId}`, { token })
}

/** POST /hackathons/:id/tracks */
export async function createTrack(
  hackathonId: string,
  data: CreateTrackInput,
  token: string
): Promise<Track> {
  return apiClient<Track>(`/hackathons/${hackathonId}/tracks`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

/** PUT /hackathons/:id/tracks/:trackId */
export async function updateTrack(
  hackathonId: string,
  trackId: string,
  data: UpdateTrackInput,
  token: string
): Promise<Track> {
  return apiClient<Track>(`/hackathons/${hackathonId}/tracks/${trackId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  })
}

/** DELETE /hackathons/:id/tracks/:trackId */
export async function deleteTrack(
  hackathonId: string,
  trackId: string,
  token: string
): Promise<{ success: boolean; track_id: string; message: string }> {
  return apiClient(`/hackathons/${hackathonId}/tracks/${trackId}`, {
    method: 'DELETE',
    token,
  })
}

// ---------------------------------------------------------------------------
// Rubrics
// ---------------------------------------------------------------------------

export interface RubricCriterion {
  name: string
  description: string
  max_score: number
  weight: number
}

export interface Rubric {
  rubric_id: string
  hackathon_id: string
  name: string
  criteria: RubricCriterion[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RubricListResponse {
  rubrics: Rubric[]
  total: number
  hackathon_id: string
}

export type CreateRubricInput = {
  name: string
  criteria: RubricCriterion[]
  is_active?: boolean
}

export type UpdateRubricInput = {
  name?: string | null
  criteria?: RubricCriterion[] | null
}

/** GET /hackathons/:id/rubrics */
export async function listRubrics(
  hackathonId: string,
  token?: string
): Promise<RubricListResponse> {
  return apiClient<RubricListResponse>(`/hackathons/${hackathonId}/rubrics`, { token })
}

/** GET /hackathons/:id/rubrics/active */
export async function getActiveRubric(
  hackathonId: string,
  token?: string
): Promise<Rubric> {
  return apiClient<Rubric>(`/hackathons/${hackathonId}/rubrics/active`, { token })
}

/** POST /hackathons/:id/rubrics */
export async function createRubric(
  hackathonId: string,
  data: CreateRubricInput,
  token: string
): Promise<Rubric> {
  return apiClient<Rubric>(`/hackathons/${hackathonId}/rubrics`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

/** PUT /hackathons/:id/rubrics/:rubricId */
export async function updateRubric(
  hackathonId: string,
  rubricId: string,
  data: UpdateRubricInput,
  token: string
): Promise<Rubric> {
  return apiClient<Rubric>(`/hackathons/${hackathonId}/rubrics/${rubricId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  })
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export type TeamStatus = 'FORMING' | 'ACTIVE' | 'SUBMITTED'

export interface TeamMember {
  participant_id: string
  name: string
  role: 'LEAD' | 'MEMBER'
  joined_at?: string
}

export interface Team {
  team_id: string
  hackathon_id: string
  name: string
  status: TeamStatus
  track_id: string | null
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TeamDetail extends Team {
  members: TeamMember[]
  member_count: number
}

export interface TeamListResponse {
  teams: Team[]
  total: number
  skip: number
  limit: number
}

export type CreateTeamInput = {
  hackathon_id: string
  name: string
  track_id?: string | null
  description?: string | null
}

export type UpdateTeamInput = {
  name?: string | null
  description?: string | null
  status?: TeamStatus | null
  track_id?: string | null
}

export interface ListTeamsParams {
  hackathon_id: string
  status?: TeamStatus
  skip?: number
  limit?: number
}

/** GET /teams?hackathon_id=... */
export async function listTeams(
  params: ListTeamsParams,
  token?: string
): Promise<TeamListResponse> {
  const qs = new URLSearchParams()
  qs.set('hackathon_id', params.hackathon_id)
  if (params.status) qs.set('status', params.status)
  if (params.skip !== undefined) qs.set('skip', String(params.skip))
  if (params.limit !== undefined) qs.set('limit', String(params.limit))
  return apiClient<TeamListResponse>(`!/teams?${qs.toString()}`, { token })
}

/** GET /teams/:teamId */
export async function getTeam(teamId: string, token?: string): Promise<TeamDetail> {
  return apiClient<TeamDetail>(`!/teams/${teamId}`, { token })
}

/** POST /teams */
export async function createTeam(
  data: CreateTeamInput,
  token: string
): Promise<Team> {
  return apiClient<Team>('!/teams', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

/** PUT /teams/:teamId */
export async function updateTeam(
  teamId: string,
  data: UpdateTeamInput,
  token: string
): Promise<Team> {
  return apiClient<Team>(`!/teams/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  })
}

/** DELETE /teams/:teamId */
export async function deleteTeam(
  teamId: string,
  token: string
): Promise<{ success: boolean; team_id: string; message: string }> {
  return apiClient(`!/teams/${teamId}`, {
    method: 'DELETE',
    token,
  })
}

// ---------------------------------------------------------------------------
// Submissions (full CRUD via /v1/submissions)
// ---------------------------------------------------------------------------

export interface FileMetadata {
  file_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: string
}

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'SCORED'

export interface SubmissionV1 {
  submission_id: string
  team_id: string
  hackathon_id: string
  project_name: string
  description: string
  repository_url: string | null
  demo_url: string | null
  video_url: string | null
  status: SubmissionStatus
  files: FileMetadata[]
  created_at: string
  updated_at: string
  submitted_at: string | null
}

export type CreateSubmissionInput = {
  team_id: string
  hackathon_id: string
  project_name: string
  description: string
  repository_url?: string | null
  demo_url?: string | null
  video_url?: string | null
  files?: FileMetadata[] | null
}

export type UpdateSubmissionInput = {
  project_name?: string | null
  description?: string | null
  repository_url?: string | null
  demo_url?: string | null
  video_url?: string | null
  status?: SubmissionStatus | null
  files?: FileMetadata[] | null
}

/** POST /v1/submissions */
export async function createSubmission(
  data: CreateSubmissionInput,
  token: string
): Promise<SubmissionV1> {
  return apiClient<SubmissionV1>('!/v1/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

/** PUT /v1/submissions/:submissionId */
export async function updateSubmission(
  submissionId: string,
  data: UpdateSubmissionInput,
  token: string
): Promise<SubmissionV1> {
  return apiClient<SubmissionV1>(`!/v1/submissions/${submissionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  })
}

/** DELETE /v1/submissions/:submissionId */
export async function deleteSubmission(
  submissionId: string,
  token: string
): Promise<{ success: boolean; submission_id: string; message: string }> {
  return apiClient(`!/v1/submissions/${submissionId}`, {
    method: 'DELETE',
    token,
  })
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export type ProjectStatus = 'IDEA' | 'BUILDING' | 'SUBMITTED'

export interface Project {
  project_id: string
  hackathon_id: string
  team_id: string
  title: string
  one_liner: string | null
  description: string | null
  repo_url: string | null
  demo_url: string | null
  video_url: string | null
  status: ProjectStatus
  created_at: string | null
  updated_at: string | null
}

export interface ProjectListResponse {
  projects: Project[]
  total: number
}

export type CreateProjectInput = {
  hackathon_id: string
  team_id: string
  title: string
  one_liner?: string | null
  description?: string | null
  repo_url?: string | null
  demo_url?: string | null
  video_url?: string | null
}

/** GET /v1/hackathons/:id/projects */
export async function listProjects(
  hackathonId: string,
  token?: string
): Promise<ProjectListResponse> {
  return apiClient<ProjectListResponse>(`!/v1/hackathons/${hackathonId}/projects`, { token })
}

/** POST /v1/hackathons/:id/projects */
export async function createProject(
  hackathonId: string,
  data: CreateProjectInput,
  token: string
): Promise<Project> {
  return apiClient<Project>(`!/v1/hackathons/${hackathonId}/projects`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------

export type InvitationRole = 'JUDGE' | 'MENTOR' | 'BUILDER'
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

export interface Invitation {
  invitation_id: string
  hackathon_id: string
  email: string
  role: string
  token: string
  invited_by: string
  status: string
  expires_at: string
  accepted_at: string | null
  declined_at: string | null
  created_at: string
  updated_at: string
}

export interface InvitationListResponse {
  invitations: Invitation[]
  total: number
  created: number
  skipped: number
}

export type CreateInvitationInput = {
  emails: string[]
  role: InvitationRole
}

/** GET /hackathons/:id/invitations */
export async function listInvitations(
  hackathonId: string,
  token?: string
): Promise<InvitationListResponse> {
  return apiClient<InvitationListResponse>(`/hackathons/${hackathonId}/invitations`, { token })
}

/** POST /hackathons/:id/invitations */
export async function createInvitation(
  hackathonId: string,
  data: CreateInvitationInput,
  token: string
): Promise<InvitationListResponse> {
  return apiClient<InvitationListResponse>(`/hackathons/${hackathonId}/invitations`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface HackathonStatsResponse {
  hackathon_id: string
  total_participants: number
  participants_by_role: Record<string, number>
  total_teams: number
  total_submissions: number
  submissions_by_status: Record<string, number>
  average_scores: Record<string, number>
  calculated_at: string
}

export interface ExportResponse {
  success: boolean
  format: string
  file_url: string | null
  data: Record<string, unknown> | null
  file_size_bytes: number | null
  expires_at: string | null
  generated_at: string
}

/** GET /hackathons/:id/stats */
export async function getHackathonStats(
  hackathonId: string,
  token: string
): Promise<HackathonStatsResponse> {
  return apiClient<HackathonStatsResponse>(`/hackathons/${hackathonId}/stats`, { token })
}

/** GET /hackathons/:id/export?format=json|csv */
export async function exportHackathonData(
  hackathonId: string,
  format: 'json' | 'csv' = 'json',
  token: string
): Promise<ExportResponse> {
  return apiClient<ExportResponse>(
    `!/hackathons/${hackathonId}/export?format=${format}`,
    { token }
  )
}

// ---------------------------------------------------------------------------
// Featured Hackathons
// ---------------------------------------------------------------------------

export async function listFeaturedHackathons(authToken?: string) {
  return apiClient<any>('/featured-hackathons', { token: authToken })
}
export async function createFeaturedHackathon(body: any, authToken?: string) {
  return apiClient<any>('/featured-hackathons', { method: 'POST', body: JSON.stringify(body), token: authToken })
}
export async function updateFeaturedHackathon(id: string, body: any, authToken?: string) {
  return apiClient<any>(`/featured-hackathons/${id}`, { method: 'PUT', body: JSON.stringify(body), token: authToken })
}
export async function deleteFeaturedHackathon(id: string, authToken?: string) {
  return apiClient<any>(`/featured-hackathons/${id}`, { method: 'DELETE', token: authToken })
}
export async function reorderFeaturedHackathon(id: string, order: number, authToken?: string) {
  return apiClient<any>(`/featured-hackathons/${id}/order`, { method: 'PATCH', body: JSON.stringify({ display_order: order }), token: authToken })
}

// ---------------------------------------------------------------------------
// Hackathon Themes
// ---------------------------------------------------------------------------

export async function listThemes(authToken?: string) {
  return apiClient<any>('/hackathon-themes', { token: authToken })
}
export async function createTheme(body: any, authToken?: string) {
  return apiClient<any>('/hackathon-themes', { method: 'POST', body: JSON.stringify(body), token: authToken })
}
export async function updateTheme(id: string, body: any, authToken?: string) {
  return apiClient<any>(`/hackathon-themes/${id}`, { method: 'PUT', body: JSON.stringify(body), token: authToken })
}
export async function deleteTheme(id: string, authToken?: string) {
  return apiClient<any>(`/hackathon-themes/${id}`, { method: 'DELETE', token: authToken })
}
export async function reorderTheme(id: string, order: number, authToken?: string) {
  return apiClient<any>(`/hackathon-themes/${id}/order`, { method: 'PATCH', body: JSON.stringify({ display_order: order }), token: authToken })
}

// ---------------------------------------------------------------------------
// Invitation Token Operations
// ---------------------------------------------------------------------------

/** GET /invitations/token/:token */
export async function getInvitationByToken(token: string, authToken?: string) {
  return apiClient<any>(`/invitations/token/${token}`, { token: authToken })
}

/** POST /invitations/accept */
export async function acceptInvitation(
  invToken: string,
  body: { email: string; name?: string },
  authToken?: string
) {
  return apiClient<any>('/invitations/accept', {
    method: 'POST',
    body: JSON.stringify({ token: invToken, ...body }),
    token: authToken,
  })
}

/** POST /invitations/decline */
export async function declineInvitation(
  invToken: string,
  body: { token: string },
  authToken?: string
) {
  return apiClient<any>('/invitations/decline', {
    method: 'POST',
    body: JSON.stringify({ token: invToken }),
    token: authToken,
  })
}

/** POST /invitations/:id/resend */
export async function resendInvitation(id: string, authToken?: string) {
  return apiClient<any>(`/invitations/${id}/resend`, { method: 'POST', token: authToken })
}

// ---------------------------------------------------------------------------
// File Operations
// ---------------------------------------------------------------------------

/** POST /files/submissions/:submissionId/files  (multipart) */
export async function uploadSubmissionFile(
  submissionId: string,
  file: File,
  authToken?: string
) {
  const BASE_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'https://dothack.ainative.studio/api/v1').replace(/\/api\/v\d+$/, '')
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/files/submissions/${submissionId}/files`, {
    method: 'POST',
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

/** GET /files/:fileId/download */
export async function downloadFile(fileId: string, authToken?: string) {
  const BASE_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'https://dothack.ainative.studio/api/v1').replace(/\/api\/v\d+$/, '')
  const res = await fetch(`${BASE_URL}/files/${fileId}/download`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  })
  if (!res.ok) throw new Error('Download failed')
  return res.blob()
}

/** DELETE /files/:fileId */
export async function deleteFile(fileId: string, authToken?: string) {
  return apiClient<any>(`!/files/${fileId}`, { method: 'DELETE', token: authToken })
}
