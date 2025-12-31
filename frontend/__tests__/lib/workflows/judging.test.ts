import {
  scoreSubmission,
  calculateTotalScore,
  getSubmissionsForJudging,
  validateAllCriteriaScored,
  isJudgingError,
  type JudgingInput,
} from '@/lib/workflows/judging'
import * as submissionsApi from '@/lib/api/submissions'
import * as rubricsApi from '@/lib/api/rubrics'
import * as scoresApi from '@/lib/api/scores'

jest.mock('@/lib/api/submissions')
jest.mock('@/lib/api/rubrics')
jest.mock('@/lib/api/scores')

describe('judging', () => {
  const mockCriteria = {
    innovation: { weight: 0.4, max_score: 10 },
    technical: { weight: 0.3, max_score: 10 },
    design: { weight: 0.3, max_score: 10 },
  }

  const mockRubric = {
    rubric_id: 'rubric-123',
    hackathon_id: 'hackathon-123',
    criteria_json: JSON.stringify(mockCriteria),
  }

  const mockScore = {
    score_id: 'score-123',
    submission_id: 'submission-123',
    judge_id: 'judge-123',
    score_json: JSON.stringify({ innovation: 8, technical: 7, design: 9 }),
    total_score: 80,
    feedback: 'Great work!',
  }

  const mockSubmissions = [
    {
      submission_id: 'submission-123',
      project_id: 'project-123',
      submission_text: 'Test submission',
      artifact_links_json: JSON.stringify(['https://github.com/test']),
      created_at: '2025-12-31T00:00:00Z',
    },
    {
      submission_id: 'submission-456',
      project_id: 'project-456',
      submission_text: 'Another submission',
      artifact_links_json: JSON.stringify(['https://github.com/test2']),
      created_at: '2025-12-31T01:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('scoreSubmission', () => {
    const validInput: JudgingInput = {
      hackathonId: 'hackathon-123',
      submissionId: 'submission-123',
      judgeId: 'judge-123',
      criteriaScores: {
        innovation: 8,
        technical: 7,
        design: 9,
      },
      feedback: 'Great work!',
    }

    it('successfully scores submission with all criteria', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockResolvedValue([mockRubric])
      jest.spyOn(scoresApi, 'createScore').mockResolvedValue(mockScore)

      const result = await scoreSubmission(validInput)

      expect(result.score).toEqual(mockScore)
      expect(result.totalScore).toBeCloseTo(80, 1)
      expect(rubricsApi.listRubrics).toHaveBeenCalledWith({
        hackathon_id: 'hackathon-123',
        limit: 1,
      })
      expect(scoresApi.createScore).toHaveBeenCalledWith({
        submission_id: 'submission-123',
        judge_id: 'judge-123',
        score_json: JSON.stringify(validInput.criteriaScores),
        total_score: expect.any(Number),
        feedback: 'Great work!',
      })
    })

    it('successfully scores submission without feedback', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockResolvedValue([mockRubric])
      jest.spyOn(scoresApi, 'createScore').mockResolvedValue(mockScore)

      const input: JudgingInput = {
        ...validInput,
        feedback: undefined,
      }

      const result = await scoreSubmission(input)

      expect(result.score).toEqual(mockScore)
      expect(scoresApi.createScore).toHaveBeenCalledWith(
        expect.objectContaining({
          feedback: undefined,
        })
      )
    })

    it('throws validation error when submission ID is empty', async () => {
      const input: JudgingInput = {
        ...validInput,
        submissionId: '',
      }

      await expect(scoreSubmission(input)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'validation',
        message: 'Submission ID is required',
        canRetry: false,
      })

      expect(rubricsApi.listRubrics).not.toHaveBeenCalled()
    })

    it('throws validation error when judge ID is empty', async () => {
      const input: JudgingInput = {
        ...validInput,
        judgeId: '',
      }

      await expect(scoreSubmission(input)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'validation',
        message: 'Judge ID is required',
        canRetry: false,
      })

      expect(rubricsApi.listRubrics).not.toHaveBeenCalled()
    })

    it('throws validation error when criteria scores are empty', async () => {
      const input: JudgingInput = {
        ...validInput,
        criteriaScores: {},
      }

      await expect(scoreSubmission(input)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'validation',
        message: 'At least one criterion score is required',
        canRetry: false,
      })

      expect(rubricsApi.listRubrics).not.toHaveBeenCalled()
    })

    it('throws error when rubric fetch fails', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockRejectedValue(new Error('Fetch failed'))

      await expect(scoreSubmission(validInput)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'rubric_fetch',
        canRetry: true,
      })

      expect(scoresApi.createScore).not.toHaveBeenCalled()
    })

    it('throws error when no rubric found', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockResolvedValue([])

      await expect(scoreSubmission(validInput)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'rubric_fetch',
        message: 'Failed to fetch rubric: No rubric found for this hackathon',
        canRetry: true,
      })

      expect(scoresApi.createScore).not.toHaveBeenCalled()
    })

    it('throws validation error when rubric criteria format is invalid', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockResolvedValue([
        {
          ...mockRubric,
          criteria_json: 'invalid-json',
        },
      ])

      await expect(scoreSubmission(validInput)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'validation',
        message: 'Invalid rubric criteria format',
        canRetry: false,
        submissionId: 'submission-123',
      })

      expect(scoresApi.createScore).not.toHaveBeenCalled()
    })

    it('throws validation error when missing score for criterion', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockResolvedValue([mockRubric])

      const input: JudgingInput = {
        ...validInput,
        criteriaScores: {
          innovation: 8,
          technical: 7,
        },
      }

      await expect(scoreSubmission(input)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'validation',
        message: 'Missing score for criterion: design',
        canRetry: false,
        submissionId: 'submission-123',
      })

      expect(scoresApi.createScore).not.toHaveBeenCalled()
    })

    it('throws validation error when score exceeds max', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockResolvedValue([mockRubric])

      const input: JudgingInput = {
        ...validInput,
        criteriaScores: {
          innovation: 11,
          technical: 7,
          design: 9,
        },
      }

      await expect(scoreSubmission(input)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'validation',
        message: 'Score for innovation must be between 0 and 10',
        canRetry: false,
        submissionId: 'submission-123',
      })

      expect(scoresApi.createScore).not.toHaveBeenCalled()
    })

    it('throws validation error when score is negative', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockResolvedValue([mockRubric])

      const input: JudgingInput = {
        ...validInput,
        criteriaScores: {
          innovation: -1,
          technical: 7,
          design: 9,
        },
      }

      await expect(scoreSubmission(input)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'validation',
        message: 'Score for innovation must be between 0 and 10',
        canRetry: false,
        submissionId: 'submission-123',
      })

      expect(scoresApi.createScore).not.toHaveBeenCalled()
    })

    it('throws error when score creation fails', async () => {
      jest.spyOn(rubricsApi, 'listRubrics').mockResolvedValue([mockRubric])
      jest.spyOn(scoresApi, 'createScore').mockRejectedValue(new Error('Creation failed'))

      await expect(scoreSubmission(validInput)).rejects.toMatchObject({
        name: 'JudgingError',
        phase: 'score_create',
        canRetry: true,
        submissionId: 'submission-123',
      })
    })
  })

  describe('calculateTotalScore', () => {
    it('calculates weighted average correctly', () => {
      const criteriaScores = {
        innovation: 8,
        technical: 7,
        design: 9,
      }

      const result = calculateTotalScore(criteriaScores, mockCriteria)

      expect(result).toBeCloseTo(80, 1)
    })

    it('calculates score when all scores are max', () => {
      const criteriaScores = {
        innovation: 10,
        technical: 10,
        design: 10,
      }

      const result = calculateTotalScore(criteriaScores, mockCriteria)

      expect(result).toBe(100)
    })

    it('calculates score when all scores are zero', () => {
      const criteriaScores = {
        innovation: 0,
        technical: 0,
        design: 0,
      }

      const result = calculateTotalScore(criteriaScores, mockCriteria)

      expect(result).toBe(0)
    })

    it('returns 0 when total weight is 0', () => {
      const criteriaScores = { test: 10 }
      const criteria = { test: { weight: 0, max_score: 10 } }

      const result = calculateTotalScore(criteriaScores, criteria)

      expect(result).toBe(0)
    })
  })

  describe('getSubmissionsForJudging', () => {
    it('successfully fetches submissions for hackathon', async () => {
      jest.spyOn(submissionsApi, 'getSubmissionsByHackathon').mockResolvedValue(mockSubmissions)

      const result = await getSubmissionsForJudging('hackathon-123')

      expect(result).toEqual(mockSubmissions)
      expect(submissionsApi.getSubmissionsByHackathon).toHaveBeenCalledWith('hackathon-123')
    })

    it('successfully fetches submissions with track filter', async () => {
      jest.spyOn(submissionsApi, 'getSubmissionsByHackathon').mockResolvedValue(mockSubmissions)

      const result = await getSubmissionsForJudging('hackathon-123', 'track-123')

      expect(result).toEqual(mockSubmissions)
    })

    it('throws APIError when fetch fails', async () => {
      jest
        .spyOn(submissionsApi, 'getSubmissionsByHackathon')
        .mockRejectedValue(new Error('Fetch failed'))

      await expect(getSubmissionsForJudging('hackathon-123')).rejects.toThrow(
        'Failed to fetch submissions'
      )
    })
  })

  describe('validateAllCriteriaScored', () => {
    it('returns true when all criteria are scored', () => {
      const criteriaScores = {
        innovation: 8,
        technical: 7,
        design: 9,
      }

      const result = validateAllCriteriaScored(criteriaScores, mockCriteria)

      expect(result).toBe(true)
    })

    it('returns false when some criteria are missing', () => {
      const criteriaScores = {
        innovation: 8,
        technical: 7,
      }

      const result = validateAllCriteriaScored(criteriaScores, mockCriteria)

      expect(result).toBe(false)
    })

    it('returns true when no criteria exist', () => {
      const result = validateAllCriteriaScored({}, {})

      expect(result).toBe(true)
    })
  })

  describe('isJudgingError', () => {
    it('returns true for JudgingError', () => {
      const error = new Error('Test') as any
      error.name = 'JudgingError'
      error.phase = 'validation'
      error.canRetry = false

      expect(isJudgingError(error)).toBe(true)
    })

    it('returns false for regular Error', () => {
      const error = new Error('Test')
      expect(isJudgingError(error)).toBe(false)
    })

    it('returns false for non-Error values', () => {
      expect(isJudgingError('string')).toBe(false)
      expect(isJudgingError(null)).toBe(false)
      expect(isJudgingError(undefined)).toBe(false)
    })
  })
})
