/**
 * DotHack ZeroPipeline CRM API
 *
 * API client functions for the ZeroPipeline CRM integration endpoints.
 * All functions accept an optional `token` string for authorization.
 */

import { apiClient } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ZeroPipelineSyncOptions {
  pipelines: boolean
  deals: boolean
  customers: boolean
  tasks: boolean
}

export interface ZeroPipelineStatus {
  connected: boolean
  integration_id?: string
  account_name?: string
  status?: string
  sync_options?: ZeroPipelineSyncOptions
  last_synced_at?: string
}

export interface ZeroPipelineConnectResponse {
  success: boolean
  integration_id: string
  account_name: string
  status: string
  message: string
}

export interface ZeroPipelineDisconnectResponse {
  success: boolean
  message: string
}

export interface PipelineSummary {
  pipeline_id: string
  name: string
  stage_count: number
  deal_count: number
}

export interface PipelinesListResponse {
  pipelines: PipelineSummary[]
  total: number
}

export interface DealSummary {
  deal_id: string
  title: string
  value?: number
  currency?: string
  stage?: string
  status?: string
  customer_name?: string
}

export interface DealsListResponse {
  deals: DealSummary[]
  total: number
}

export interface CustomerSummary {
  customer_id: string
  name?: string
  email?: string
  company?: string
}

export interface CustomersListResponse {
  customers: CustomerSummary[]
  total: number
}

export interface ImportCustomersResponse {
  success: boolean
  imported: number
  skipped: number
  total: number
  message: string
}

export interface DashboardSummary {
  total_deals: number
  total_customers: number
  total_revenue?: number
  pipeline_count: number
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/** POST /integrations/zeropipeline/connect */
export async function connectZeroPipeline(
  apiKey: string,
  token?: string
): Promise<ZeroPipelineConnectResponse> {
  return apiClient<ZeroPipelineConnectResponse>('/integrations/zeropipeline/connect', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey }),
    token,
  })
}

/** GET /integrations/zeropipeline/status */
export async function getZeroPipelineStatus(token?: string): Promise<ZeroPipelineStatus> {
  return apiClient<ZeroPipelineStatus>('/integrations/zeropipeline/status', { token })
}

/** DELETE /integrations/zeropipeline/disconnect */
export async function disconnectZeroPipeline(token?: string): Promise<ZeroPipelineDisconnectResponse> {
  return apiClient<ZeroPipelineDisconnectResponse>('/integrations/zeropipeline/disconnect', {
    method: 'DELETE',
    token,
  })
}

/** PUT /integrations/zeropipeline/sync-options */
export async function updateZeroPipelineSyncOptions(
  options: ZeroPipelineSyncOptions,
  token?: string
): Promise<ZeroPipelineStatus> {
  return apiClient<ZeroPipelineStatus>('/integrations/zeropipeline/sync-options', {
    method: 'PUT',
    body: JSON.stringify(options),
    token,
  })
}

/** GET /integrations/zeropipeline/pipelines */
export async function listZeroPipelinePipelines(token?: string): Promise<PipelinesListResponse> {
  return apiClient<PipelinesListResponse>('/integrations/zeropipeline/pipelines', { token })
}

/** GET /integrations/zeropipeline/deals */
export async function listZeroPipelineDeals(
  pipelineId?: string,
  token?: string
): Promise<DealsListResponse> {
  const path = pipelineId
    ? `/integrations/zeropipeline/deals?pipeline_id=${encodeURIComponent(pipelineId)}`
    : '/integrations/zeropipeline/deals'
  return apiClient<DealsListResponse>(path, { token })
}

/** GET /integrations/zeropipeline/customers */
export async function listZeroPipelineCustomers(token?: string): Promise<CustomersListResponse> {
  return apiClient<CustomersListResponse>('/integrations/zeropipeline/customers', { token })
}

/** POST /integrations/zeropipeline/import-customers */
export async function importZeroPipelineCustomers(
  hackathonId: string,
  pipelineId?: string,
  token?: string
): Promise<ImportCustomersResponse> {
  return apiClient<ImportCustomersResponse>('/integrations/zeropipeline/import-customers', {
    method: 'POST',
    body: JSON.stringify({ hackathon_id: hackathonId, pipeline_id: pipelineId }),
    token,
  })
}

/** GET /integrations/zeropipeline/dashboard */
export async function getZeroPipelineDashboard(token?: string): Promise<DashboardSummary> {
  return apiClient<DashboardSummary>('/integrations/zeropipeline/dashboard', { token })
}
