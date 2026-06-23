/**
 * DotHack Dashboard API
 *
 * Wraps the three dashboard endpoints from the DotHack backend:
 *   GET /dashboard/organizer              — organizer-facing summary
 *   GET /dashboard/hackathons/:id/overview — per-hackathon overview
 *   GET /api/v1/me/dashboard              — attendee/builder-facing home
 *
 * Note: The first two endpoints are served under /dashboard/* (no /api/v1
 * prefix) as documented in dothack-api.js.  The attendee endpoint uses the
 * standard /api/v1 prefix already included in NEXT_PUBLIC_API_URL, but the
 * path comes from /me/dashboard, so we call /me/dashboard directly.
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Organizer dashboard types
// ---------------------------------------------------------------------------

export interface OrganizerHackathonSummary {
  hackathon_id: string
  name: string
  status: string
  start_date: string
  end_date: string
  participant_count: number
  team_count: number
  submission_count: number
}

export interface OrganizerDashboard {
  my_hackathons: OrganizerHackathonSummary[]
  total_participants: number
  total_teams: number
  total_submissions: number
  pending_judgments: number
}

// ---------------------------------------------------------------------------
// Hackathon overview types
// ---------------------------------------------------------------------------

export interface TrackDistribution {
  [trackName: string]: number
}

export interface HackathonStats {
  participant_count: number
  team_count: number
  submission_count: number
  builder_count: number
  judge_count: number
  track_distribution: TrackDistribution
}

export interface ActivityItem {
  activity_type: string
  description: string
  timestamp: string
}

export interface HackathonOverview {
  hackathon_id: string
  name: string
  description: string
  status: string
  start_date: string
  end_date: string
  location: string
  stats: HackathonStats
  recent_activity: ActivityItem[]
}

// ---------------------------------------------------------------------------
// Attendee dashboard types
// ---------------------------------------------------------------------------

export interface AttendeeMini {
  participant_id: string
  name: string
  handle: string
  initials: string
  location: string
  skills: string[]
}

export interface AttendeeStats {
  registered: number
  submissions: number
  wins: number
  credentials: number
}

export interface AttendeeRegistration {
  hackathon_id: string
  name: string
  status: string
  role: string
  team: string | null
  dates: string[]
  location: string
  ticket: string
  submission_status: string | null
  project: string | null
}

export interface AttendeeDashboard {
  me: AttendeeMini
  stats: AttendeeStats
  registrations: AttendeeRegistration[]
  next_deadline: { hackathon: string; label: string; at: string } | null
  active_team: {
    name: string
    hackathon: string
    role: string
    members: { name: string; handle: string; role: string; initials: string }[]
    open_slots: number
  } | null
  current_submission: {
    project_name: string
    hackathon: string
    track: string
    status: string
    updated_at: string
    repo: string
    checklist: [string, boolean][]
  } | null
  tickets: {
    hackathon: string
    tier: string
    amount: number
    currency: string
    status: string
    purchased_at: string
    order_id: string
  }[]
  credentials: unknown[]
  recommended: { hackathon_id: string; name: string; reason: string; starts: string }[]
}

// ---------------------------------------------------------------------------
// The dashboard endpoints live outside /api/v1, so we must call them on the
// base origin.  We derive the origin from NEXT_PUBLIC_API_URL.
// ---------------------------------------------------------------------------

function dashboardUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL || 'https://dothack.ainative.studio/api/v1'
  // Strip the /api/v1 suffix to get the root origin
  const origin = base.replace(/\/api\/v\d+$/, '')
  return `${origin}${path}`
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * GET /dashboard/organizer
 *
 * Returns a summary of all hackathons managed by the authenticated organizer.
 */
export async function getOrganizerDashboard(token: string): Promise<OrganizerDashboard> {
  const res = await fetch(dashboardUrl('/dashboard/organizer'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

/**
 * GET /dashboard/hackathons/:id/overview
 *
 * Returns detailed stats and activity for a specific hackathon.
 */
export async function getHackathonOverview(
  hackathonId: string,
  token: string
): Promise<HackathonOverview> {
  const res = await fetch(dashboardUrl(`/dashboard/hackathons/${hackathonId}/overview`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

/**
 * GET /me/dashboard
 *
 * Returns the signed-in builder's personal dashboard (registrations, team,
 * current submission, credentials, and recommendations).
 */
export async function getAttendeeDashboard(token: string): Promise<AttendeeDashboard> {
  return apiClient<AttendeeDashboard>('/me/dashboard', { token })
}
