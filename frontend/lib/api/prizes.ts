import { zeroDBClient } from '../zerodb-client'
import type { Prize } from '../types'

const TABLE_NAME = 'prizes'

export interface CreatePrizeInput {
  hackathon_id: string
  title: string
  description: string
  amount: string
  rank: number
  track_id?: string
}

export interface UpdatePrizeInput {
  prize_id: string
  title?: string
  description?: string
  amount?: string
  rank?: number
  track_id?: string
}

export async function createPrize(input: CreatePrizeInput): Promise<Prize> {
  if (!input.hackathon_id || !input.hackathon_id.trim()) {
    throw new Error('Hackathon ID is required')
  }
  if (!input.title || !input.title.trim()) {
    throw new Error('Prize title is required')
  }
  if (!input.amount || !input.amount.trim()) {
    throw new Error('Prize amount is required')
  }
  if (input.rank < 1) {
    throw new Error('Prize rank must be at least 1')
  }

  const prize: Prize = {
    prize_id: crypto.randomUUID(),
    hackathon_id: input.hackathon_id,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    amount: input.amount.trim(),
    rank: input.rank,
    track_id: input.track_id?.trim(),
  }

  const response = await zeroDBClient.insertRows<Prize>(TABLE_NAME, [prize])

  if (!response.success) {
    throw new Error(`Failed to create prize: ${response.error || 'Unknown error'}`)
  }

  return prize
}

export async function getPrizesByHackathon(hackathonId: string): Promise<Prize[]> {
  if (!hackathonId || !hackathonId.trim()) {
    throw new Error('Hackathon ID is required')
  }

  const response = await zeroDBClient.queryRows<Prize>(TABLE_NAME, {
    filter: { hackathon_id: hackathonId },
    limit: 100,
  })

  if (!response.success) {
    throw new Error(`Failed to fetch prizes: ${response.error || 'Unknown error'}`)
  }

  return response.rows || []
}

export async function getPrizeById(prizeId: string): Promise<Prize | null> {
  if (!prizeId || !prizeId.trim()) {
    throw new Error('Prize ID is required')
  }

  const response = await zeroDBClient.queryRows<Prize>(TABLE_NAME, {
    filter: { prize_id: prizeId },
    limit: 1,
  })

  if (!response.success) {
    throw new Error(`Failed to fetch prize: ${response.error || 'Unknown error'}`)
  }

  return response.rows?.[0] || null
}

export async function updatePrize(input: UpdatePrizeInput): Promise<Prize> {
  if (!input.prize_id || !input.prize_id.trim()) {
    throw new Error('Prize ID is required')
  }

  const existing = await getPrizeById(input.prize_id)
  if (!existing) {
    throw new Error('Prize not found')
  }

  const updated: Prize = {
    ...existing,
    ...(input.title && { title: input.title.trim() }),
    ...(input.description !== undefined && { description: input.description?.trim() || '' }),
    ...(input.amount && { amount: input.amount.trim() }),
    ...(input.rank !== undefined && { rank: input.rank }),
    ...(input.track_id !== undefined && { track_id: input.track_id?.trim() }),
  }

  const response = await zeroDBClient.updateRows<Prize>(
    TABLE_NAME,
    { prize_id: input.prize_id },
    updated
  )

  if (!response.success) {
    throw new Error(`Failed to update prize: ${response.error || 'Unknown error'}`)
  }

  return updated
}

export async function deletePrize(prizeId: string): Promise<void> {
  if (!prizeId || !prizeId.trim()) {
    throw new Error('Prize ID is required')
  }

  const response = await zeroDBClient.deleteRows(TABLE_NAME, {
    prize_id: prizeId,
  })

  if (!response.success) {
    throw new Error(`Failed to delete prize: ${response.error || 'Unknown error'}`)
  }
}
