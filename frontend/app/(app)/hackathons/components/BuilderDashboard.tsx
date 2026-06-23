"use client"

import { useRouter } from 'next/navigation'
import { useAttendeeDashboard, useHackathons } from '@/hooks/use-api'

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

export function BuilderDashboard() {
  const router = useRouter()
  const { data: dashData, isLoading: dashLoading } = useAttendeeDashboard()
  const { data: hackathonsResp, isLoading: hackLoading } = useHackathons()

  const isLoading = dashLoading || hackLoading
  const hackathons = hackathonsResp?.hackathons ?? []

  const stats = dashData?.stats
  const activeTeam = dashData?.active_team
  const currentSubmission = dashData?.current_submission
  const nextDeadline = dashData?.next_deadline
  const registrations = dashData?.registrations ?? []

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Builder<br />Dashboard
        </h1>
      </div>

      {/* Stats grid */}
      <div className="border-2 border-ink mb-8">
        <div className="grid grid-cols-4">
          {[
            { label: 'Registered', value: isLoading ? '—' : (stats?.registered ?? 0) },
            { label: 'Submissions', value: isLoading ? '—' : (stats?.submissions ?? 0) },
            { label: 'Wins', value: isLoading ? '—' : (stats?.wins ?? 0) },
            { label: 'Credentials', value: isLoading ? '—' : (stats?.credentials ?? 0) },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={['px-6 py-6', i < 3 ? 'border-r-2 border-ink' : ''].join(' ')}
            >
              <div className="font-archivo font-black text-[40px] leading-none text-ink mb-2">
                {stat.value}
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next deadline banner */}
      {nextDeadline && (
        <div className="border-2 border-accent bg-[#fff3ef] px-6 py-4 mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-widest text-accent mb-0.5">
              Upcoming Deadline
            </p>
            <p className="font-archivo font-black text-[15px] text-ink uppercase">
              {nextDeadline.hackathon} — {nextDeadline.label}
            </p>
          </div>
          <div className="font-mono text-[11px] text-muted">
            {new Date(nextDeadline.at).toLocaleString()}
          </div>
        </div>
      )}

      {/* Two-column: registrations + team/submission */}
      <div className="grid mb-8" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 0 }}>
        {/* My Registrations */}
        <div className="border-2 border-ink border-r-0">
          <div className="bg-ink px-5 py-3">
            <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
              My Registrations
            </span>
          </div>

          {isLoading ? (
            <div className="px-5 py-10 text-center">
              <p className="font-mono text-[11px] uppercase text-muted tracking-widest">
                Loading...
              </p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-mono text-[11px] uppercase text-muted tracking-widest mb-3">
                No registrations yet
              </p>
              <p className="text-[12px] text-muted">
                Browse available hackathons below to get started
              </p>
            </div>
          ) : (
            <div>
              {registrations.map((reg, idx) => (
                <div
                  key={reg.hackathon_id}
                  className={[
                    'px-5 py-4 flex items-center justify-between',
                    idx < registrations.length - 1 ? 'border-b border-border-light' : '',
                  ].join(' ')}
                >
                  <div>
                    <p className="font-medium text-[13px] text-ink mb-1">{reg.name}</p>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                        {reg.role}
                      </span>
                      {reg.team && (
                        <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                          · {reg.team}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={reg.status} />
                    <button
                      onClick={() => router.push(`/hackathons/${reg.hackathon_id}`)}
                      className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active team + submission */}
        <div className="border-2 border-ink flex flex-col">
          {/* Active Team */}
          <div>
            <div className="bg-ink px-5 py-3">
              <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
                Active Team
              </span>
            </div>
            {isLoading ? (
              <div className="px-5 py-6">
                <div className="h-3 bg-cream-mid animate-pulse w-1/2 mb-2" />
                <div className="h-2 bg-cream-mid animate-pulse w-1/3" />
              </div>
            ) : activeTeam ? (
              <div className="px-5 py-5 border-b border-border-light">
                <p className="font-archivo font-black text-[16px] uppercase text-ink mb-1">
                  {activeTeam.name}
                </p>
                <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted mb-4">
                  {activeTeam.hackathon} · {activeTeam.role}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {activeTeam.members.map((m) => (
                    <div
                      key={m.handle}
                      className="flex items-center gap-2 border border-border-light px-2.5 py-1.5"
                    >
                      <div className="w-5 h-5 bg-ink text-cream flex items-center justify-center font-archivo font-black text-[8px] shrink-0">
                        {m.initials}
                      </div>
                      <span className="font-mono text-[10px] text-ink">{m.name}</span>
                    </div>
                  ))}
                  {activeTeam.open_slots > 0 && (
                    <div className="flex items-center gap-1.5 border border-dashed border-muted px-2.5 py-1.5">
                      <span className="font-mono text-[9.5px] uppercase text-muted tracking-widest">
                        +{activeTeam.open_slots} open
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-5 py-5 border-b border-border-light">
                <p className="font-mono text-[11px] uppercase text-muted tracking-widest">
                  No active team
                </p>
              </div>
            )}
          </div>

          {/* Current Submission */}
          <div className="flex-1">
            <div className="bg-cream-dark border-t-0 px-5 py-2.5 border-b border-border-light">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                Current Submission
              </span>
            </div>
            {isLoading ? (
              <div className="px-5 py-5">
                <div className="h-3 bg-cream-mid animate-pulse w-2/3 mb-2" />
                <div className="h-2 bg-cream-mid animate-pulse w-1/2" />
              </div>
            ) : currentSubmission ? (
              <div className="px-5 py-5">
                <p className="font-archivo font-black text-[14px] uppercase text-ink mb-1">
                  {currentSubmission.project_name}
                </p>
                <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted mb-4">
                  {currentSubmission.track} · {currentSubmission.hackathon}
                </p>
                <StatusBadge status={currentSubmission.status} />
                <div className="mt-4 space-y-1.5">
                  {currentSubmission.checklist.slice(0, 5).map(([label, done]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span
                        className={[
                          'w-3 h-3 border flex items-center justify-center text-[8px] shrink-0',
                          done ? 'bg-accent border-accent text-white' : 'border-ink',
                        ].join(' ')}
                      >
                        {done ? '✓' : ''}
                      </span>
                      <span
                        className={[
                          'font-mono text-[10px]',
                          done ? 'text-muted line-through' : 'text-ink',
                        ].join(' ')}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-5 py-5">
                <p className="font-mono text-[11px] uppercase text-muted tracking-widest">
                  No submission yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Hackathons */}
      <div className="border-2 border-ink">
        <div className="bg-ink px-5 py-3 flex items-center justify-between">
          <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
            Available Hackathons
          </span>
          <span className="font-mono text-[9px] uppercase text-muted-light tracking-widest">
            {hackathons.length} events
          </span>
        </div>

        {isLoading ? (
          <div className="px-5 py-10 text-center">
            <p className="font-mono text-[11px] uppercase text-muted tracking-widest">
              Loading...
            </p>
          </div>
        ) : hackathons.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-mono text-[11px] uppercase text-muted tracking-widest">
              No hackathons available — check back soon
            </p>
          </div>
        ) : (
          <div>
            {hackathons.map((h, idx) => (
              <div
                key={h.hackathon_id}
                className={[
                  'px-6 py-5 flex items-center justify-between',
                  idx < hackathons.length - 1 ? 'border-b border-border-light' : '',
                ].join(' ')}
              >
                <div className="min-w-0 flex-1 pr-6">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-archivo font-black text-[15px] uppercase text-ink">
                      {h.name}
                    </h3>
                    <StatusBadge status={h.status} />
                  </div>
                  <p className="text-[12px] text-muted mb-2 truncate">{h.description}</p>
                  <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted">
                    {new Date(h.start_date).toLocaleDateString()} –{' '}
                    {new Date(h.end_date).toLocaleDateString()}
                    {h.is_online && ' · Online'}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/hackathons/${h.hackathon_id}`)}
                  className="bg-ink text-cream font-archivo font-bold text-[11px] uppercase tracking-wide px-4 py-2 hover:bg-accent transition-colors shrink-0"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
