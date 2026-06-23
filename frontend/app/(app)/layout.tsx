"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

const NAV_SECTIONS = [
  {
    label: 'OPERATE',
    items: [
      { href: '/hackathons', label: 'Dashboard' },
      { href: '/hackathons', label: 'Hackathons', badge: null },
      { href: '/hackathons', label: 'Participants' },
      { href: '/hackathons', label: 'Submissions' },
      { href: '/hackathons', label: 'Judging', badge: 3 },
      { href: '/hackathons', label: 'Leaderboard' },
      { href: '/hackathons', label: 'Prizes' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { href: '/hackathons', label: 'AI Recommendations', indicator: true },
      { href: '/hackathons', label: 'Semantic Search', indicator: true },
    ],
  },
  {
    label: 'CONFIGURE',
    items: [
      { href: '/api-settings', label: 'API Keys' },
      { href: '/hackathons', label: 'Payments' },
      { href: '/featured', label: 'Featured' },
      { href: '/themes', label: 'Themes' },
    ],
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [searchValue, setSearchValue] = useState('')

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'OR'

  const userName = user?.email ?? 'organizer@dothack.io'

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 bg-cream-dark border-r-2 border-ink"
        style={{ width: 236 }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b-2 border-ink">
          <Link href="/hackathons">
            <span className="font-archivo font-black text-[18px] uppercase tracking-tight text-ink">
              DotHack
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <div className="px-5 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  {section.label}
                </span>
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href && item.label === 'Dashboard'
                return (
                  <Link
                    key={`${section.label}-${item.label}`}
                    href={item.href}
                    className={[
                      'flex items-center justify-between px-5 py-2 text-[13px] font-medium transition-colors relative',
                      isActive
                        ? 'bg-[#fff3ef] text-ink'
                        : 'text-ink hover:bg-cream-mid',
                    ].join(' ')}
                  >
                    {/* Active left border */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-0 h-full bg-accent"
                        style={{ width: 4 }}
                      />
                    )}
                    <span className={isActive ? 'pl-1' : ''}>{item.label}</span>
                    <span className="flex items-center gap-1.5">
                      {'indicator' in item && item.indicator && (
                        <span
                          className="w-2 h-2 bg-accent shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {'badge' in item && item.badge ? (
                        <span className="bg-accent text-white font-mono text-[9px] px-1.5 py-0.5 leading-none">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div className="border-t-2 border-ink px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-ink text-cream flex items-center justify-center font-archivo font-black text-[11px] shrink-0">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ink truncate">{userName}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted">
              Organizer
            </p>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-7 py-3.5 border-b-2 border-ink bg-cream-dark shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="SEARCH HACKATHONS, TEAMS, SUBMISSIONS..."
              className="w-full bg-cream border-2 border-ink px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-ink placeholder:text-muted outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 bg-accent rounded-full animate-dh-pulse shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
              Live
            </span>
          </div>

          {/* Create button */}
          <Link href="/hackathons">
            <button className="bg-accent text-white font-archivo font-bold text-[12px] uppercase tracking-wide px-4 py-2 hover:bg-danger transition-colors">
              + Create
            </button>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
