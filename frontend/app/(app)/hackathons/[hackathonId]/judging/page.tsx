"use client"

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  useHackathon,
  useSubmissions,
  useLeaderboard,
  useSubmitScore,
} from '@/hooks/use-api'
import { useAuth } from '@/lib/auth/auth-context'
import { apiClient } from '@/lib/api/client'
import { Gavel, Loader2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import type { Rubric } from '@/lib/types'
import type { SubmitScoreParams } from '@/lib/api/judging'

export default function JudgingPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { token, user } = useAuth()

  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)

  const { data: submissionsData, isLoading: submissionsLoading } = useSubmissions({
    hackathon_id: params.hackathonId,
  })

  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(params.hackathonId)

  // Rubrics via apiClient — no dedicated hook in use-api.ts yet
  const { data: rubricsData, isLoading: rubricsLoading } = useQuery<Rubric[]>({
    queryKey: ['dothack', 'rubrics', params.hackathonId],
    queryFn: () =>
      apiClient<Rubric[]>(`/hackathons/${params.hackathonId}/rubrics`, {
        token: token ?? undefined,
      }),
    enabled: !!params.hackathonId,
  })

  const submitScore = useSubmitScore()

  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState('')

  const isLoading = hackathonLoading || submissionsLoading || rubricsLoading || leaderboardLoading

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
  const rubrics = rubricsData ?? []
  const leaderboardEntries = leaderboard?.entries ?? []

  // Parse criteria from first rubric if available
  let rubricCriteria: Record<string, { weight?: number; max?: number }> = {}
  const activeRubric = rubrics[0]
  if (activeRubric) {
    try {
      rubricCriteria = JSON.parse(activeRubric.criteria_json)
    } catch {
      rubricCriteria = {}
    }
  }

  const handleSubmitScore = async (submissionId: string) => {
    if (!user) {
      toast.error('You must be logged in to submit scores')
      return
    }

    const activeRubricId = rubrics[0]?.rubric_id
    if (!activeRubricId) {
      toast.error('No rubric defined. Please create a rubric in Setup first.')
      return
    }

    try {
      const totalScore = Object.values(criterionScores).reduce((sum, s) => sum + s, 0)

      const scoreParams: SubmitScoreParams = {
        submission_id: submissionId,
        hackathon_id: params.hackathonId,
        rubric_id: activeRubricId,
        judge_id: user.id ?? user.email ?? 'judge',
        criteria: criterionScores,
        score: totalScore,
        comment: feedback || undefined,
      }

      await submitScore.mutateAsync(scoreParams)

      toast.success('Score submitted successfully')
      setSelectedSubmission(null)
      setCriterionScores({})
      setFeedback('')
    } catch (error) {
      console.error('Failed to submit score:', error)
      toast.error('Failed to submit score', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const getScoreForSubmission = (submissionId: string) => {
    return leaderboardEntries.find((e) => e.submission_id === submissionId)
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
              Judging Rubric
            </CardTitle>
            <CardDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
              Evaluation criteria for this hackathon
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {rubrics.map((rubric) => (
                <div
                  key={rubric.rubric_id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--ink)',
                    background: 'rgba(0,0,0,0.02)',
                  }}
                >
                  <h4
                    style={{
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      marginBottom: '8px',
                    }}
                  >
                    {rubric.title}
                  </h4>
                  <pre
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.75rem',
                      color: 'var(--ink)',
                      opacity: 0.8,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rubric.criteria_json}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions to judge */}
      {submissions.length === 0 ? (
        <Card
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardContent className="text-center py-12">
            <p style={{ color: 'var(--ink)', opacity: 0.6 }}>
              No submissions to judge yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const existingScore = getScoreForSubmission(submission.submission_id)
            const isScoring = selectedSubmission === submission.submission_id

            return (
              <Card
                key={submission.submission_id}
                style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
              >
                <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle
                        className="flex items-center gap-2"
                        style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)', fontSize: '1.1rem' }}
                      >
                        <Gavel className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                        {submission.project_name}
                      </CardTitle>
                      <div className="flex gap-2 mt-2 flex-wrap items-center">
                        <Badge
                          variant="outline"
                          style={{
                            borderRadius: 0,
                            border: '2px solid var(--ink)',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.7rem',
                            color: 'var(--ink)',
                          }}
                        >
                          {submission.team_name}
                        </Badge>
                        {submission.track && (
                          <Badge
                            variant="outline"
                            style={{
                              borderRadius: 0,
                              border: '2px solid var(--accent)',
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '0.7rem',
                              color: 'var(--accent)',
                            }}
                          >
                            {submission.track}
                          </Badge>
                        )}
                        {existingScore && (
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '0.7rem',
                              color: '#16a34a',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Trophy className="h-3 w-3" />
                            Rank #{existingScore.rank} — {existingScore.average_score.toFixed(1)} avg
                          </span>
                        )}
                      </div>
                    </div>
                    {!isScoring && rubrics.length > 0 && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedSubmission(submission.submission_id)}
                        style={{
                          background: 'var(--ink)',
                          color: 'var(--cream)',
                          border: '2px solid var(--ink)',
                          borderRadius: 0,
                          fontFamily: 'Archivo, sans-serif',
                          fontWeight: 700,
                          fontSize: '0.8rem',
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

                  {isScoring && (
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
                        {Object.keys(rubricCriteria).length === 0 ? (
                          <div className="space-y-2">
                            <Label
                              style={{
                                fontFamily: 'Archivo, sans-serif',
                                fontWeight: 700,
                                color: 'var(--ink)',
                              }}
                            >
                              Overall Score (0–100)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={criterionScores['overall'] ?? ''}
                              onChange={(e) =>
                                setCriterionScores({ ...criterionScores, overall: Number(e.target.value) })
                              }
                              placeholder="0–100"
                              style={{
                                border: '2px solid var(--ink)',
                                borderRadius: 0,
                                background: 'var(--cream)',
                                color: 'var(--ink)',
                                fontFamily: 'JetBrains Mono, monospace',
                              }}
                            />
                          </div>
                        ) : (
                          Object.entries(rubricCriteria).map(([criterion, config]) => (
                            <div key={criterion} className="space-y-2">
                              <Label
                                style={{
                                  fontFamily: 'Archivo, sans-serif',
                                  fontWeight: 700,
                                  color: 'var(--ink)',
                                }}
                              >
                                {criterion.charAt(0).toUpperCase() + criterion.slice(1)}
                                {config.max && (
                                  <span style={{ fontWeight: 400, opacity: 0.6 }}> (max: {config.max})</span>
                                )}
                                {config.weight && (
                                  <span style={{ fontWeight: 400, opacity: 0.6 }}> — weight {config.weight}%</span>
                                )}
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max={config.max ?? 100}
                                value={criterionScores[criterion] ?? ''}
                                onChange={(e) =>
                                  setCriterionScores({
                                    ...criterionScores,
                                    [criterion]: Number(e.target.value),
                                  })
                                }
                                placeholder={`0–${config.max ?? 100}`}
                                style={{
                                  border: '2px solid var(--ink)',
                                  borderRadius: 0,
                                  background: 'var(--cream)',
                                  color: 'var(--ink)',
                                  fontFamily: 'JetBrains Mono, monospace',
                                }}
                              />
                            </div>
                          ))
                        )}

                        <div className="space-y-2">
                          <Label
                            style={{
                              fontFamily: 'Archivo, sans-serif',
                              fontWeight: 700,
                              color: 'var(--ink)',
                            }}
                          >
                            Feedback{' '}
                            <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                          </Label>
                          <Textarea
                            placeholder="Provide constructive feedback..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
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
                              setFeedback('')
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
