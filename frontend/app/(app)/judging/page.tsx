"use client"

export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/auth/auth-context'
import { useHackathons } from '@/hooks/use-api'
import Link from 'next/link'

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

  const { data: hackathonsData, isLoading } = useHackathons({ limit: 200 })
  const hackathons = hackathonsData?.hackathons ?? []

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Judging
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          Select a hackathon to view judging assignments and scores
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && hackathons.length === 0 && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            No hackathons found
          </span>
          <span className="font-mono text-[10px] text-muted">
            Create a hackathon to start configuring judging
          </span>
        </div>
      )}

      {/* Hackathon cards with judging links */}
      {!isLoading && hackathons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hackathons.map((h) => (
            <Link
              key={h.hackathon_id}
              href={`/hackathons/${h.hackathon_id}/judging`}
              className="border-2 border-ink p-5 flex flex-col gap-3 hover:bg-cream-dark transition-colors"
            >
              <p className="font-archivo font-bold text-[14px] text-ink leading-snug">
                {h.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-cream-dark text-ink border border-ink">
                  {h.status || 'ACTIVE'}
                </span>
              </div>
              <span className="self-start bg-ink text-cream font-archivo font-bold text-[11px] uppercase tracking-wide px-4 py-2 mt-1">
                View Judging →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
