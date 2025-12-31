import { ValidationError } from './error-handling'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validateUUIDInternal(value: string, fieldName: string): void {
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a non-empty string`)
  }

  if (!UUID_REGEX.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`)
  }
}

export const EmbeddingNamespace = {
  submissions: (hackathonId: string): string => {
    validateUUIDInternal(hackathonId, 'hackathonId')
    return `hackathons/${hackathonId}/submissions`
  },

  projects: (hackathonId: string): string => {
    validateUUIDInternal(hackathonId, 'hackathonId')
    return `hackathons/${hackathonId}/projects`
  },

  judging: (hackathonId: string): string => {
    validateUUIDInternal(hackathonId, 'hackathonId')
    return `hackathons/${hackathonId}/judging`
  },
}

export const DocumentId = {
  submission: (submissionId: string): string => {
    validateUUIDInternal(submissionId, 'submissionId')
    return `submission:${submissionId}`
  },

  project: (projectId: string): string => {
    validateUUIDInternal(projectId, 'projectId')
    return `project:${projectId}`
  },
}

export function validateNamespace(namespace: string): void {
  if (!namespace || typeof namespace !== 'string') {
    throw new ValidationError('Namespace must be a non-empty string')
  }

  if (!namespace.startsWith('hackathons/')) {
    throw new ValidationError('Namespace must start with "hackathons/"')
  }

  const parts = namespace.split('/')
  if (parts.length !== 3) {
    throw new ValidationError(
      'Namespace must follow format: hackathons/{hackathon_id}/{type}'
    )
  }

  const hackathonId = parts[1]
  if (!UUID_REGEX.test(hackathonId)) {
    throw new ValidationError(
      `Invalid hackathon ID in namespace: ${hackathonId}`
    )
  }

  const type = parts[2]
  const validTypes = ['submissions', 'projects', 'judging']
  if (!validTypes.includes(type)) {
    throw new ValidationError(
      `Invalid namespace type: ${type}. Must be one of: ${validTypes.join(', ')}`
    )
  }
}

export function validateDocumentId(docId: string): void {
  if (!docId || typeof docId !== 'string') {
    throw new ValidationError('Document ID must be a non-empty string')
  }

  const validPrefixes = ['submission:', 'project:']
  const hasValidPrefix = validPrefixes.some((prefix) =>
    docId.startsWith(prefix)
  )

  if (!hasValidPrefix) {
    throw new ValidationError(
      `Document ID must start with one of: ${validPrefixes.join(', ')}`
    )
  }

  const prefix = docId.split(':')[0]
  const id = docId.substring(prefix.length + 1)

  if (!UUID_REGEX.test(id)) {
    throw new ValidationError(`Invalid UUID in document ID: ${id}`)
  }
}

export function validateUUID(value: string, fieldName: string): void {
  validateUUIDInternal(value, fieldName)
}

export function parseNamespace(namespace: string): {
  hackathonId: string
  type: 'submissions' | 'projects' | 'judging'
} {
  validateNamespace(namespace)

  const parts = namespace.split('/')
  return {
    hackathonId: parts[1],
    type: parts[2] as 'submissions' | 'projects' | 'judging',
  }
}

export function parseDocumentId(docId: string): {
  type: 'submission' | 'project'
  id: string
} {
  validateDocumentId(docId)

  const colonIndex = docId.indexOf(':')
  const type = docId.substring(0, colonIndex) as 'submission' | 'project'
  const id = docId.substring(colonIndex + 1)

  return { type, id }
}
