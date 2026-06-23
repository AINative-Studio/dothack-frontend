/**
 * Backend API Client
 *
 * Centralized client for all backend API communications.
 * Replaces direct ZeroDB access with FastAPI backend calls.
 */

import { apiClient } from '../api-client'
import type {
  Hackathon,
  Track,
  Prize,
  Rubric,
  Invitation,
  Project,
  HackathonStatus,
} from '../types'

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

export interface FeaturedHackathon {
  featured_id: string
  hackathon_id: string
  title: string
  logo_url: string
  days_left: number
  is_online: boolean
  prize_amount: number
  participant_count: number
  display_order: number
  featured_until?: string
  is_featured: boolean
  created_at: string
}

export interface HackathonTheme {
  theme_id: string
  theme_name: string
  hackathon_count: number
  total_prizes: number
  display_order: number
  created_at: string
}

export interface DashboardStats {
  total_hackathons: number
  active_hackathons: number
  total_participants: number
  total_prizes: number
}

// ============================================================================
// Hackathons API
// ============================================================================

export const hackathonsAPI = {
  /**
   * List all hackathons with optional filtering
   */
  async list(params?: {
    skip?: number
    limit?: number
    status?: HackathonStatus
  }): Promise<{ hackathons: Hackathon[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)

    const url = `hackathons${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get<{ hackathons: Hackathon[]; total: number }>(url)
  },

  /**
   * Get a single hackathon by ID
   */
  async get(hackathonId: string): Promise<Hackathon> {
    return apiClient.get<Hackathon>(`hackathons/${hackathonId}`)
  },

  /**
   * Create a new hackathon
   */
  async create(data: Partial<Hackathon>): Promise<Hackathon> {
    return apiClient.post<Hackathon>('hackathons', data)
  },

  /**
   * Update a hackathon
   */
  async update(hackathonId: string, data: Partial<Hackathon>): Promise<Hackathon> {
    return apiClient.patch<Hackathon>(`hackathons/${hackathonId}`, data)
  },

  /**
   * Delete a hackathon (soft delete)
   */
  async delete(hackathonId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`hackathons/${hackathonId}`)
  },
}

// ============================================================================
// Featured Hackathons API (PUBLIC)
// ============================================================================

export const featuredHackathonsAPI = {
  /**
   * List featured hackathons (PUBLIC - no auth required)
   */
  async list(): Promise<{ featured_hackathons: FeaturedHackathon[]; total: number }> {
    return apiClient.get<{ featured_hackathons: FeaturedHackathon[]; total: number }>(
      'featured-hackathons',
      { skipAuth: true }
    )
  },

  /**
   * Get a single featured hackathon (PUBLIC)
   */
  async get(featuredId: string): Promise<FeaturedHackathon> {
    return apiClient.get<FeaturedHackathon>(`featured-hackathons/${featuredId}`, {
      skipAuth: true,
    })
  },

  /**
   * Create featured hackathon (ADMIN only)
   */
  async create(data: {
    hackathon_id: string
    display_order: number
    featured_until?: string
  }): Promise<FeaturedHackathon> {
    return apiClient.post<FeaturedHackathon>('featured-hackathons', data)
  },

  /**
   * Update featured hackathon (ADMIN only)
   */
  async update(featuredId: string, data: Partial<FeaturedHackathon>): Promise<FeaturedHackathon> {
    return apiClient.put<FeaturedHackathon>(`featured-hackathons/${featuredId}`, data)
  },

  /**
   * Delete featured hackathon (ADMIN only)
   */
  async delete(featuredId: string): Promise<void> {
    return apiClient.delete<void>(`featured-hackathons/${featuredId}`)
  },
}

// ============================================================================
// Hackathon Themes API (PUBLIC)
// ============================================================================

export const hackathonThemesAPI = {
  /**
   * List hackathon themes (PUBLIC - no auth required)
   */
  async list(): Promise<{ themes: HackathonTheme[]; total: number }> {
    return apiClient.get<{ themes: HackathonTheme[]; total: number }>('hackathon-themes', {
      skipAuth: true,
    })
  },

  /**
   * Get a single theme (PUBLIC)
   */
  async get(themeId: string): Promise<HackathonTheme> {
    return apiClient.get<HackathonTheme>(`hackathon-themes/${themeId}`, { skipAuth: true })
  },

  /**
   * Create theme (ADMIN only)
   */
  async create(data: {
    theme_name: string
    display_order: number
  }): Promise<HackathonTheme> {
    return apiClient.post<HackathonTheme>('hackathon-themes', data)
  },

  /**
   * Update theme (ADMIN only)
   */
  async update(themeId: string, data: Partial<HackathonTheme>): Promise<HackathonTheme> {
    return apiClient.put<HackathonTheme>(`hackathon-themes/${themeId}`, data)
  },

  /**
   * Delete theme (ADMIN only)
   */
  async delete(themeId: string): Promise<void> {
    return apiClient.delete<void>(`hackathon-themes/${themeId}`)
  },
}

// ============================================================================
// Tracks API
// ============================================================================

export const tracksAPI = {
  /**
   * List tracks for a hackathon
   */
  async list(hackathonId: string): Promise<{ tracks: Track[]; total: number }> {
    return apiClient.get<{ tracks: Track[]; total: number }>(
      `hackathons/${hackathonId}/tracks`
    )
  },

  /**
   * Get a single track
   */
  async get(hackathonId: string, trackId: string): Promise<Track> {
    return apiClient.get<Track>(`hackathons/${hackathonId}/tracks/${trackId}`)
  },

  /**
   * Create a track
   */
  async create(hackathonId: string, data: Partial<Track>): Promise<Track> {
    return apiClient.post<Track>(`hackathons/${hackathonId}/tracks`, data)
  },

  /**
   * Update a track
   */
  async update(hackathonId: string, trackId: string, data: Partial<Track>): Promise<Track> {
    return apiClient.patch<Track>(`hackathons/${hackathonId}/tracks/${trackId}`, data)
  },

  /**
   * Delete a track
   */
  async delete(hackathonId: string, trackId: string): Promise<void> {
    return apiClient.delete<void>(`hackathons/${hackathonId}/tracks/${trackId}`)
  },
}

// ============================================================================
// Prizes API
// ============================================================================

export const prizesAPI = {
  /**
   * List prizes for a hackathon
   */
  async list(hackathonId: string): Promise<{ prizes: Prize[]; total: number }> {
    return apiClient.get<{ prizes: Prize[]; total: number }>(
      `hackathons/${hackathonId}/prizes`
    )
  },

  /**
   * Get a single prize
   */
  async get(hackathonId: string, prizeId: string): Promise<Prize> {
    return apiClient.get<Prize>(`hackathons/${hackathonId}/prizes/${prizeId}`)
  },

  /**
   * Create a prize
   */
  async create(hackathonId: string, data: Partial<Prize>): Promise<Prize> {
    return apiClient.post<Prize>(`hackathons/${hackathonId}/prizes`, data)
  },

  /**
   * Update a prize
   */
  async update(hackathonId: string, prizeId: string, data: Partial<Prize>): Promise<Prize> {
    return apiClient.patch<Prize>(`hackathons/${hackathonId}/prizes/${prizeId}`, data)
  },

  /**
   * Delete a prize
   */
  async delete(hackathonId: string, prizeId: string): Promise<void> {
    return apiClient.delete<void>(`hackathons/${hackathonId}/prizes/${prizeId}`)
  },
}

// ============================================================================
// Rubrics API
// ============================================================================

export const rubricsAPI = {
  /**
   * List rubrics for a hackathon
   */
  async list(hackathonId: string): Promise<{ rubrics: Rubric[]; total: number }> {
    return apiClient.get<{ rubrics: Rubric[]; total: number }>(
      `hackathons/${hackathonId}/rubrics`
    )
  },

  /**
   * Get a single rubric
   */
  async get(hackathonId: string, rubricId: string): Promise<Rubric> {
    return apiClient.get<Rubric>(`hackathons/${hackathonId}/rubrics/${rubricId}`)
  },

  /**
   * Create a rubric
   */
  async create(hackathonId: string, data: Partial<Rubric>): Promise<Rubric> {
    return apiClient.post<Rubric>(`hackathons/${hackathonId}/rubrics`, data)
  },

  /**
   * Update a rubric
   */
  async update(hackathonId: string, rubricId: string, data: Partial<Rubric>): Promise<Rubric> {
    return apiClient.patch<Rubric>(`hackathons/${hackathonId}/rubrics/${rubricId}`, data)
  },

  /**
   * Delete a rubric
   */
  async delete(hackathonId: string, rubricId: string): Promise<void> {
    return apiClient.delete<void>(`hackathons/${hackathonId}/rubrics/${rubricId}`)
  },
}

// ============================================================================
// Projects API
// ============================================================================

export const projectsAPI = {
  /**
   * List projects for a hackathon
   */
  async list(hackathonId: string): Promise<{ projects: Project[]; total: number }> {
    return apiClient.get<{ projects: Project[]; total: number }>(
      `hackathons/${hackathonId}/projects`
    )
  },

  /**
   * Get a single project
   */
  async get(hackathonId: string, projectId: string): Promise<Project> {
    return apiClient.get<Project>(`hackathons/${hackathonId}/projects/${projectId}`)
  },

  /**
   * Create a project
   */
  async create(hackathonId: string, data: Partial<Project>): Promise<Project> {
    return apiClient.post<Project>(`hackathons/${hackathonId}/projects`, data)
  },

  /**
   * Update a project
   */
  async update(hackathonId: string, projectId: string, data: Partial<Project>): Promise<Project> {
    return apiClient.patch<Project>(`hackathons/${hackathonId}/projects/${projectId}`, data)
  },

  /**
   * Delete a project
   */
  async delete(hackathonId: string, projectId: string): Promise<void> {
    return apiClient.delete<void>(`hackathons/${hackathonId}/projects/${projectId}`)
  },
}

// ============================================================================
// Invitations API
// ============================================================================

export const invitationsAPI = {
  /**
   * List invitations for a hackathon
   */
  async list(hackathonId: string): Promise<{ invitations: Invitation[]; total: number }> {
    return apiClient.get<{ invitations: Invitation[]; total: number }>(
      `hackathons/${hackathonId}/invitations`
    )
  },

  /**
   * Get a single invitation
   */
  async get(hackathonId: string, invitationId: string): Promise<Invitation> {
    return apiClient.get<Invitation>(`hackathons/${hackathonId}/invitations/${invitationId}`)
  },

  /**
   * Create invitations (bulk)
   */
  async create(
    hackathonId: string,
    data: { emails: string[]; role: string; message?: string }
  ): Promise<{ invitations: Invitation[]; total: number }> {
    return apiClient.post<{ invitations: Invitation[]; total: number }>(
      `hackathons/${hackathonId}/invitations`,
      data
    )
  },

  /**
   * Accept invitation
   */
  async accept(hackathonId: string, invitationId: string): Promise<Invitation> {
    return apiClient.patch<Invitation>(
      `hackathons/${hackathonId}/invitations/${invitationId}/accept`,
      {}
    )
  },

  /**
   * Decline invitation
   */
  async decline(hackathonId: string, invitationId: string): Promise<Invitation> {
    return apiClient.patch<Invitation>(
      `hackathons/${hackathonId}/invitations/${invitationId}/decline`,
      {}
    )
  },

  /**
   * Delete invitation
   */
  async delete(hackathonId: string, invitationId: string): Promise<void> {
    return apiClient.delete<void>(`hackathons/${hackathonId}/invitations/${invitationId}`)
  },
}

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardAPI = {
  /**
   * Get organizer dashboard data
   */
  async organizer(): Promise<{
    stats: DashboardStats
    hackathons: Hackathon[]
    recent_activity: any[]
  }> {
    return apiClient.get<{
      stats: DashboardStats
      hackathons: Hackathon[]
      recent_activity: any[]
    }>('dashboard/organizer')
  },

  /**
   * Get builder dashboard data
   */
  async builder(): Promise<{
    stats: DashboardStats
    hackathons: Hackathon[]
    projects: Project[]
  }> {
    return apiClient.get<{
      stats: DashboardStats
      hackathons: Hackathon[]
      projects: Project[]
    }>('dashboard/builder')
  },

  /**
   * Get judge dashboard data
   */
  async judge(): Promise<{
    stats: DashboardStats
    hackathons: Hackathon[]
    pending_reviews: any[]
  }> {
    return apiClient.get<{
      stats: DashboardStats
      hackathons: Hackathon[]
      pending_reviews: any[]
    }>('dashboard/judge')
  },
}
