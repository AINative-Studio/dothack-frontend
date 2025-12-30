import { zeroDBClient } from '../zerodb'
import type { Rubric } from '../types'

export interface RubricCriterion {
  criterion_id: string
  name: string
  description: string
  weight: number
  max_score: number
}

export interface CreateRubricInput {
  hackathon_id: string
  title: string
  criteria: RubricCriterion[]
}

export interface ListRubricsParams {
  hackathon_id?: string
  limit?: number
  offset?: number
}

export async function createRubric(input: CreateRubricInput): Promise<Rubric> {
  const rubric: Partial<Rubric> = {
    rubric_id: crypto.randomUUID(),
    hackathon_id: input.hackathon_id,
    title: input.title,
    criteria_json: JSON.stringify(input.criteria)
  }

  const response = await zeroDBClient.insertRows<Partial<Rubric>>('rubrics', [rubric])

  if (!response.success) {
    throw new Error(response.error || 'Failed to create rubric')
  }

  return rubric as Rubric
}

export async function listRubrics(params: ListRubricsParams = {}): Promise<Rubric[]> {
  const filter: Record<string, any> = {}

  if (params.hackathon_id) {
    filter.hackathon_id = params.hackathon_id
  }

  const response = await zeroDBClient.queryRows<Rubric>('rubrics', {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    limit: params.limit || 100,
    offset: params.offset || 0
  })

  if (!response.success) {
    throw new Error(response.error || 'Failed to list rubrics')
  }

  return response.rows || []
}

export async function getRubricByHackathon(hackathonId: string): Promise<Rubric | null> {
  const rubrics = await listRubrics({ hackathon_id: hackathonId, limit: 1 })
  return rubrics.length > 0 ? rubrics[0] : null
}

export function parseCriteria(rubric: Rubric): RubricCriterion[] {
  try {
    return JSON.parse(rubric.criteria_json)
  } catch (error) {
    console.error('Failed to parse rubric criteria:', error)
    return []
  }
}

export function validateCriteria(criteria: RubricCriterion[]): string | null {
  if (criteria.length === 0) {
    return 'At least one criterion is required'
  }

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  if (Math.abs(totalWeight - 1) > 0.01) {
    return 'Criterion weights must sum to 1.0'
  }

  for (const criterion of criteria) {
    if (!criterion.name || criterion.name.trim().length === 0) {
      return 'All criteria must have a name'
    }
    if (criterion.weight <= 0 || criterion.weight > 1) {
      return 'Criterion weights must be between 0 and 1'
    }
    if (criterion.max_score <= 0) {
      return 'Max score must be greater than 0'
    }
  }

  return null
}
