"use client"

export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/auth/auth-context'
import { useJudgeAssignments } from '@/hooks/use-api'
import type { JudgeAssignment } from '@/lib/api/judging'

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="border-2 border-ink p-5 flex flex-col gap-3">
      <div className="h-4 bg-cream-mid animate-pulse w-3/4" />
      <div className="h-3 bg-cream-mid animate-pulse w-1/2" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-cream-mid animate-pulse" />
        <div className="h-5 w-20 bg-cream-mid animate-pulse" />
      </div>
      <div className="h-8 bg-cream-mid animate-pulse w-24 mt-1" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Assignment card
// ---------------------------------------------------------------------------

function AssignmentCard({ assignment }: { assignment: JudgeAssignment }) {
  const isPending = assignment.status === 'PENDING'
  return (
    <div
      className={[
        'border-2 p-5 flex flex-col gap-3',
        isPending ? 'border-ink' : 'border-ink/40',
      ].join(' ')}
    >
      {/* Project name */}
      <div>
        <p className="font-archivo font-bold text-[14px] text-ink leading-snug">
          {assignment.project_name}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">
          {assignment.team_name}
        </p>
      </div>

      {/* Track + status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {assignment.track && (
          <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-cream-dark text-ink border border-ink">
            {assignment.track}
          </span>
        )}
        <span
          className={[
            'font-mono text-[9px] uppercase tracking-widest px-2 py-0.5',
            isPending ? 'bg-accent text-white' : 'bg-ink text-cream',
          ].join(' ')}
        >
          {assignment.status}
        </span>
      </div>

      {/* Score action */}
      {isPending && (
        <button
          className="self-start bg-ink text-cream font-archivo font-bold text-[11px] uppercase tracking-wide px-4 py-2 hover:bg-accent transition-colors mt-1"
          aria-label={`Score ${assignment.project_name}`}
        >
          Score →
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function JudgingPage() {
  useAuth()

  const { data, isLoading, isError, error } = useJudgeAssignments()
  const assignments = data?.assignments ?? []

  const totalAssignments = assignments.length
  const pendingCount = assignments.filter((a) => a.status === 'PENDING').length
  const scoredCount = assignments.filter((a) => a.status === 'SCORED').length
  const pendingAssignments = assignments.filter((a) => a.status === 'PENDING')
  const scoredAssignments = assignments.filter((a) => a.status === 'SCORED')

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Judging
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          Judge assignments and scoring queue
        </p>
      </div>

      {/* Stats bar */}
      <div className="border-2 border-ink mb-8">
        <div className="grid grid-cols-3">
          {[
            { label: 'Total Assignments', value: isLoading ? '—' : totalAssignments, dark: false },
            { label: 'Pending', value: isLoading ? '—' : pendingCount, dark: false },
            { label: 'Scored', value: isLoading ? '—' : scoredCount, dark: true },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={[
                'px-6 py-5',
                i < 2 ? 'border-r-2 border-ink' : '',
                stat.dark ? 'bg-ink' : '',
              ].join(' ')}
            >
              <div
                className={[
                  'font-archivo font-black text-[36px] leading-none mb-1.5',
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
      </div>

      {/* Error state */}
      {isError && (
        <div className="border-2 border-accent bg-[#fff3ef] px-5 py-4 mb-5" role="alert">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest">
            Failed to load assignments: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <>
          <div className="mb-4">
            <h2 className="font-archivo font-black text-[14px] uppercase tracking-tight text-ink mb-4">
              Pending Review
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!isLoading && !isError && assignments.length === 0 && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            No assignments found
          </span>
          <span className="font-mono text-[10px] text-muted">
            Judging assignments will appear here when configured
          </span>
        </div>
      )}

      {/* Pending section */}
      {!isLoading && !isError && pendingAssignments.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-archivo font-black text-[14px] uppercase tracking-tight text-ink">
              Pending Review
            </h2>
            <span className="bg-accent text-white font-mono text-[9px] px-1.5 py-0.5 leading-none">
              {pendingCount}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingAssignments.map((a) => (
              <AssignmentCard key={a.submission_id} assignment={a} />
            ))}
          </div>
        </div>
      )}

      {/* Scored section */}
      {!isLoading && !isError && scoredAssignments.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-archivo font-black text-[14px] uppercase tracking-tight text-ink">
              Scored
            </h2>
            <span className="bg-ink text-cream font-mono text-[9px] px-1.5 py-0.5 leading-none">
              {scoredCount}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoredAssignments.map((a) => (
              <AssignmentCard key={a.submission_id} assignment={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
