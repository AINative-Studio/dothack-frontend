import {
  createHackathon,
  updateHackathon,
  type CreateHackathonInput,
  type Hackathon,
} from '@/lib/api/hackathons'
import { createTrack, type CreateTrackInput, type Track } from '@/lib/api/tracks'
import { createRubric, type CreateRubricInput, type Rubric } from '@/lib/api/rubrics'
import { APIError } from '@/lib/error-handling'

export interface HackathonLifecycleInput {
  hackathon: CreateHackathonInput
  tracks: CreateTrackInput[]
  rubric: CreateRubricInput
}

export interface HackathonLifecycleResult {
  hackathon: Hackathon
  tracks: Track[]
  rubric: Rubric
}

export interface HackathonLifecycleError extends Error {
  phase: 'validation' | 'hackathon_create' | 'tracks_create' | 'rubric_create'
  hackathonId?: string
  createdTracks?: Track[]
  canRetry: boolean
}

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['LIVE'],
  LIVE: ['CLOSED'],
  CLOSED: [],
}

export async function createHackathonWithSetup(
  input: HackathonLifecycleInput
): Promise<HackathonLifecycleResult> {
  const { hackathon: hackathonInput, tracks: tracksInput, rubric: rubricInput } = input

  if (!hackathonInput.name?.trim()) {
    throw createLifecycleError('validation', 'Hackathon name is required', false)
  }

  if (!tracksInput || tracksInput.length === 0) {
    throw createLifecycleError('validation', 'At least one track is required', false)
  }

  if (!rubricInput.criteria_json) {
    throw createLifecycleError('validation', 'Rubric criteria are required', false)
  }

  let hackathon: Hackathon | null = null

  try {
    hackathon = await createHackathon({
      ...hackathonInput,
      status: 'DRAFT',
    })
  } catch (error) {
    throw createLifecycleError(
      'hackathon_create',
      `Failed to create hackathon: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    )
  }

  const createdTracks: Track[] = []

  try {
    for (const trackInput of tracksInput) {
      const track = await createTrack({
        ...trackInput,
        hackathon_id: hackathon.hackathon_id,
      })
      createdTracks.push(track)
    }
  } catch (error) {
    throw createLifecycleError(
      'tracks_create',
      `Failed to create tracks: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true,
      hackathon.hackathon_id,
      createdTracks
    )
  }

  let rubric: Rubric

  try {
    rubric = await createRubric({
      ...rubricInput,
      hackathon_id: hackathon.hackathon_id,
    })
  } catch (error) {
    throw createLifecycleError(
      'rubric_create',
      `Failed to create rubric: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true,
      hackathon.hackathon_id,
      createdTracks
    )
  }

  return {
    hackathon,
    tracks: createdTracks,
    rubric,
  }
}

export async function transitionHackathonStatus(
  hackathonId: string,
  currentStatus: 'DRAFT' | 'LIVE' | 'CLOSED',
  newStatus: 'DRAFT' | 'LIVE' | 'CLOSED'
): Promise<Hackathon> {
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus]

  if (!validTransitions || !validTransitions.includes(newStatus)) {
    throw new APIError(
      `Invalid status transition: ${currentStatus} → ${newStatus}. Valid transitions: ${validTransitions?.join(', ') || 'none'}`,
      400
    )
  }

  try {
    return await updateHackathon({
      hackathon_id: hackathonId,
      status: newStatus,
    })
  } catch (error) {
    throw new APIError(
      `Failed to transition hackathon status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}

export function canTransitionStatus(
  currentStatus: 'DRAFT' | 'LIVE' | 'CLOSED',
  newStatus: 'DRAFT' | 'LIVE' | 'CLOSED'
): boolean {
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus]
  return validTransitions ? validTransitions.includes(newStatus) : false
}

export function getValidTransitions(status: 'DRAFT' | 'LIVE' | 'CLOSED'): string[] {
  return VALID_STATUS_TRANSITIONS[status] || []
}

function createLifecycleError(
  phase: HackathonLifecycleError['phase'],
  message: string,
  canRetry: boolean,
  hackathonId?: string,
  createdTracks?: Track[]
): HackathonLifecycleError {
  const error = new Error(message) as HackathonLifecycleError
  error.name = 'HackathonLifecycleError'
  error.phase = phase
  error.canRetry = canRetry
  error.hackathonId = hackathonId
  error.createdTracks = createdTracks
  return error
}

export function isHackathonLifecycleError(error: unknown): error is HackathonLifecycleError {
  return error instanceof Error && error.name === 'HackathonLifecycleError'
}
