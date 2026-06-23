import { hackathonsAPI } from './backend-client'
import { validateUUID } from '@/lib/validation'
import { handleAPIError, showErrorToast, APIError } from '@/lib/error-handling'
import type { Hackathon, HackathonStatus } from '@/lib/types'

export interface CreateHackathonInput {
  name: string
  description?: string
  organizer_id: string
  start_date: string
  end_date: string
  location?: string
  registration_deadline?: string
  max_participants?: number
  website_url?: string
  logo_url?: string
  is_online?: boolean
  prizes?: Record<string, any>
  rules?: string
  status?: HackathonStatus
}

export interface UpdateHackathonInput {
  hackathon_id: string
  name?: string
  description?: string
  status?: HackathonStatus
  start_date?: string
  end_date?: string
  location?: string
  registration_deadline?: string
  max_participants?: number
  website_url?: string
  logo_url?: string
  is_online?: boolean
  prizes?: Record<string, any>
  rules?: string
}

export interface ListHackathonsParams {
  status?: HackathonStatus
  limit?: number
  skip?: number
}

export { Hackathon }

export async function createHackathon(input: CreateHackathonInput): Promise<Hackathon> {
  try {
    if (!input.name || input.name.trim().length === 0) {
      throw new APIError('Hackathon name is required')
    }

    if (!input.start_date || !input.end_date) {
      throw new APIError('Start and end dates are required')
    }

    const startDate = new Date(input.start_date)
    const endDate = new Date(input.end_date)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new APIError('Invalid date format')
    }

    if (startDate >= endDate) {
      throw new APIError('Start date must be before end date')
    }

    const hackathon = await hackathonsAPI.create({
      name: input.name.trim(),
      description: input.description?.trim(),
      organizer_id: input.organizer_id,
      start_date: input.start_date,
      end_date: input.end_date,
      location: input.location,
      registration_deadline: input.registration_deadline,
      max_participants: input.max_participants,
      website_url: input.website_url,
      logo_url: input.logo_url,
      is_online: input.is_online,
      prizes: input.prizes,
      rules: input.rules,
      status: input.status || 'draft',
    })

    return hackathon
  } catch (error: any) {
    const apiError = handleAPIError(error, {
      endpoint: '/hackathons',
      method: 'POST',
      payload: input
    })
    showErrorToast(apiError, 'Failed to create hackathon')
    throw apiError
  }
}

export async function listHackathons(params: ListHackathonsParams = {}): Promise<Hackathon[]> {
  try {
    const response = await hackathonsAPI.list({
      skip: params.skip,
      limit: params.limit,
      status: params.status
    })

    return response.hackathons
  } catch (error: any) {
    const apiError = handleAPIError(error, {
      endpoint: '/hackathons',
      method: 'GET'
    })
    showErrorToast(apiError, 'Failed to fetch hackathons')
    throw apiError
  }
}

export async function getHackathonById(hackathonId: string): Promise<Hackathon | null> {
  try {
    validateUUID(hackathonId, 'hackathon_id')

    const hackathon = await hackathonsAPI.get(hackathonId)
    return hackathon
  } catch (error: any) {
    // If 404, return null
    if (error.status === 404) {
      return null
    }

    const apiError = handleAPIError(error, {
      endpoint: `/hackathons/${hackathonId}`,
      method: 'GET'
    })
    showErrorToast(apiError, 'Failed to fetch hackathon')
    throw apiError
  }
}

export async function getHackathonsByStatus(status: HackathonStatus): Promise<Hackathon[]> {
  return listHackathons({ status })
}

export async function updateHackathon(input: UpdateHackathonInput): Promise<Hackathon> {
  try {
    validateUUID(input.hackathon_id, 'hackathon_id')

    const existing = await getHackathonById(input.hackathon_id)
    if (!existing) {
      throw new APIError('Hackathon not found', 404)
    }

    const updates: Record<string, any> = {}

    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        throw new APIError('Hackathon name cannot be empty')
      }
      updates.name = input.name.trim()
    }

    if (input.description !== undefined) {
      if (input.description.trim().length === 0) {
        throw new APIError('Hackathon description cannot be empty')
      }
      updates.description = input.description.trim()
    }

    if (input.status !== undefined) {
      const validTransitions: Record<string, string[]> = {
        'DRAFT': ['LIVE', 'CLOSED'],
        'LIVE': ['CLOSED'],
        'CLOSED': []
      }

      if (!validTransitions[existing.status].includes(input.status)) {
        throw new APIError(`Cannot transition from ${existing.status} to ${input.status}`)
      }

      updates.status = input.status
    }

    if (input.start_at !== undefined || input.end_at !== undefined) {
      const startAt = input.start_at || existing.start_at
      const endAt = input.end_at || existing.end_at

      const startDate = new Date(startAt)
      const endDate = new Date(endAt)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new APIError('Invalid date format')
      }

      if (startDate >= endDate) {
        throw new APIError('Start date must be before end date')
      }

      if (input.start_at !== undefined) updates.start_at = input.start_at
      if (input.end_at !== undefined) updates.end_at = input.end_at
    }

    if (Object.keys(updates).length === 0) {
      return existing
    }

    const filter = { hackathon_id: input.hackathon_id }
    const update = { $set: updates }

    const response = await zeroDBClient.queryRows<Hackathon>(TABLE_NAME, {
      filter,
      limit: 1
    })

    if (!response.success || !response.rows || response.rows.length === 0) {
      throw new APIError('Hackathon not found', 404)
    }

    const updatedHackathon = { ...response.rows[0], ...updates }

    await zeroDBClient.insertRows<Hackathon>(TABLE_NAME, [updatedHackathon])

    return updatedHackathon
  } catch (error: any) {
    const apiError = handleAPIError(error, {
      endpoint: `/database/tables/${TABLE_NAME}/rows`,
      method: 'PATCH',
      payload: input
    })
    showErrorToast(apiError, 'Failed to update hackathon')
    throw apiError
  }
}

export async function deleteHackathon(hackathonId: string): Promise<void> {
  try {
    validateUUID(hackathonId, 'hackathon_id')

    const existing = await getHackathonById(hackathonId)
    if (!existing) {
      throw new APIError('Hackathon not found', 404)
    }

    if (existing.status === 'LIVE') {
      throw new APIError('Cannot delete a live hackathon')
    }

    throw new APIError('Delete operation not supported by ZeroDB client yet')
  } catch (error: any) {
    const apiError = handleAPIError(error, {
      endpoint: `/database/tables/${TABLE_NAME}/rows`,
      method: 'DELETE'
    })
    showErrorToast(apiError, 'Failed to delete hackathon')
    throw apiError
  }
}
