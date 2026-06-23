/**
 * DotHack Search API
 *
 * Wraps the search endpoint:
 *   POST /search  — full-text + semantic search across hackathons, submissions, and teams
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SearchEntityType = 'hackathon' | 'submission' | 'team'

export interface SearchParams {
  query: string
  entity_type?: SearchEntityType
  limit?: number
  offset?: number
}

export interface SearchResultMetadata {
  entity_type: SearchEntityType
  title: string
  description: string
  status: string
}

export interface SearchResult {
  id: string
  score: number
  metadata: SearchResultMetadata
}

export interface SearchResponse {
  query: string
  total_results: number
  results: SearchResult[]
  limit: number
  offset: number
  has_more: boolean
  execution_time_ms: number
}

// ---------------------------------------------------------------------------
// API function
// ---------------------------------------------------------------------------

/**
 * POST /search
 *
 * Performs a ranked semantic + keyword search across the DotHack index.
 */
export async function search(
  params: SearchParams,
  token?: string
): Promise<SearchResponse> {
  return apiClient<SearchResponse>('/search', {
    method: 'POST',
    body: JSON.stringify(params),
    token,
  })
}
