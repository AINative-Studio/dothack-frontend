'use client'

import { useState } from 'react'
import { Settings, Users, UsersRound, FolderKanban, FileCheck, Gavel, Trophy, ChevronDown } from 'lucide-react'

// ─── Feature groups ───────────────────────────────────────────────────────────
const featureGroups = [
  {
    id: 'setup',
    icon: Settings,
    title: 'Setup & Configuration',
    desc: 'Complete control over your hackathon setup',
    items: [
      {
        q: 'Tracks',
        a: 'Create multiple tracks for your hackathon to organize projects by theme, technology, or category. Each track can have its own description and criteria.',
      },
      {
        q: 'Custom Rubrics',
        a: 'Design custom judging rubrics with flexible criteria. Define scoring dimensions, point scales, and evaluation guidelines to ensure consistent and fair judging.',
      },
      {
        q: 'Event Status Management',
        a: 'Control your hackathon lifecycle with status management: DRAFT for planning, LIVE for active events, and CLOSED when complete. Status changes are tracked with append-only history.',
      },
    ],
  },
  {
    id: 'participants',
    icon: Users,
    title: 'Participants',
    desc: 'Comprehensive participant management',
    items: [
      {
        q: 'Registration',
        a: 'Add participants with essential information including name, email, and organization. Track all participants in one centralized location.',
      },
      {
        q: 'Role Assignment',
        a: 'Assign roles to participants: BUILDER for hackers, JUDGE for evaluators, MENTOR for advisors, and ORGANIZER for event managers. Roles control access and capabilities.',
      },
    ],
  },
  {
    id: 'teams',
    icon: UsersRound,
    title: 'Teams',
    desc: 'Flexible team organization',
    items: [
      {
        q: 'Team Management',
        a: 'Create and manage teams with optional track assignment. Add team members from registered participants and designate team leads. Teams can collaborate on projects and submit work together.',
      },
    ],
  },
  {
    id: 'projects',
    icon: FolderKanban,
    title: 'Projects',
    desc: 'Track project development',
    items: [
      {
        q: 'Project Creation',
        a: 'Teams create projects with title, one-liner description, and links to repositories and demos. Track project status from IDEA to BUILDING to SUBMITTED.',
      },
      {
        q: 'Progress Tracking',
        a: 'Monitor all projects in real-time. View project details, track status changes, and see which projects are ready for submission.',
      },
    ],
  },
  {
    id: 'submissions',
    icon: FileCheck,
    title: 'Submissions',
    desc: 'Centralized submission management',
    items: [
      {
        q: 'Submission Portal',
        a: 'Teams submit their work with narrative descriptions and artifact links. Submissions are automatically timestamped and linked to projects.',
      },
      {
        q: 'Search & Filter',
        a: 'Built-in search functionality to quickly find submissions by text content. Filter and organize submissions to streamline the judging process.',
      },
      {
        q: 'Deadline Enforcement',
        a: 'When hackathon status changes to CLOSED, the submission form is automatically disabled to enforce deadlines and prevent late submissions.',
      },
    ],
  },
  {
    id: 'judging',
    icon: Gavel,
    title: 'Judging',
    desc: 'Structured evaluation workflow',
    items: [
      {
        q: 'Criteria-Based Scoring',
        a: 'Judges evaluate submissions using the defined rubric criteria. Score each criterion individually and add qualitative feedback for teams.',
      },
      {
        q: 'Feedback System',
        a: 'Provide detailed feedback alongside scores to help teams understand their evaluation and improve future projects.',
      },
    ],
  },
  {
    id: 'leaderboard',
    icon: Trophy,
    title: 'Leaderboard',
    desc: 'Real-time rankings and results',
    items: [
      {
        q: 'Automatic Rankings',
        a: 'Scores are automatically aggregated per project/team. Rankings are calculated based on average total scores across all judges.',
      },
      {
        q: 'Track Filtering',
        a: 'Filter leaderboard results by track to see winners in each category. View overall rankings or focus on specific tracks.',
      },
      {
        q: 'CSV Export',
        a: 'Export complete leaderboard data as CSV for further analysis, reporting, or archiving. Download results with all scores and rankings.',
      },
    ],
  },
]

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="divide-y-2 divide-ink border-t-2 border-ink">
      {items.map((item) => {
        const isOpen = open === item.q
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : item.q)}
              className="w-full flex items-center justify-between px-0 py-4 text-left group"
            >
              <span className="font-archivo font-bold text-sm uppercase tracking-wide text-ink group-hover:text-accent transition-colors">
                {item.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="pb-4">
                <p className="font-sans text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-ink border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center border-[1.5px] border-[#2a2720] px-3 py-1 mb-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                Full Feature Set
              </span>
            </div>
            <h1 className="font-archivo font-black text-5xl md:text-6xl uppercase leading-[1] tracking-[-0.03em] text-cream mb-5">
              Everything you need to run successful hackathons.
            </h1>
            <p className="font-sans text-[17px] leading-relaxed text-muted">
              Complete platform for managing participants, teams, projects, submissions, judging, and leaderboards — from one console.
            </p>
          </div>
        </div>
      </section>

      {/* Feature groups */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="space-y-0">
            {featureGroups.map((group, i) => {
              const Icon = group.icon
              return (
                <div
                  key={group.id}
                  className={`grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-ink ${
                    i > 0 ? 'border-t-0' : ''
                  }`}
                >
                  {/* Left column — label */}
                  <div className="bg-cream-dark border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-ink p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-1">
                      <Icon className="h-5 w-5 text-ink flex-shrink-0" />
                      <h2 className="font-archivo font-black text-lg uppercase tracking-[-0.01em] text-ink">
                        {group.title}
                      </h2>
                    </div>
                    <p className="font-sans text-sm text-muted leading-relaxed">
                      {group.desc}
                    </p>
                  </div>

                  {/* Right column — accordion */}
                  <div className="md:col-span-2 p-6">
                    <Accordion items={group.items} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA strip */}
      <section className="bg-ink border-t-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-archivo font-black text-2xl uppercase tracking-[-0.02em] text-cream mb-1">
              Ready to get started?
            </h3>
            <p className="font-sans text-sm text-muted">No credit card required. Free tier available.</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <a
              href="/hackathons"
              className="inline-flex items-center justify-center font-archivo font-extrabold uppercase tracking-wider text-sm h-11 px-6 bg-accent text-white border-2 border-accent hover:bg-[#e03a14] hover:border-[#e03a14] transition-colors"
            >
              Open App
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center font-archivo font-extrabold uppercase tracking-wider text-sm h-11 px-6 bg-transparent text-cream border-2 border-cream hover:bg-cream hover:text-ink transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
