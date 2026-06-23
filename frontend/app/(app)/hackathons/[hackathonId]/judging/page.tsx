"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useHackathon,
  useSubmissions,
  useLeaderboard,
  useSubmitScore,
  useRubrics,
} from '@/hooks/use-api'
import { useAuth } from '@/lib/auth/auth-context'
import { Gavel, Loader2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import type { SubmitScoreParams } from '@/lib/api/judging'
import type { RubricCriterion } from '@/lib/api/hackathons-backend'

export default function JudgingPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { user } = useAuth()

  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)
  const { data: submissionsData, isLoading: submissionsLoading } = useSubmissions({
    hackathon_id: params.hackathonId,
  })
  const { data: rubricsData, isLoading: rubricsLoading } = useRubrics(params.hackathonId)
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(params.hackathonId)

  const submitScore = useSubmitScore()

  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')

  const isLoading =
    hackathonLoading || submissionsLoading || rubricsLoading || leaderboardLoading

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p style={{ color: 'var(--ink)', opacity: 0.6 }}>Hackathon not found</p>
      </div>
    )
  }

  const submissions = submissionsData?.submissions ?? []
  const rubrics = rubricsData?.rubrics ?? []
  const leaderboardEntries = leaderboard?.entries ?? []

  // Prefer active rubric, fall back to first available
  const activeRubric = rubrics.find((r) => r.is_active) ?? rubrics[0]

  const handleSubmitScore = async (submissionId: string) => {
    if (!user) {
      toast.error('You must be logged in to submit scores')
      return
    }

    if (!activeRubric) {
      toast.error('No rubric defined. Please create a rubric in Setup first.')
      return
    }

    try {
      // Calculate total score from criterion scores
      const totalScore = activeRubric.criteria.reduce((sum, criterion) => {
        return sum + (criterionScores[criterion.name] ?? 0)
      }, 0)

      const scoreParams: SubmitScoreParams = {
        submission_id: submissionId,
        hackathon_id: params.hackathonId,
        rubric_id: activeRubric.rubric_id,
        judge_id: (user as any).id ?? (user as any).email ?? 'judge',
        criteria: criterionScores,
        score: totalScore,
        comment: comment || undefined,
      }

      await submitScore.mutateAsync(scoreParams)

      toast.success('Score submitted successfully')
      setSelectedSubmission(null)
      setCriterionScores({})
      setComment('')
    } catch (error) {
      console.error('Failed to submit score:', error)
      toast.error('Failed to submit score', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const getLeaderboardEntry = (submissionId: string) =>
    leaderboardEntries.find((e) => e.submission_id === submissionId)

  const inputStyle = {
    border: '2px solid var(--ink)',
    borderRadius: 0,
    background: 'var(--cream)',
    color: 'var(--ink)',
    fontFamily: 'JetBrains Mono, monospace',
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}
        >
          Judging
        </h1>
        <p style={{ color: 'var(--ink)', opacity: 0.6 }}>{hackathon.name}</p>
      </div>

      {/* Rubric display */}
      {rubrics.length === 0 ? (
        <Card
          className="mb-8"
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardContent className="py-8 text-center">
            <p style={{ color: 'var(--ink)', opacity: 0.6 }}>
              No rubrics defined. Please create a rubric in Setup first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="mb-8"
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
            <CardTitle style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}>
              Active Rubric
              {activeRubric && (
                <span
                  style={{
                    marginLeft: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    border: '2px solid var(--accent)',
                    color: 'var(--accent)',
                  }}
                >
                  {activeRubric.name}
                </span>
              )}
            </CardTitle>
            <CardDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
              Evaluation criteria for this hackathon
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {activeRubric ? (
              <div className="space-y-2">
                {activeRubric.criteria.map((criterion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid var(--ink)',
                      background: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: 'Archivo, sans-serif',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        {criterion.name}
                      </span>
                      {criterion.description && (
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.8rem',
                            color: 'var(--ink)',
                            opacity: 0.6,
                          }}
                        >
                          {criterion.description}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.75rem',
                        color: 'var(--ink)',
                        opacity: 0.6,
                        whiteSpace: 'nowrap',
                        marginLeft: '12px',
                      }}
                    >
                      max {criterion.max_score} · {(criterion.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--ink)', opacity: 0.5, fontSize: '0.875rem' }}>
                No active rubric
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submissions to judge */}
      {submissions.length === 0 ? (
        <Card
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardContent className="text-center py-12">
            <p style={{ color: 'var(--ink)', opacity: 0.6 }}>No submissions to judge yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const existingEntry = getLeaderboardEntry(submission.submission_id)
            const isScoring = selectedSubmission === submission.submission_id

            return (
              <Card
                key={submission.submission_id}
                style={{
                  borderRadius: 0,
                  border: '2px solid var(--ink)',
                  background: 'var(--cream)',
                }}
              >
                <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle
                        className="flex items-center gap-2"
                        style={{
                          fontFamily: 'Archivo, sans-serif',
                          color: 'var(--ink)',
                          fontSize: '1.1rem',
                        }}
                      >
                        <Gavel className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                        {submission.project_name}
                      </CardTitle>
                      <div className="flex gap-2 mt-2 flex-wrap items-center">
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            border: '2px solid var(--ink)',
                            color: 'var(--ink)',
                          }}
                        >
                          {submission.team_name}
                        </span>
                        {submission.track && (
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              border: '2px solid var(--accent)',
                              color: 'var(--accent)',
                            }}
                          >
                            {submission.track}
                          </span>
                        )}
                        {existingEntry && (
                          <span
                            className="flex items-center gap-1"
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#16a34a',
                            }}
                          >
                            <Trophy className="h-3 w-3" />
                            Rank #{existingEntry.rank} · avg {existingEntry.average_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isScoring && activeRubric && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission.submission_id)
                          // Pre-fill zeros for each criterion
                          const initial: Record<string, number> = {}
                          activeRubric.criteria.forEach((c) => {
                            initial[c.name] = 0
                          })
                          setCriterionScores(initial)
                        }}
                        style={{
                          background: 'var(--ink)',
                          color: 'var(--cream)',
                          border: '2px solid var(--ink)',
                          borderRadius: 0,
                          fontFamily: 'Archivo, sans-serif',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          flexShrink: 0,
                        }}
                      >
                        Score
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p
                    style={{
                      color: 'var(--ink)',
                      opacity: 0.8,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {submission.description}
                  </p>

                  {isScoring && activeRubric && (
                    <div
                      style={{
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '2px solid var(--ink)',
                      }}
                    >
                      <h4
                        style={{
                          fontFamily: 'Archivo, sans-serif',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          marginBottom: '1rem',
                        }}
                      >
                        Score this submission
                      </h4>

                      <div className="space-y-4">
                        {activeRubric.criteria.map((criterion) => (
                          <div key={criterion.name} className="space-y-1">
                            <Label
                              style={{
                                fontFamily: 'Archivo, sans-serif',
                                fontWeight: 700,
                                color: 'var(--ink)',
                              }}
                            >
                              {criterion.name}
                              <span style={{ fontWeight: 400, opacity: 0.6 }}>
                                {' '}
                                (0–{criterion.max_score}, weight {(criterion.weight * 100).toFixed(0)}%)
                              </span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max={criterion.max_score}
                              value={criterionScores[criterion.name] ?? 0}
                              onChange={(e) =>
                                setCriterionScores({
                                  ...criterionScores,
                                  [criterion.name]: Number(e.target.value),
                                })
                              }
                              placeholder={`0–${criterion.max_score}`}
                              style={inputStyle}
                            />
                          </div>
                        ))}

                        <div className="space-y-1">
                          <Label
                            style={{
                              fontFamily: 'Archivo, sans-serif',
                              fontWeight: 700,
                              color: 'var(--ink)',
                            }}
                          >
                            Comment{' '}
                            <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                          </Label>
                          <Textarea
                            placeholder="Provide constructive feedback..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            style={{
                              border: '2px solid var(--ink)',
                              borderRadius: 0,
                              background: 'var(--cream)',
                              color: 'var(--ink)',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          />
                        </div>

                        <div
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.03)',
                            border: '1px solid var(--ink)',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.8rem',
                            color: 'var(--ink)',
                          }}
                        >
                          Total score:{' '}
                          <strong>
                            {activeRubric.criteria.reduce(
                              (sum, c) => sum + (criterionScores[c.name] ?? 0),
                              0
                            )}
                          </strong>
                          /{' '}
                          {activeRubric.criteria.reduce((sum, c) => sum + c.max_score, 0)}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSubmitScore(submission.submission_id)}
                            disabled={submitScore.isPending}
                            style={{
                              background: 'var(--ink)',
                              color: 'var(--cream)',
                              border: '2px solid var(--ink)',
                              borderRadius: 0,
                              fontFamily: 'Archivo, sans-serif',
                              fontWeight: 700,
                            }}
                          >
                            {submitScore.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Score'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedSubmission(null)
                              setCriterionScores({})
                              setComment('')
                            }}
                            disabled={submitScore.isPending}
                            style={{
                              border: '2px solid var(--ink)',
                              borderRadius: 0,
                              background: 'transparent',
                              color: 'var(--ink)',
                              fontFamily: 'Archivo, sans-serif',
                              fontWeight: 700,
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
