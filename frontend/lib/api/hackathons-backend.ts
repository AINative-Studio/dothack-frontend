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
