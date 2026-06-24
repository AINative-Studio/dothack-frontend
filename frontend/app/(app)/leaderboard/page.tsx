"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useHackathons, useLeaderboard } from '@/hooks/use-api'

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="border-b border-ink/10">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <div className="h-3 bg-cream-mid animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Rank badge
// ---------------------------------------------------------------------------

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="font-archivo font-black text-[16px] text-accent leading-none">#1</span>
  }
  if (rank <= 3) {
    return <span className="font-archivo font-black text-[14px] text-ink leading-none">#{rank}</span>
  }
  return <span className="font-mono text-[12px] text-muted leading-none">#{rank}</span>
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function LeaderboardPage() {
  useAuth()
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('')

  const { data: hackathonsData, isLoading: hackathonsLoading } = useHackathons({ limit: 200 })
  const hackathons = hackathonsData?.hackathons ?? []

  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    isError,
    error,
  } = useLeaderboard(selectedHackathonId)

  const entries = leaderboardData?.entries ?? []
  const hackathonName = leaderboardData?.hackathon_name ?? ''
  const lastUpdated = leaderboardData?.last_updated ?? ''

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Leaderboard
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          Ranked scores across hackathon submissions
        </p>
      </div>

      {/* Hackathon selector */}
      <div className="mb-7 flex items-center gap-4">
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted shrink-0">
          Hackathon
        </label>
        <select
          value={selectedHackathonId}
          onChange={(e) => setSelectedHackathonId(e.target.value)}
          disabled={hackathonsLoading}
          className="bg-cream border-2 border-ink px-4 py-2 font-mono text-[12px] text-ink outline-none focus:border-accent transition-colors appearance-none min-w-[260px] disabled:opacity-50"
        >
          <option value="">— Select a hackathon —</option>
          {hackathons.map((h) => (
            <option key={h.hackathon_id} value={h.hackathon_id}>
              {h.name}
            </option>
          ))}
        </select>
        {hackathonsLoading && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted animate-pulse">
            Loading...
          </span>
        )}
      </div>

      {/* Last updated */}
      {lastUpdated && selectedHackathonId && (
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-5">
          Last updated:{' '}
          {new Date(lastUpdated).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}

      {/* No hackathon selected */}
      {!selectedHackathonId && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            Select a hackathon to view rankings
          </span>
        </div>
      )}

      {/* Error state */}
      {selectedHackathonId && isError && (
        <div className="border-2 border-accent bg-[#fff3ef] px-5 py-4 mb-5" role="alert">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest">
            Failed to load leaderboard: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {selectedHackathonId && leaderboardLoading && (
        <div className="border-2 border-ink overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink">
                {['Rank', 'Team', 'Project', 'Avg Score', 'Total Score'].map((col) => (
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
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty entries */}
      {selectedHackathonId && !leaderboardLoading && !isError && entries.length === 0 && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            No scores yet for {hackathonName || 'this hackathon'}
          </span>
          <span className="font-mono text-[10px] text-muted">
            Scores will appear here once judging begins
          </span>
        </div>
      )}

      {/* Leaderboard table */}
      {selectedHackathonId && !leaderboardLoading && !isError && entries.length > 0 && (
        <>
          {hackathonName && (
            <p className="font-archivo font-black text-[16px] uppercase text-ink mb-4">
              {hackathonName}
            </p>
          )}
          <div className="border-2 border-ink overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ink">
                  {['Rank', 'Team', 'Project', 'Avg Score', 'Total Score'].map((col) => (
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
                {entries.map((entry, idx) => (
                  <tr
                    key={entry.submission_id}
                    className={[
                      'border-b border-ink/10 hover:bg-cream-mid transition-colors',
                      idx === 0 ? 'bg-[#fff3ef]' : idx % 2 === 0 ? 'bg-cream' : 'bg-cream-dark',
                    ].join(' ')}
                  >
                    <td className="px-5 py-3.5">
                      <RankBadge rank={entry.rank} />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[13px] text-ink">
                      {entry.team_name}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-muted">{entry.project_title}</td>
                    <td className="px-5 py-3.5 font-mono text-[12px] text-ink">
                      {entry.average_score.toFixed(1)}
                    </td>
                    <td className="px-5 py-3.5 font-archivo font-bold text-[14px] text-ink">
                      {entry.total_score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
