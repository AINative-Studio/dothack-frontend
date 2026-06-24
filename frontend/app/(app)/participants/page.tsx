"use client"
import { useAuth } from '@/lib/auth/auth-context'
import { useHackathons } from '@/hooks/use-api'

export default function ParticipantsPage() {
  const { user } = useAuth()
  const { data, isLoading } = useHackathons()
  const hackathons = (data as any)?.hackathons || (Array.isArray(data) ? data : [])

  return (
    <div className="p-6">
      <h1 className="font-archivo font-black text-[38px] leading-[0.95] tracking-tight uppercase text-ink mb-2">Participants</h1>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-8">All participants across your hackathons</p>
      <div className="border-2 border-ink">
        <div className="bg-ink text-cream px-4 py-3 flex items-center justify-between">
          <span className="font-archivo font-extrabold text-sm uppercase tracking-wide">By Hackathon</span>
          <span className="font-mono text-[10px] text-[#c2a08f]">{hackathons.length} HACKATHONS</span>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map((i: number) => <div key={i} className="h-4 bg-cream-mid animate-pulse" />)}</div>
        ) : hackathons.length > 0 ? (
          <div>{hackathons.map((h: any, i: number) => (
            <a key={i} href={`/hackathons/${h.hackathon_id}/participants`} className="flex items-center justify-between px-4 py-3 border-b border-[#ddd6c6] hover:bg-cream-mid transition-colors">
              <span className="font-semibold text-sm">{h.name || h.hackathon_id}</span>
              <span className="font-mono text-xs text-muted">{h.participant_count || 0} participants →</span>
            </a>
          ))}</div>
        ) : (
          <div className="p-8 text-center"><p className="font-mono text-xs uppercase text-muted">No hackathons yet — create one from the dashboard</p></div>
        )}
      </div>
    </div>
  )
}
