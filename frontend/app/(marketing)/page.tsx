import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Hero console preview data ───────────────────────────────────────────────
const consoleTracks = [
  { name: 'AI / ML', count: 87, active: true },
  { name: 'Web3', count: 63, active: true },
  { name: 'DevTools', count: 51, active: true },
  { name: 'Sustainability', count: 38, active: false },
]

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { value: '2,400+', label: 'Builders' },
  { value: '180+', label: 'Hackathons' },
  { value: '12K+', label: 'Submissions' },
  { value: '<200ms', label: 'Search' },
]

// ─── Pipeline features ────────────────────────────────────────────────────────
const pipeline = [
  {
    phase: '01',
    title: 'Setup & Config',
    desc: 'Define tracks, rubrics, prizes, and team rules. Invite judges and mentors. Flip the switch to go live.',
    bullets: ['Custom tracks & themes', 'Judging rubrics', 'Prize pools', 'Invite management'],
  },
  {
    phase: '02',
    title: 'Build & Submit',
    desc: 'Builders form teams, create projects, and submit work through a guided portal — all before the deadline.',
    bullets: ['Team formation', 'Project dashboard', 'Submission portal', 'Deadline enforcement'],
  },
  {
    phase: '03',
    title: 'Judge & Rank',
    desc: 'Judges score against your rubric. Live leaderboard updates in real time. Export results instantly.',
    bullets: ['Criteria-based scoring', 'Judge assignments', 'Live leaderboard', 'CSV export'],
  },
]

// ─── Role cards ───────────────────────────────────────────────────────────────
const roles = [
  {
    badge: 'Organizer',
    title: 'Full command over every detail.',
    desc: 'Spin up a hackathon, configure every setting, and track the full event from one admin console.',
    capabilities: [
      'Hackathon creation & config',
      'Participant & invite management',
      'Real-time analytics dashboard',
      'Export and reporting tools',
    ],
  },
  {
    badge: 'Builder',
    title: 'Focus on shipping, not logistics.',
    desc: 'Register, form a team, track your project, and submit before the deadline — with zero friction.',
    capabilities: [
      'Team formation & joining',
      'Project creation & updates',
      'One-click submission',
      'Live event feed',
    ],
  },
  {
    badge: 'Judge',
    title: 'Score with clarity and confidence.',
    desc: 'Review submissions through a structured interface, score against defined rubrics, and leave feedback.',
    capabilities: [
      'Structured rubric scoring',
      'Submission review panel',
      'Qualitative feedback forms',
      'Conflict-of-interest flags',
    ],
  },
]

export default function HomePage() {
  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-cream border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left: 60% */}
            <div className="lg:col-span-3">
              {/* Badge */}
              <div className="inline-flex items-center border-[1.5px] border-ink px-3 py-1 mb-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink">
                  AI-Native Hackathon Ops
                </span>
              </div>

              {/* Heading */}
              <h1 className="font-archivo font-black text-5xl md:text-6xl uppercase leading-[1] tracking-[-0.03em] text-ink mb-6">
                Run the entire hackathon from one console.
              </h1>

              {/* Subtitle */}
              <p className="font-sans text-[17px] leading-relaxed text-muted mb-10 max-w-xl">
                Setup, teams, submissions, judging, and wrap-up — orchestrated in real time.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link href="/hackathons">
                  <Button size="lg" variant="default">
                    Start a hackathon
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Watch the demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: 40% — Console preview */}
            <div className="lg:col-span-2">
              <div className="border-2 border-ink bg-ink">
                {/* Console header bar */}
                <div className="border-b-2 border-[#2a2720] px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                    dothack console — live
                  </span>
                  <span className="w-2 h-2 bg-accent rounded-full animate-dh-pulse" />
                </div>

                <div className="p-5 space-y-5">
                  {/* Live metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-[#2a2720] p-3">
                      <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted mb-1">
                        Builders live
                      </div>
                      <div className="font-archivo font-black text-3xl text-cream leading-none">
                        1,428
                      </div>
                    </div>
                    <div className="border border-[#2a2720] p-3">
                      <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted mb-1">
                        Submissions
                      </div>
                      <div className="font-archivo font-black text-3xl text-cream leading-none">
                        312
                      </div>
                    </div>
                  </div>

                  {/* Track list */}
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted mb-3">
                      Active Tracks
                    </div>
                    <div className="space-y-2">
                      {consoleTracks.map((track) => (
                        <div
                          key={track.name}
                          className="flex items-center justify-between border border-[#2a2720] px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                track.active ? 'bg-accent' : 'bg-muted'
                              }`}
                            />
                            <span className="font-mono text-[10px] text-cream uppercase tracking-[0.05em]">
                              {track.name}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-muted">
                            {track.count} teams
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status bar */}
                  <div className="border-t border-[#2a2720] pt-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-dh-pulse flex-shrink-0" />
                    <span className="font-mono text-[9px] text-muted uppercase tracking-[0.06em]">
                      Event status: LIVE — 14h 22m remaining
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────────────────────── */}
      <section className="bg-ink border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`py-8 px-6 text-center ${
                  i < stats.length - 1 ? 'md:border-r-2 border-[#2a2720]' : ''
                }`}
              >
                <div className="font-archivo font-black text-[42px] leading-none text-cream mb-2">
                  {s.value}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pipeline / Features ──────────────────────────────────────────── */}
      <section className="bg-cream border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          {/* Section header */}
          <div className="mb-12 border-b-2 border-ink pb-6">
            <h2 className="font-archivo font-black text-4xl uppercase tracking-[-0.03em] text-ink">
              The Pipeline
            </h2>
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-ink">
            {pipeline.map((item, i) => (
              <div
                key={item.phase}
                className={`${i < pipeline.length - 1 ? 'md:border-r-2 border-ink' : ''}`}
              >
                {/* Dark header stripe */}
                <div className="bg-ink px-5 py-4 flex items-center justify-between border-b-2 border-ink">
                  <span className="font-archivo font-black text-sm uppercase tracking-wider text-cream">
                    {item.title}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {item.phase}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <p className="font-sans text-sm leading-relaxed text-muted mb-5">
                    {item.desc}
                  </p>
                  <ul className="space-y-2">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-accent flex-shrink-0" />
                        <span className="font-sans text-sm text-ink">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Role-based section ───────────────────────────────────────────── */}
      <section className="bg-cream-dark border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          {/* Section header */}
          <div className="mb-12 border-b-2 border-ink pb-6">
            <h2 className="font-archivo font-black text-4xl uppercase tracking-[-0.03em] text-ink">
              Built for every role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.badge} className="border-2 border-ink bg-cream">
                {/* Role badge */}
                <div className="px-5 pt-5 pb-4 border-b-2 border-ink">
                  <div className="inline-flex items-center border-[1.5px] border-ink px-2 py-0.5 mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink">
                      {role.badge}
                    </span>
                  </div>
                  <h3 className="font-archivo font-black text-xl uppercase tracking-[-0.02em] text-ink leading-tight">
                    {role.title}
                  </h3>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <p className="font-sans text-sm leading-relaxed text-muted mb-5">
                    {role.desc}
                  </p>
                  <ul className="space-y-2">
                    {role.capabilities.map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-ink flex-shrink-0" />
                        <span className="font-sans text-sm text-ink">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────────────────────── */}
      <section className="bg-ink">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 text-center">
          <h2 className="font-archivo font-black text-4xl md:text-5xl uppercase tracking-[-0.03em] text-cream mb-4 max-w-2xl mx-auto leading-tight">
            Ready to run your next hackathon?
          </h2>
          <p className="font-sans text-[17px] text-muted mb-10 max-w-xl mx-auto">
            Join thousands of organizers who trust DotHack to power their events from start to finish.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/hackathons">
              <Button size="lg" variant="default">
                Start a hackathon
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-transparent text-cream border-2 border-cream hover:bg-cream hover:text-ink"
              >
                Talk to sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
