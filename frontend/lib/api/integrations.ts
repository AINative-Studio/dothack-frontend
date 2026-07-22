/**
 * DotHack Integrations API
 *
 * API client functions for the Luma calendar integration endpoints.
 * All functions accept an optional `token` string for authorization.
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncOptions {
  events: boolean
  guests: boolean
  contacts: boolean
}

export interface LumaStatus {
  connected: boolean
  integration_id?: string
  calendar_name?: string
  status?: string
  sync_options?: SyncOptions
  last_synced_at?: string
}

export interface LumaConnectResponse {
  success: boolean
  integration_id: string
  calendar_name: string
  status: string
  message: string
}

export interface LumaDisconnectResponse {
  success: boolean
  message: string
}

export interface LumaEvent {
  event_id: string
  name: string
  start_at?: string
  end_at?: string
  location?: string
  is_online: boolean
  cover_url?: string
  guest_count: number
  url?: string
}

export interface LumaEventsListResponse {
  events: LumaEvent[]
  total: number
}

export interface ImportEventResponse {
  success: boolean
  hackathon_id: string
  hackathon_name: string
  message: string
}

export interface SyncGuestsResponse {
  success: boolean
  imported: number
  skipped: number
  total: number
  message: string
}

export interface LumaContact {
  email: string
  name?: string
  event_count: number
}

export interface LumaContactsListResponse {
  contacts: LumaContact[]
  total: number
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/** POST /integrations/luma/connect */
export async function connectLuma(
  apiKey: string,
  token?: string
): Promise<LumaConnectResponse> {
  return apiClient<LumaConnectResponse>('/integrations/luma/connect', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey }),
    token,
  })
}

/** GET /integrations/luma/status */
export async function getLumaStatus(token?: string): Promise<LumaStatus> {
  return apiClient<LumaStatus>('/integrations/luma/status', { token })
}

/** DELETE /integrations/luma/disconnect */
export async function disconnectLuma(token?: string): Promise<LumaDisconnectResponse> {
  return apiClient<LumaDisconnectResponse>('/integrations/luma/disconnect', {
    method: 'DELETE',
    token,
  })
}

/** PUT /integrations/luma/sync-options */
export async function updateSyncOptions(
  options: SyncOptions,
  token?: string
): Promise<LumaStatus> {
  return apiClient<LumaStatus>('/integrations/luma/sync-options', {
    method: 'PUT',
    body: JSON.stringify(options),
    token,
  })
}

/** GET /integrations/luma/events */
export async function listLumaEvents(token?: string): Promise<LumaEventsListResponse> {
  return apiClient<LumaEventsListResponse>('/integrations/luma/events', { token })
}

/** POST /integrations/luma/import-event */
export async function importLumaEvent(
  lumaEventId: string,
  token?: string
): Promise<ImportEventResponse> {
  return apiClient<ImportEventResponse>('/integrations/luma/import-event', {
    method: 'POST',
    body: JSON.stringify({ luma_event_id: lumaEventId }),
    token,
  })
}

/** POST /integrations/luma/sync-guests */
export async function syncLumaGuests(
  lumaEventId: string,
  hackathonId: string,
  token?: string
): Promise<SyncGuestsResponse> {
  return apiClient<SyncGuestsResponse>('/integrations/luma/sync-guests', {
    method: 'POST',
    body: JSON.stringify({ luma_event_id: lumaEventId, hackathon_id: hackathonId }),
    token,
  })
}

/** GET /integrations/luma/contacts */
export async function listLumaContacts(token?: string): Promise<LumaContactsListResponse> {
  return apiClient<LumaContactsListResponse>('/integrations/luma/contacts', { token })
}
