"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useHackathons, useParticipants } from '@/hooks/use-api'
import type { Participant } from '@/lib/api/hackathons-backend'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RoleFilter = 'ALL' | Participant['role']

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="border-b border-ink/10">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <div className="h-3 bg-cream-mid animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: Participant['role'] }) {
  const styles: Record<Participant['role'], string> = {
    ORGANIZER: 'bg-ink text-cream',
    BUILDER:   'bg-accent text-white',
    JUDGE:     'bg-cream-dark text-ink border border-ink',
    MENTOR:    'bg-cream-mid text-ink border border-ink',
  }
  return (
    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 ${styles[role]}`}>
      {role}
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
// Participants rows for a single hackathon
// ---------------------------------------------------------------------------

function HackathonParticipantRows({
  hackathonId,
  hackathonName,
  roleFilter,
}: {
  hackathonId: string
  hackathonName: string
  roleFilter: RoleFilter
}) {
  const { data, isLoading } = useParticipants(
    hackathonId,
    roleFilter === 'ALL' ? undefined : roleFilter
  )

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonRow key={`${hackathonId}-skel-${i}`} />
        ))}
      </>
    )
  }

  const participants = data?.participants ?? []
  if (participants.length === 0) return null

  return (
    <>
      {participants.map((p) => (
        <tr
          key={`${hackathonId}-${p.participant_id}`}
          className="border-b border-ink/10 hover:bg-cream-mid transition-colors"
        >
          <td className="px-5 py-3 font-medium text-[13px] text-ink">{p.name}</td>
          <td className="px-5 py-3 font-mono text-[11px] text-muted">{p.handle}</td>
          <td className="px-5 py-3">
            <RoleBadge role={p.role} />
          </td>
          <td className="px-5 py-3 text-[12px] text-ink">{hackathonName}</td>
          <td className="px-5 py-3 font-mono text-[11px] text-muted">
            {p.joined_at
              ? new Date(p.joined_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </td>
        </tr>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const ROLE_FILTERS: RoleFilter[] = ['ALL', 'ORGANIZER', 'BUILDER', 'JUDGE', 'MENTOR']

export default function ParticipantsPage() {
  useAuth()
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')

  const { data: hackathonsData, isLoading: hackathonsLoading } = useHackathons({ limit: 200 })
  const hackathons = hackathonsData?.hackathons ?? []

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Participants
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          All participants across hackathons
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-7">
        {ROLE_FILTERS.map((role) => (
          <FilterChip
            key={role}
            label={role}
            active={roleFilter === role}
            onClick={() => setRoleFilter(role)}
          />
        ))}
      </div>

      {/* Loading state (initial hackathons load) */}
      {hackathonsLoading && (
        <div className="border-2 border-ink overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink">
                {['Name', 'Handle', 'Role', 'Hackathon', 'Joined'].map((col) => (
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

      {/* Empty hackathons state */}
      {!hackathonsLoading && hackathons.length === 0 && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            No hackathons found
          </span>
          <span className="font-mono text-[10px] text-muted">
            Create a hackathon to start managing participants
          </span>
        </div>
      )}

      {/* Participants table */}
      {!hackathonsLoading && hackathons.length > 0 && (
        <div className="border-2 border-ink overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink">
                {['Name', 'Handle', 'Role', 'Hackathon', 'Joined'].map((col) => (
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
              {hackathons.map((h) => (
                <HackathonParticipantRows
                  key={h.hackathon_id}
                  hackathonId={h.hackathon_id}
                  hackathonName={h.name}
                  roleFilter={roleFilter}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
