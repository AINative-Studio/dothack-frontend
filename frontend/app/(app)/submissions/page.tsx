"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useSubmissions } from '@/hooks/use-api'
import type { SubmissionStatus } from '@/lib/api/submissions-backend'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusFilter = 'ALL' | SubmissionStatus

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="border-b border-ink/10">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <div className="h-3 bg-cream-mid animate-pulse" style={{ width: `${55 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles: Record<SubmissionStatus, string> = {
    DRAFT:     'bg-cream-dark text-ink border border-ink',
    SUBMITTED: 'bg-accent text-white',
    SCORED:    'bg-ink text-cream',
  }
  return (
    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 ${styles[status]}`}>
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Filter chip
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border-2 transition-colors',
        active
          ? 'bg-ink text-cream border-ink'
          : 'bg-cream text-ink border-ink hover:bg-cream-dark',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'SCORED']

export default function SubmissionsPage() {
  useAuth()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const { data, isLoading, isError, error } = useSubmissions(
    statusFilter === 'ALL' ? { limit: 200 } : { status: statusFilter, limit: 200 }
  )

  const submissions = data?.submissions ?? []
  const total = data?.total ?? 0

  // Count by status from full loaded list (only accurate when filter is ALL)
  const countByStatus = (s: SubmissionStatus) =>
    (data?.submissions ?? []).filter((sub) => sub.status === s).length

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Submissions
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          All submissions across hackathons
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-7">
        <div className="border-2 border-ink px-5 py-3 bg-cream-dark min-w-[120px]">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Total</p>
          <p className="font-archivo font-black text-[24px] text-ink leading-none">
            {isLoading ? '—' : total}
          </p>
        </div>
        {(['DRAFT', 'SUBMITTED', 'SCORED'] as SubmissionStatus[]).map((s) => (
          <div key={s} className="border-2 border-ink px-5 py-3 bg-cream-dark min-w-[100px]">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">{s}</p>
            <p className="font-archivo font-black text-[24px] text-ink leading-none">
              {isLoading ? '—' : countByStatus(s)}
            </p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-7">
        {STATUS_FILTERS.map((s) => (
          <FilterChip
            key={s}
            label={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          />
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <div className="border-2 border-accent bg-[#fff3ef] px-5 py-4 mb-5" role="alert">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest">
            Failed to load submissions: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="border-2 border-ink overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink">
                {['Project Name', 'Team', 'Hackathon', 'Status', 'Track', 'Submitted'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left font-archivo font-black text-[11px] uppercase tracking-widest text-cream"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && submissions.length === 0 && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            No submissions found
          </span>
          <span className="font-mono text-[10px] text-muted">
            {statusFilter !== 'ALL'
              ? `No ${statusFilter} submissions yet`
              : 'Submissions will appear here when teams submit their projects'}
          </span>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && submissions.length > 0 && (
        <div className="border-2 border-ink overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink">
                {['Project Name', 'Team', 'Hackathon', 'Status', 'Track', 'Submitted'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left font-archivo font-black text-[11px] uppercase tracking-widest text-cream"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <tr
                  key={sub.submission_id}
                  className={[
                    'border-b border-ink/10 hover:bg-cream-mid transition-colors',
                    idx % 2 === 0 ? 'bg-cream' : 'bg-cream-dark',
                  ].join(' ')}
                >
                  <td className="px-5 py-3 font-medium text-[13px] text-ink">
                    {sub.project_name}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-ink">{sub.team_name}</td>
                  <td className="px-5 py-3 text-[12px] text-muted">{sub.hackathon_name}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-muted uppercase">
                    {sub.track || '—'}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-muted">
                    {sub.submitted_at
                      ? new Date(sub.submitted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
