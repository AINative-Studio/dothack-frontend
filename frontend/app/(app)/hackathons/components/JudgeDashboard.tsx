"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJudgeAssignments, useSubmitScore, useHackathons } from '@/hooks/use-api'
import type { JudgeAssignment } from '@/lib/api/judging'

// ---------------------------------------------------------------------------
// Assignment card
// ---------------------------------------------------------------------------

function AssignmentCard({
  assignment,
  onScore,
}: {
  assignment: JudgeAssignment
  onScore: (a: JudgeAssignment) => void
}) {
  const isPending = assignment.status === 'PENDING'
  return (
    <div
      className={[
        'border-2 p-5 flex flex-col gap-3',
        isPending ? 'border-accent' : 'border-ink',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-archivo font-black text-[14px] uppercase text-ink leading-tight mb-1">
            {assignment.project_name}
          </p>
          <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
            {assignment.team_name} · {assignment.track}
          </p>
        </div>
        <span
          className={[
            'font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 shrink-0',
            isPending
              ? 'bg-accent text-white'
              : 'bg-ink text-cream',
          ].join(' ')}
        >
          {assignment.status}
        </span>
      </div>

      {/* Score button or done indicator */}
      {isPending ? (
        <button
          onClick={() => onScore(assignment)}
          className="self-start bg-accent text-white font-archivo font-bold text-[11px] uppercase tracking-wide px-4 py-2 hover:bg-danger transition-colors"
        >
          Score Submission →
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-ink text-cream flex items-center justify-center text-[8px]">
            ✓
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Scored
          </span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scoring panel (placeholder interface)
// ---------------------------------------------------------------------------

function ScoringPanel({
  assignment,
  onClose,
}: {
  assignment: JudgeAssignment
  onClose: () => void
}) {
  const submitScore = useSubmitScore()
  const [scores, setScores] = useState<Record<string, number>>({
    innovation: 5,
    execution: 5,
    impact: 5,
    presentation: 5,
  })
  const [comment, setComment] = useState('')

  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const max = Object.keys(scores).length * 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitScore.mutateAsync({
      submission_id: assignment.submission_id,
      hackathon_id: assignment.hackathon_id,
      rubric_id: 'default',
      judge_id: 'me',
      criteria: scores,
      score: total,
      comment,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50">
      <div className="bg-cream border-2 border-ink w-full max-w-lg shadow-modal">
        <div className="bg-ink px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-archivo font-black text-[15px] uppercase text-cream tracking-tight">
              Score Submission
            </span>
            <p className="font-mono text-[9px] uppercase text-muted-light tracking-widest mt-0.5">
              {assignment.project_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cream hover:text-muted-light font-mono text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {Object.entries(scores).map(([criterion, value]) => (
            <div key={criterion}>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  {criterion}
                </label>
                <span className="font-archivo font-black text-[18px] text-ink">
                  {value}
                  <span className="font-mono font-normal text-[11px] text-muted">/10</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={value}
                onChange={(e) =>
                  setScores({ ...scores, [criterion]: Number(e.target.value) })
                }
                className="w-full accent-accent"
              />
            </div>
          ))}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border-2 border-ink bg-input-bg px-3 py-2 text-[13px] text-ink outline-none focus:border-accent resize-none"
              placeholder="Feedback for the team..."
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t-2 border-ink pt-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Total Score
            </span>
            <span className="font-archivo font-black text-[28px] text-ink">
              {total}
              <span className="font-mono font-normal text-[13px] text-muted">/{max}</span>
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitScore.isPending}
              className="bg-accent text-white font-archivo font-bold text-[12px] uppercase tracking-wide px-5 py-2.5 hover:bg-danger transition-colors disabled:opacity-60"
            >
              {submitScore.isPending ? 'Submitting...' : 'Submit Score'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-ink text-ink font-archivo font-bold text-[12px] uppercase tracking-wide px-5 py-2.5 hover:bg-cream-dark transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

export function JudgeDashboard() {
  const router = useRouter()
  const { data: assignmentsData, isLoading: assignLoading } = useJudgeAssignments()
  const { data: hackathonsResp, isLoading: hackLoading } = useHackathons()
  const [scoringAssignment, setScoringAssignment] = useState<JudgeAssignment | null>(null)

  const isLoading = assignLoading || hackLoading

  const assignments = assignmentsData?.assignments ?? []
  const hackathons = hackathonsResp?.hackathons ?? []

  const pending = assignments.filter((a) => a.status === 'PENDING')
  const scored = assignments.filter((a) => a.status === 'SCORED')
  const progress = assignments.length > 0
    ? Math.round((scored.length / assignments.length) * 100)
    : 0

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Judge<br />Dashboard
        </h1>
      </div>

      {/* Stats grid */}
      <div className="border-2 border-ink mb-8">
        <div className="grid grid-cols-4">
          {[
            {
              label: 'Assignments',
              value: isLoading ? '—' : assignments.length,
              dark: false,
            },
            {
              label: 'Pending',
              value: isLoading ? '—' : pending.length,
              dark: pending.length > 0,
            },
            {
              label: 'Scored',
              value: isLoading ? '—' : scored.length,
              dark: false,
            },
            {
              label: 'Completion',
              value: isLoading ? '—' : `${progress}%`,
              dark: false,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={[
                'px-6 py-6',
                i < 3 ? 'border-r-2 border-ink' : '',
                stat.dark ? 'bg-ink' : '',
              ].join(' ')}
            >
              <div
                className={[
                  'font-archivo font-black text-[40px] leading-none mb-2',
                  stat.dark ? 'text-accent' : 'text-ink',
                ].join(' ')}
              >
                {stat.value}
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {!isLoading && assignments.length > 0 && (
          <div className="border-t-2 border-ink px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                Judging Progress
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                {scored.length}/{assignments.length}
              </span>
            </div>
            <div className="h-2 bg-cream-mid border border-ink w-full">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pending assignments */}
      {pending.length > 0 && (
        <div className="border-2 border-ink mb-8">
          <div className="bg-ink px-5 py-3 flex items-center gap-3">
            <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
              Pending Review
            </span>
            <span className="bg-accent text-white font-mono text-[9px] uppercase tracking-widest px-2 py-0.5">
              {pending.length}
            </span>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((assignment) => (
              <AssignmentCard
                key={assignment.submission_id}
                assignment={assignment}
                onScore={setScoringAssignment}
              />
            ))}
          </div>
        </div>
      )}

      {/* All assignments */}
      {!isLoading && assignments.length === 0 ? (
        <div className="border-2 border-ink px-5 py-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-2">
            No assignments yet
          </p>
          <p className="text-[13px] text-muted">
            You will be notified when judging assignments are ready
          </p>
        </div>
      ) : scored.length > 0 ? (
        <div className="border-2 border-ink mb-8">
          <div className="bg-cream-dark px-5 py-3">
            <span className="font-archivo font-black text-[13px] uppercase text-ink tracking-tight">
              Completed Reviews
            </span>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {scored.map((assignment) => (
              <AssignmentCard
                key={assignment.submission_id}
                assignment={assignment}
                onScore={setScoringAssignment}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Hackathons to judge */}
      {hackathons.length > 0 && (
        <div className="border-2 border-ink">
          <div className="bg-ink px-5 py-3">
            <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
              Hackathons to Judge
            </span>
          </div>
          <div>
            {hackathons.map((h, idx) => (
              <div
                key={h.hackathon_id}
                className={[
                  'px-6 py-5 flex items-center justify-between',
                  idx < hackathons.length - 1 ? 'border-b border-border-light' : '',
                ].join(' ')}
              >
                <div>
                  <p className="font-archivo font-black text-[14px] uppercase text-ink mb-1">
                    {h.name}
                  </p>
                  <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                    Ends {new Date(h.end_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/hackathons/${h.hackathon_id}/judging`)}
                  className="bg-accent text-white font-archivo font-bold text-[11px] uppercase tracking-wide px-4 py-2 hover:bg-danger transition-colors"
                >
                  Judge →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring panel */}
      {scoringAssignment && (
        <ScoringPanel
          assignment={scoringAssignment}
          onClose={() => setScoringAssignment(null)}
        />
      )}
    </div>
  )
}
