"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganizerDashboard, useHackathons, useCreateHackathon } from '@/hooks/use-api'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase()
  if (upper === 'ACTIVE' || upper === 'LIVE') {
    return (
      <span className="bg-accent text-white font-mono text-[9px] uppercase tracking-widest px-2 py-0.5">
        LIVE
      </span>
    )
  }
  if (upper === 'DRAFT') {
    return (
      <span className="bg-cream-mid text-ink font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border border-ink">
        DRAFT
      </span>
    )
  }
  return (
    <span className="bg-ink text-cream font-mono text-[9px] uppercase tracking-widest px-2 py-0.5">
      {upper}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Activity dot color by type
// ---------------------------------------------------------------------------

function activityDotColor(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('submission') || t.includes('submit')) return 'bg-accent'
  if (t.includes('join') || t.includes('participant')) return 'bg-success'
  if (t.includes('team')) return '#7c6fcd'
  if (t.includes('judge') || t.includes('score')) return 'bg-warning'
  return 'bg-muted'
}

function formatRelativeTime(ts: string): string {
  try {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <div className="flex gap-3 px-4 py-3 border-b border-border-light last:border-0">
      <div className="w-24 h-3 bg-cream-mid animate-pulse" />
      <div className="flex-1 h-3 bg-cream-mid animate-pulse" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create hackathon modal
// ---------------------------------------------------------------------------

function CreateHackathonModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const createHackathon = useCreateHackathon()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    is_online: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createHackathon.mutateAsync({
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location || '',
        is_online: formData.is_online,
        status: 'draft',
        organizer_id: (user as any)?.user_id ?? (user as any)?.id ?? '',
        max_participants: null,
      })
      toast.success('Hackathon created')
      onClose()
      router.push(`/hackathons/${result.hackathon_id}`)
    } catch (err) {
      toast.error('Failed to create hackathon', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50">
      <div className="bg-cream border-2 border-ink w-full max-w-lg shadow-modal">
        <div className="bg-ink px-6 py-4 flex items-center justify-between">
          <span className="font-archivo font-black text-[15px] uppercase text-cream tracking-tight">
            Create Hackathon
          </span>
          <button
            onClick={onClose}
            className="text-cream hover:text-muted-light font-mono text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full border-2 border-ink bg-input-bg px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
              placeholder="Spring Hackathon 2025"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full border-2 border-ink bg-input-bg px-3 py-2 text-[13px] text-ink outline-none focus:border-accent resize-none"
              placeholder="Describe your hackathon..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full border-2 border-ink bg-input-bg px-3 py-2 text-[12px] text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
                End Date
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="w-full border-2 border-ink bg-input-bg px-3 py-2 text-[12px] text-ink outline-none focus:border-accent"
              />
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border-2 border-ink bg-input-bg px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
              placeholder="San Francisco, CA (or leave blank)"
            />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_online}
              onChange={(e) => setFormData({ ...formData, is_online: e.target.checked })}
              className="w-4 h-4 accent-accent"
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Online Event
            </span>
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createHackathon.isPending}
              className="bg-accent text-white font-archivo font-bold text-[12px] uppercase tracking-wide px-5 py-2.5 hover:bg-danger transition-colors disabled:opacity-60"
            >
              {createHackathon.isPending ? 'Creating...' : 'Create'}
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

export function OrganizerDashboard() {
  const router = useRouter()
  const { data: dashData, isLoading: dashLoading } = useOrganizerDashboard()
  const { data: hackathonsResp, isLoading: hackLoading } = useHackathons()
  const [showCreate, setShowCreate] = useState(false)

  const isLoading = dashLoading || hackLoading

  const hackathons = hackathonsResp?.hackathons ?? []
  const totalHackathons = hackathonsResp?.total ?? hackathons.length

  // Derive stats: prefer the dashboard endpoint, fall back to list counts
  const totalParticipants = dashData?.total_participants ?? 0
  const totalTeams = dashData?.total_teams ?? 0
  const totalSubmissions = dashData?.total_submissions ?? 0
  const pendingJudge = dashData?.pending_judgments ?? 0

  // Track distribution chart — aggregate from hackathon overviews if available
  const myHackathons = dashData?.my_hackathons ?? []

  // Build a combined track distribution from summary data
  const trackDist: Record<string, number> = {}
  // Since individual overviews aren't loaded here, show per-hackathon submission counts as bars
  myHackathons.forEach((h) => {
    trackDist[h.name] = h.submission_count
  })

  const maxTrackCount = Math.max(...Object.values(trackDist), 1)

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Organizer<br />Dashboard
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-accent text-white font-archivo font-bold text-[12px] uppercase tracking-wide px-5 py-3 hover:bg-danger transition-colors mt-1"
        >
          + New Hackathon
        </button>
      </div>

      {/* Stats grid — 5 column, border-divided */}
      <div className="border-2 border-ink mb-8">
        <div className="grid grid-cols-5">
          {[
            {
              label: 'Hackathons',
              value: isLoading ? '—' : totalHackathons,
              dark: false,
            },
            {
              label: 'Participants',
              value: isLoading ? '—' : totalParticipants,
              dark: false,
            },
            {
              label: 'Teams',
              value: isLoading ? '—' : totalTeams,
              dark: false,
            },
            {
              label: 'Submissions',
              value: isLoading ? '—' : totalSubmissions,
              dark: false,
            },
            {
              label: 'Pending Judge',
              value: isLoading ? '—' : pendingJudge,
              dark: true,
              link: true,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={[
                'px-6 py-6',
                i < 4 ? 'border-r-2 border-ink' : '',
                stat.dark ? 'bg-ink' : '',
              ].join(' ')}
            >
              <div
                className={[
                  'font-archivo font-black leading-none mb-2',
                  stat.dark ? 'text-accent text-[40px]' : 'text-ink text-[40px]',
                ].join(' ')}
              >
                {stat.value}
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-widest text-muted mb-1">
                {stat.label}
              </div>
              {stat.link && (
                <button className="font-mono text-[9.5px] uppercase tracking-widest text-accent hover:underline">
                  review queue →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid mb-8" style={{ gridTemplateColumns: '1.55fr 1fr', gap: 0 }}>
        {/* Left: My Hackathons table */}
        <div className="border-2 border-ink border-r-0">
          {/* Table header */}
          <div className="bg-ink px-5 py-3 flex items-center justify-between">
            <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
              My Hackathons
            </span>
            <span className="font-mono text-[9px] uppercase text-muted-light tracking-widest">
              {hackathons.length} total
            </span>
          </div>

          {isLoading ? (
            <div>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : hackathons.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-mono text-[11px] uppercase text-muted tracking-widest">
                No hackathons yet
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
              >
                + Create your first
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light bg-cream-dark">
                    <th className="text-left px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-widest text-muted">
                      Hackathon
                    </th>
                    <th className="text-left px-4 py-2.5 font-mono text-[9.5px] uppercase tracking-widest text-muted">
                      Status
                    </th>
                    <th className="text-right px-4 py-2.5 font-mono text-[9.5px] uppercase tracking-widest text-muted">
                      Bldrs
                    </th>
                    <th className="text-right px-4 py-2.5 font-mono text-[9.5px] uppercase tracking-widest text-muted">
                      Teams
                    </th>
                    <th className="text-right px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-widest text-muted">
                      Subs
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hackathons.map((h, idx) => {
                    const summary = myHackathons.find(
                      (m) => m.hackathon_id === h.hackathon_id
                    )
                    return (
                      <tr
                        key={h.hackathon_id}
                        onClick={() => router.push(`/hackathons/${h.hackathon_id}`)}
                        className={[
                          'cursor-pointer hover:bg-cream-mid transition-colors',
                          idx < hackathons.length - 1 ? 'border-b border-border-light' : '',
                        ].join(' ')}
                      >
                        <td className="px-5 py-3">
                          <span className="font-medium text-[13px] text-ink">
                            {h.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={h.status} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-ink">
                          {h.participant_count ?? summary?.participant_count ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-ink">
                          {summary?.team_count ?? 0}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[12px] text-ink">
                          {summary?.submission_count ?? 0}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Activity feed */}
        <div className="border-2 border-ink">
          {/* Feed header */}
          <div className="bg-ink px-5 py-3 flex items-center gap-2.5">
            <span
              className="w-2 h-2 bg-accent rounded-full animate-dh-pulse shrink-0"
              aria-hidden="true"
            />
            <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
              Activity
            </span>
          </div>

          {isLoading ? (
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-5 py-3.5 border-b border-border-light last:border-0"
                >
                  <div className="w-2 h-2 bg-cream-mid animate-pulse mt-1 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-cream-mid animate-pulse w-3/4" />
                    <div className="h-2 bg-cream-mid animate-pulse w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : myHackathons.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-mono text-[11px] uppercase text-muted tracking-widest">
                No recent activity
              </p>
            </div>
          ) : (
            <div>
              {/* We generate synthetic feed items from hackathon summaries */}
              {myHackathons
                .flatMap((h) => [
                  {
                    type: 'submission',
                    text: `${h.submission_count} submission${h.submission_count !== 1 ? 's' : ''} in ${h.name}`,
                    ts: h.end_date,
                  },
                  {
                    type: 'participant',
                    text: `${h.participant_count} participant${h.participant_count !== 1 ? 's' : ''} joined ${h.name}`,
                    ts: h.start_date,
                  },
                ])
                .slice(0, 8)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 px-5 py-3.5 border-b border-border-light last:border-0"
                  >
                    <span
                      className={[
                        'w-2 h-2 rounded-full mt-1.5 shrink-0',
                        activityDotColor(item.type),
                      ].join(' ')}
                    />
                    <div className="min-w-0">
                      <p className="text-[12px] text-ink leading-snug">{item.text}</p>
                      <p className="font-mono text-[9px] text-muted mt-0.5">
                        {formatRelativeTime(item.ts)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Submissions by Track (using hackathon submission counts as proxy) */}
      {!isLoading && myHackathons.length > 0 && (
        <div className="border-2 border-ink">
          <div className="bg-ink px-5 py-3">
            <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
              Submissions by Hackathon
            </span>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {myHackathons.map((h) => {
              const pct = maxTrackCount > 0 ? (h.submission_count / maxTrackCount) * 100 : 0
              return (
                <div key={h.hackathon_id}>
                  <div className="mb-2 border-1.5 border-ink bg-cream-mid h-24 flex flex-col justify-end overflow-hidden relative">
                    <div
                      className="bg-accent w-full transition-all"
                      style={{ height: `${pct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-archivo font-black text-[22px] text-ink leading-none z-10">
                        {h.submission_count}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted truncate">
                    {h.name}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && <CreateHackathonModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
