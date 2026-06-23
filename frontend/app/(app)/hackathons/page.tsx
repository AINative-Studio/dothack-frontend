"use client"

export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/auth/auth-context'
import { OrganizerDashboard } from './components/OrganizerDashboard'
import { BuilderDashboard } from './components/BuilderDashboard'
import { JudgeDashboard } from './components/JudgeDashboard'

export default function HackathonsPage() {
  const { user } = useAuth()

  // Role-based dashboard routing driven by auth context
  const role = (user as any)?.role ?? 'ORGANIZER'

  if (role === 'BUILDER') {
    return <BuilderDashboard />
  }

  if (role === 'JUDGE') {
    return <JudgeDashboard />
  }

  // Default to organizer dashboard
  return <OrganizerDashboard />
}
