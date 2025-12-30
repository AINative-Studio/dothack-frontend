import { zeroDBClient } from '../zerodb'
import type { Participant, HackathonParticipant } from '../types'

export interface CreateParticipantInput {
  name: string
  email: string
  org?: string
}

export interface EnrollParticipantInput {
  hackathon_id: string
  participant_id: string
  role: 'BUILDER' | 'JUDGE' | 'MENTOR' | 'ORGANIZER' | 'SPONSOR'
}

export interface ListParticipantsParams {
  limit?: number
  offset?: number
}

export interface ListHackathonParticipantsParams {
  hackathon_id?: string
  role?: 'BUILDER' | 'JUDGE' | 'MENTOR' | 'ORGANIZER' | 'SPONSOR'
  limit?: number
  offset?: number
}

export async function createParticipant(input: CreateParticipantInput): Promise<Participant> {
  const existingParticipants = await zeroDBClient.queryRows<Participant>('participants', {
    filter: { email: input.email },
    limit: 1
  })

  if (existingParticipants.success && existingParticipants.rows && existingParticipants.rows.length > 0) {
    return existingParticipants.rows[0]
  }

  const participant: Partial<Participant> = {
    participant_id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    org: input.org
  }

  const response = await zeroDBClient.insertRows<Partial<Participant>>('participants', [participant])

  if (!response.success) {
    throw new Error(response.error || 'Failed to create participant')
  }

  return participant as Participant
}

export async function enrollParticipant(input: EnrollParticipantInput): Promise<HackathonParticipant> {
  const enrollment: HackathonParticipant = {
    hackathon_id: input.hackathon_id,
    participant_id: input.participant_id,
    role: input.role
  }

  const response = await zeroDBClient.insertRows<HackathonParticipant>('hackathon_participants', [enrollment])

  if (!response.success) {
    throw new Error(response.error || 'Failed to enroll participant')
  }

  return enrollment
}

export async function registerAndEnroll(
  participantInput: CreateParticipantInput,
  enrollmentInput: Omit<EnrollParticipantInput, 'participant_id'>
): Promise<{ participant: Participant; enrollment: HackathonParticipant }> {
  const participant = await createParticipant(participantInput)
  const enrollment = await enrollParticipant({
    ...enrollmentInput,
    participant_id: participant.participant_id
  })

  return { participant, enrollment }
}

export async function listParticipants(params: ListParticipantsParams = {}): Promise<Participant[]> {
  const response = await zeroDBClient.queryRows<Participant>('participants', {
    limit: params.limit || 100,
    offset: params.offset || 0
  })

  if (!response.success) {
    throw new Error(response.error || 'Failed to list participants')
  }

  return response.rows || []
}

export async function listHackathonParticipants(
  params: ListHackathonParticipantsParams = {}
): Promise<HackathonParticipant[]> {
  const filter: Record<string, any> = {}

  if (params.hackathon_id) {
    filter.hackathon_id = params.hackathon_id
  }

  if (params.role) {
    filter.role = params.role
  }

  const response = await zeroDBClient.queryRows<HackathonParticipant>('hackathon_participants', {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    limit: params.limit || 100,
    offset: params.offset || 0
  })

  if (!response.success) {
    throw new Error(response.error || 'Failed to list hackathon participants')
  }

  return response.rows || []
}

export async function getParticipantsByHackathon(hackathonId: string): Promise<HackathonParticipant[]> {
  return listHackathonParticipants({ hackathon_id: hackathonId })
}

export async function getParticipantsByRole(
  hackathonId: string,
  role: 'BUILDER' | 'JUDGE' | 'MENTOR' | 'ORGANIZER' | 'SPONSOR'
): Promise<HackathonParticipant[]> {
  return listHackathonParticipants({ hackathon_id: hackathonId, role })
}
