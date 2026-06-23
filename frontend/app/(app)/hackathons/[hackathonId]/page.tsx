"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useHackathon, useHackathonOverview, useParticipants, usePrizes } from '@/hooks/use-api'

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase()
  if (upper === 'ACTIVE' || upper === 'LIVE') {
    return (
      <span className="bg-accent text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1">
        LIVE
      </span>
    )
  }
  if (upper === 'DRAFT') {
    return (
      <span className="bg-cream-mid text-ink font-mono text-[10px] uppercase tracking-widest px-3 py-1 border-2 border-ink">
        DRAFT
      </span>
    )
  }
  if (upper === 'JUDGING') {
    return (
      <span className="bg-warning-bg text-warning font-mono text-[10px] uppercase tracking-widest px-3 py-1 border border-warning">
        JUDGING
      </span>
    )
  }
  return (
    <span className="bg-ink text-cream font-mono text-[10px] uppercase tracking-widest px-3 py-1">
      {upper}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'setup', label: 'Setup' },
  { id: 'participants', label: 'Participants' },
  { id: 'teams', label: 'Teams' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'judging', label: 'Judging' },
  { id: 'prizes', label: 'Prizes' },
]

// ---------------------------------------------------------------------------
// Overview tab content
// ---------------------------------------------------------------------------

function OverviewTab({
  hackathonId,
  stats,
}: {
  hackathonId: string
  stats?: {
    participant_count: number
    team_count: number
    submission_count: number
    builder_count: number
    judge_count: number
    track_distribution: Record<string, number>
  }
}) {
  const { data: participantsData } = useParticipants(hackathonId)
  const { data: prizesData } = usePrizes(hackathonId)

  const participants = participantsData?.participants ?? []
  const prizes = prizesData?.prizes ?? []

  const trackDist = stats?.track_distribution ?? {}
  const maxTrack = Math.max(...Object.values(trackDist), 1)

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="border-2 border-ink">
        <div className="grid grid-cols-5">
          {[
            { label: 'Participants', value: stats?.participant_count ?? participants.length },
            { label: 'Teams', value: stats?.team_count ?? 0 },
            { label: 'Builders', value: stats?.builder_count ?? 0 },
            { label: 'Judges', value: stats?.judge_count ?? 0 },
            { label: 'Submissions', value: stats?.submission_count ?? 0 },
          ].map((s, i) => (
            <div
              key={s.label}
              className={['px-5 py-5', i < 4 ? 'border-r-2 border-ink' : ''].join(' ')}
            >
              <div className="font-archivo font-black text-[32px] leading-none text-ink mb-1">
                {s.value}
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Track distribution */}
      {Object.keys(trackDist).length > 0 && (
        <div className="border-2 border-ink">
          <div className="bg-ink px-5 py-3">
            <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
              Submissions by Track
            </span>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(trackDist).map(([track, count]) => {
              const pct = (count / maxTrack) * 100
              return (
                <div key={track}>
                  <div className="mb-2 border border-ink bg-cream-mid h-20 flex flex-col justify-end overflow-hidden relative">
                    <div
                      className="bg-accent w-full transition-all"
                      style={{ height: `${pct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-archivo font-black text-[20px] text-ink z-10">
                        {count}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted truncate">
                    {track}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 border-2 border-ink">
        {[
          { href: 'setup', label: 'Setup', desc: 'Configure tracks, rubrics, status' },
          { href: 'participants', label: 'Participants', desc: 'Manage participants and roles' },
          { href: 'teams', label: 'Teams', desc: 'Create and manage teams' },
          { href: 'submissions', label: 'Submissions', desc: 'View and search submissions' },
          { href: 'judging', label: 'Judging', desc: 'Score and evaluate projects' },
          { href: 'prizes', label: 'Prizes', desc: `${prizes.length} prizes configured` },
        ].map((card, idx) => (
          <Link
            key={card.href}
            href={card.href}
            className={[
              'px-5 py-5 hover:bg-cream-mid transition-colors block border-ink',
              idx % 3 !== 2 ? 'border-r-2' : '',
              idx < 3 ? 'border-b-2' : '',
            ].join(' ')}
          >
            <p className="font-archivo font-black text-[14px] uppercase text-ink mb-1">
              {card.label}
            </p>
            <p className="font-mono text-[9.5px] text-muted">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Placeholder tab
// ---------------------------------------------------------------------------

function PlaceholderTab({ label, href }: { label: string; href: string }) {
  return (
    <div className="border-2 border-ink px-6 py-12 text-center">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-4">
        {label} section
      </p>
      <Link
        href={href}
        className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
      >
        Open full {label} page →
      </Link>
    </div>
  )
}

export default function HackathonDetailPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { hackathonId } = params
  const [activeTab, setActiveTab] = useState('overview')

  const { data: hackathon, isLoading } = useHackathon(hackathonId)
  const { data: overviewData } = useHackathonOverview(hackathonId)

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="border-2 border-ink h-24 bg-cream-mid animate-pulse mb-6" />
        <div className="border-2 border-ink h-12 bg-cream-mid animate-pulse" />
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="p-8">
        <div className="border-2 border-ink px-6 py-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            Hackathon not found
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-start gap-4 mb-3">
          <h1 className="font-archivo font-black text-[32px] uppercase leading-none tracking-tight text-ink flex-1">
            {hackathon.name}
          </h1>
          <StatusBadge status={hackathon.status} />
        </div>
        {hackathon.description && (
          <p className="text-[13px] text-muted mb-3 max-w-2xl">{hackathon.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-5">
          <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
            Start: {new Date(hackathon.start_date).toLocaleString()}
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
            End: {new Date(hackathon.end_date).toLocaleString()}
          </span>
          {hackathon.is_online && (
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-accent">
              Online Event
            </span>
          )}
          {hackathon.location && !hackathon.is_online && (
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
              {hackathon.location}
            </span>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-2 border-ink mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-5 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors shrink-0 border-r border-ink last:border-r-0',
              activeTab === tab.id
                ? 'bg-ink text-cream'
                : 'text-muted hover:bg-cream-mid hover:text-ink',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab hackathonId={hackathonId} stats={overviewData?.stats} />
      )}
      {activeTab === 'setup' && (
        <PlaceholderTab label="Setup" href={`/hackathons/${hackathonId}/setup`} />
      )}
      {activeTab === 'participants' && (
        <PlaceholderTab label="Participants" href={`/hackathons/${hackathonId}/participants`} />
      )}
      {activeTab === 'teams' && (
        <PlaceholderTab label="Teams" href={`/hackathons/${hackathonId}/teams`} />
      )}
      {activeTab === 'submissions' && (
        <PlaceholderTab label="Submissions" href={`/hackathons/${hackathonId}/submissions`} />
      )}
      {activeTab === 'judging' && (
        <PlaceholderTab label="Judging" href={`/hackathons/${hackathonId}/judging`} />
      )}
      {activeTab === 'prizes' && (
        <PlaceholderTab label="Prizes" href={`/hackathons/${hackathonId}/prizes`} />
      )}
    </div>
  )
}
