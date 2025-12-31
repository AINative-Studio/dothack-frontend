import {
  EmbeddingNamespace,
  DocumentId,
  validateNamespace,
  validateDocumentId,
  validateUUID,
  parseNamespace,
  parseDocumentId,
} from '@/lib/embeddings-namespace'
import { ValidationError } from '@/lib/error-handling'

describe('EmbeddingNamespace', () => {
  const hackathonId = '123e4567-e89b-12d3-a456-426614174000'

  it('generates correct submissions namespace', () => {
    expect(EmbeddingNamespace.submissions(hackathonId)).toBe(
      `hackathons/${hackathonId}/submissions`
    )
  })

  it('generates correct projects namespace', () => {
    expect(EmbeddingNamespace.projects(hackathonId)).toBe(
      `hackathons/${hackathonId}/projects`
    )
  })

  it('generates correct judging namespace', () => {
    expect(EmbeddingNamespace.judging(hackathonId)).toBe(
      `hackathons/${hackathonId}/judging`
    )
  })

  it('throws on invalid UUID', () => {
    expect(() => EmbeddingNamespace.submissions('invalid')).toThrow(ValidationError)
  })
})

describe('DocumentId', () => {
  const submissionId = 'a1b2c3d4-e5f6-4789-a9b0-c1d2e3f4a5b6'
  const projectId = 'b2c3d4e5-f6a7-4819-a0b1-c2d3e4f5a6b7'

  it('generates correct submission ID', () => {
    expect(DocumentId.submission(submissionId)).toBe(`submission:${submissionId}`)
  })

  it('generates correct project ID', () => {
    expect(DocumentId.project(projectId)).toBe(`project:${projectId}`)
  })

  it('throws on invalid UUID', () => {
    expect(() => DocumentId.submission('invalid')).toThrow(ValidationError)
  })
})

describe('validateNamespace', () => {
  const hackathonId = '123e4567-e89b-12d3-a456-426614174000'

  it('accepts valid namespace', () => {
    expect(() =>
      validateNamespace(`hackathons/${hackathonId}/submissions`)
    ).not.toThrow()
  })

  it('rejects empty namespace', () => {
    expect(() => validateNamespace('')).toThrow(ValidationError)
  })

  it('rejects wrong format', () => {
    expect(() => validateNamespace('invalid/format')).toThrow(ValidationError)
  })

  it('rejects invalid UUID', () => {
    expect(() => validateNamespace('hackathons/bad-id/submissions')).toThrow(
      ValidationError
    )
  })

  it('rejects invalid type', () => {
    expect(() => validateNamespace(`hackathons/${hackathonId}/invalid`)).toThrow(
      ValidationError
    )
  })
})

describe('validateDocumentId', () => {
  const submissionId = 'a1b2c3d4-e5f6-4789-a9b0-c1d2e3f4a5b6'

  it('accepts valid submission ID', () => {
    expect(() => validateDocumentId(`submission:${submissionId}`)).not.toThrow()
  })

  it('accepts valid project ID', () => {
    expect(() => validateDocumentId(`project:${submissionId}`)).not.toThrow()
  })

  it('rejects empty ID', () => {
    expect(() => validateDocumentId('')).toThrow(ValidationError)
  })

  it('rejects invalid prefix', () => {
    expect(() => validateDocumentId(`invalid:${submissionId}`)).toThrow(
      ValidationError
    )
  })

  it('rejects invalid UUID', () => {
    expect(() => validateDocumentId('submission:bad-uuid')).toThrow(ValidationError)
  })
})

describe('validateUUID', () => {
  it('accepts valid UUID', () => {
    expect(() =>
      validateUUID('123e4567-e89b-12d3-a456-426614174000', 'testId')
    ).not.toThrow()
  })

  it('rejects invalid UUID', () => {
    expect(() => validateUUID('invalid', 'testId')).toThrow(ValidationError)
  })

  it('rejects empty string', () => {
    expect(() => validateUUID('', 'testId')).toThrow(ValidationError)
  })
})

describe('parseNamespace', () => {
  const hackathonId = '123e4567-e89b-12d3-a456-426614174000'

  it('parses submissions namespace', () => {
    const result = parseNamespace(`hackathons/${hackathonId}/submissions`)
    expect(result).toEqual({ hackathonId, type: 'submissions' })
  })

  it('parses projects namespace', () => {
    const result = parseNamespace(`hackathons/${hackathonId}/projects`)
    expect(result).toEqual({ hackathonId, type: 'projects' })
  })

  it('throws on invalid namespace', () => {
    expect(() => parseNamespace('invalid')).toThrow(ValidationError)
  })
})

describe('parseDocumentId', () => {
  const submissionId = 'a1b2c3d4-e5f6-4789-a9b0-c1d2e3f4a5b6'

  it('parses submission ID', () => {
    const result = parseDocumentId(`submission:${submissionId}`)
    expect(result).toEqual({ type: 'submission', id: submissionId })
  })

  it('parses project ID', () => {
    const result = parseDocumentId(`project:${submissionId}`)
    expect(result).toEqual({ type: 'project', id: submissionId })
  })

  it('throws on invalid ID', () => {
    expect(() => parseDocumentId('submission:invalid')).toThrow(ValidationError)
  })
})
