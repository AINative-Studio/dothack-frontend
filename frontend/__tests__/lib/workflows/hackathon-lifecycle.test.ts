import {
  createHackathonWithSetup,
  transitionHackathonStatus,
  canTransitionStatus,
  getValidTransitions,
  isHackathonLifecycleError,
  type HackathonLifecycleInput,
} from '@/lib/workflows/hackathon-lifecycle'
import * as hackathonsApi from '@/lib/api/hackathons'
import * as tracksApi from '@/lib/api/tracks'
import * as rubricsApi from '@/lib/api/rubrics'

jest.mock('@/lib/api/hackathons')
jest.mock('@/lib/api/tracks')
jest.mock('@/lib/api/rubrics')

describe('hackathon-lifecycle', () => {
  const mockHackathonInput = {
    name: 'Test Hackathon',
    description: 'Test Description',
    start_at: '2025-01-01T00:00:00Z',
    end_at: '2025-01-31T23:59:59Z',
  }

  const mockTracksInput = [
    {
      name: 'Track 1',
      description: 'Track 1 Description',
    },
    {
      name: 'Track 2',
      description: 'Track 2 Description',
    },
  ]

  const mockRubricInput = {
    criteria_json: JSON.stringify({
      innovation: { weight: 0.4, max_score: 10 },
      technical: { weight: 0.3, max_score: 10 },
      design: { weight: 0.3, max_score: 10 },
    }),
  }

  const mockHackathon = {
    hackathon_id: 'hackathon-123',
    name: 'Test Hackathon',
    status: 'DRAFT' as const,
    start_at: '2025-01-01T00:00:00Z',
    end_at: '2025-01-31T23:59:59Z',
  }

  const mockTracks = [
    {
      track_id: 'track-1',
      hackathon_id: 'hackathon-123',
      name: 'Track 1',
      description: 'Track 1 Description',
    },
    {
      track_id: 'track-2',
      hackathon_id: 'hackathon-123',
      name: 'Track 2',
      description: 'Track 2 Description',
    },
  ]

  const mockRubric = {
    rubric_id: 'rubric-123',
    hackathon_id: 'hackathon-123',
    criteria_json: mockRubricInput.criteria_json,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createHackathonWithSetup', () => {
    it('successfully creates hackathon with tracks and rubric', async () => {
      jest.spyOn(hackathonsApi, 'createHackathon').mockResolvedValue(mockHackathon)
      jest
        .spyOn(tracksApi, 'createTrack')
        .mockResolvedValueOnce(mockTracks[0])
        .mockResolvedValueOnce(mockTracks[1])
      jest.spyOn(rubricsApi, 'createRubric').mockResolvedValue(mockRubric)

      const input: HackathonLifecycleInput = {
        hackathon: mockHackathonInput,
        tracks: mockTracksInput,
        rubric: mockRubricInput,
      }

      const result = await createHackathonWithSetup(input)

      expect(result.hackathon).toEqual(mockHackathon)
      expect(result.tracks).toEqual(mockTracks)
      expect(result.rubric).toEqual(mockRubric)
      expect(hackathonsApi.createHackathon).toHaveBeenCalledWith({
        ...mockHackathonInput,
        status: 'DRAFT',
      })
      expect(tracksApi.createTrack).toHaveBeenCalledTimes(2)
      expect(rubricsApi.createRubric).toHaveBeenCalledWith({
        ...mockRubricInput,
        hackathon_id: mockHackathon.hackathon_id,
      })
    })

    it('throws validation error when hackathon name is empty', async () => {
      const input: HackathonLifecycleInput = {
        hackathon: { ...mockHackathonInput, name: '' },
        tracks: mockTracksInput,
        rubric: mockRubricInput,
      }

      await expect(createHackathonWithSetup(input)).rejects.toMatchObject({
        name: 'HackathonLifecycleError',
        phase: 'validation',
        message: 'Hackathon name is required',
        canRetry: false,
      })

      expect(hackathonsApi.createHackathon).not.toHaveBeenCalled()
    })

    it('throws validation error when no tracks provided', async () => {
      const input: HackathonLifecycleInput = {
        hackathon: mockHackathonInput,
        tracks: [],
        rubric: mockRubricInput,
      }

      await expect(createHackathonWithSetup(input)).rejects.toMatchObject({
        name: 'HackathonLifecycleError',
        phase: 'validation',
        message: 'At least one track is required',
        canRetry: false,
      })

      expect(hackathonsApi.createHackathon).not.toHaveBeenCalled()
    })

    it('throws validation error when rubric criteria missing', async () => {
      const input: HackathonLifecycleInput = {
        hackathon: mockHackathonInput,
        tracks: mockTracksInput,
        rubric: { criteria_json: '' },
      }

      await expect(createHackathonWithSetup(input)).rejects.toMatchObject({
        name: 'HackathonLifecycleError',
        phase: 'validation',
        message: 'Rubric criteria are required',
        canRetry: false,
      })

      expect(hackathonsApi.createHackathon).not.toHaveBeenCalled()
    })

    it('throws error when hackathon creation fails', async () => {
      jest.spyOn(hackathonsApi, 'createHackathon').mockRejectedValue(new Error('Database error'))

      const input: HackathonLifecycleInput = {
        hackathon: mockHackathonInput,
        tracks: mockTracksInput,
        rubric: mockRubricInput,
      }

      await expect(createHackathonWithSetup(input)).rejects.toMatchObject({
        name: 'HackathonLifecycleError',
        phase: 'hackathon_create',
        canRetry: true,
      })

      expect(tracksApi.createTrack).not.toHaveBeenCalled()
    })

    it('throws error with hackathon ID when track creation fails', async () => {
      jest.spyOn(hackathonsApi, 'createHackathon').mockResolvedValue(mockHackathon)
      jest
        .spyOn(tracksApi, 'createTrack')
        .mockResolvedValueOnce(mockTracks[0])
        .mockRejectedValueOnce(new Error('Track creation failed'))

      const input: HackathonLifecycleInput = {
        hackathon: mockHackathonInput,
        tracks: mockTracksInput,
        rubric: mockRubricInput,
      }

      await expect(createHackathonWithSetup(input)).rejects.toMatchObject({
        name: 'HackathonLifecycleError',
        phase: 'tracks_create',
        canRetry: true,
        hackathonId: mockHackathon.hackathon_id,
        createdTracks: [mockTracks[0]],
      })

      expect(rubricsApi.createRubric).not.toHaveBeenCalled()
    })

    it('throws error with hackathon ID when rubric creation fails', async () => {
      jest.spyOn(hackathonsApi, 'createHackathon').mockResolvedValue(mockHackathon)
      jest
        .spyOn(tracksApi, 'createTrack')
        .mockResolvedValueOnce(mockTracks[0])
        .mockResolvedValueOnce(mockTracks[1])
      jest.spyOn(rubricsApi, 'createRubric').mockRejectedValue(new Error('Rubric creation failed'))

      const input: HackathonLifecycleInput = {
        hackathon: mockHackathonInput,
        tracks: mockTracksInput,
        rubric: mockRubricInput,
      }

      await expect(createHackathonWithSetup(input)).rejects.toMatchObject({
        name: 'HackathonLifecycleError',
        phase: 'rubric_create',
        canRetry: true,
        hackathonId: mockHackathon.hackathon_id,
        createdTracks: mockTracks,
      })
    })
  })

  describe('transitionHackathonStatus', () => {
    it('successfully transitions from DRAFT to LIVE', async () => {
      const updatedHackathon = { ...mockHackathon, status: 'LIVE' as const }
      jest.spyOn(hackathonsApi, 'updateHackathon').mockResolvedValue(updatedHackathon)

      const result = await transitionHackathonStatus('hackathon-123', 'DRAFT', 'LIVE')

      expect(result).toEqual(updatedHackathon)
      expect(hackathonsApi.updateHackathon).toHaveBeenCalledWith({
        hackathon_id: 'hackathon-123',
        status: 'LIVE',
      })
    })

    it('successfully transitions from LIVE to CLOSED', async () => {
      const updatedHackathon = { ...mockHackathon, status: 'CLOSED' as const }
      jest.spyOn(hackathonsApi, 'updateHackathon').mockResolvedValue(updatedHackathon)

      const result = await transitionHackathonStatus('hackathon-123', 'LIVE', 'CLOSED')

      expect(result).toEqual(updatedHackathon)
    })

    it('throws error for invalid transition from DRAFT to CLOSED', async () => {
      await expect(transitionHackathonStatus('hackathon-123', 'DRAFT', 'CLOSED')).rejects.toThrow(
        'Invalid status transition: DRAFT → CLOSED'
      )

      expect(hackathonsApi.updateHackathon).not.toHaveBeenCalled()
    })

    it('throws error for transition from CLOSED status', async () => {
      await expect(transitionHackathonStatus('hackathon-123', 'CLOSED', 'LIVE')).rejects.toThrow(
        'Invalid status transition: CLOSED → LIVE'
      )

      expect(hackathonsApi.updateHackathon).not.toHaveBeenCalled()
    })

    it('throws error when update API fails', async () => {
      jest.spyOn(hackathonsApi, 'updateHackathon').mockRejectedValue(new Error('Update failed'))

      await expect(
        transitionHackathonStatus('hackathon-123', 'DRAFT', 'LIVE')
      ).rejects.toThrow('Failed to transition hackathon status')
    })
  })

  describe('canTransitionStatus', () => {
    it('returns true for valid DRAFT → LIVE transition', () => {
      expect(canTransitionStatus('DRAFT', 'LIVE')).toBe(true)
    })

    it('returns true for valid LIVE → CLOSED transition', () => {
      expect(canTransitionStatus('LIVE', 'CLOSED')).toBe(true)
    })

    it('returns false for invalid DRAFT → CLOSED transition', () => {
      expect(canTransitionStatus('DRAFT', 'CLOSED')).toBe(false)
    })

    it('returns false for any transition from CLOSED', () => {
      expect(canTransitionStatus('CLOSED', 'LIVE')).toBe(false)
      expect(canTransitionStatus('CLOSED', 'DRAFT')).toBe(false)
    })
  })

  describe('getValidTransitions', () => {
    it('returns LIVE for DRAFT status', () => {
      expect(getValidTransitions('DRAFT')).toEqual(['LIVE'])
    })

    it('returns CLOSED for LIVE status', () => {
      expect(getValidTransitions('LIVE')).toEqual(['CLOSED'])
    })

    it('returns empty array for CLOSED status', () => {
      expect(getValidTransitions('CLOSED')).toEqual([])
    })
  })

  describe('isHackathonLifecycleError', () => {
    it('returns true for HackathonLifecycleError', () => {
      const error = new Error('Test') as any
      error.name = 'HackathonLifecycleError'
      error.phase = 'validation'
      error.canRetry = false

      expect(isHackathonLifecycleError(error)).toBe(true)
    })

    it('returns false for regular Error', () => {
      const error = new Error('Test')
      expect(isHackathonLifecycleError(error)).toBe(false)
    })

    it('returns false for non-Error values', () => {
      expect(isHackathonLifecycleError('string')).toBe(false)
      expect(isHackathonLifecycleError(null)).toBe(false)
      expect(isHackathonLifecycleError(undefined)).toBe(false)
    })
  })
})
