"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useHackathons } from '@/hooks/use-api'

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function RecommendationsPage() {
  useAuth()
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('')

  const { data: hackathonsData, isLoading: hackathonsLoading } = useHackathons({ limit: 200 })
  const hackathons = hackathonsData?.hackathons ?? []
  const selectedHackathon = hackathons.find((h) => h.hackathon_id === selectedHackathonId)

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
            AI Recommendations
          </h1>
          <span className="w-2.5 h-2.5 bg-accent rounded-full animate-dh-pulse shrink-0 mt-1" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Intelligent insights and recommendations powered by AI
        </p>
      </div>

      {/* Hackathon selector */}
      <div className="mb-10 flex items-center gap-4">
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

      {/* No hackathon selected */}
      {!selectedHackathonId && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-ink flex items-center justify-center">
            <span className="font-archivo font-black text-[20px] text-ink">AI</span>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted text-center">
            Select a hackathon to view recommendations
          </span>
          <span className="font-mono text-[10px] text-muted text-center max-w-xs">
            AI-generated insights will appear here once a hackathon is selected and has sufficient
            data
          </span>
        </div>
      )}

      {/* Hackathon selected — coming soon placeholder cards */}
      {selectedHackathonId && (
        <div className="space-y-4">
          {[
            {
              category: 'Participant Engagement',
              insight: 'Recommendations for improving participant retention and engagement.',
            },
            {
              category: 'Team Matching',
              insight:
                'AI-suggested team formations based on skill compatibility and project interests.',
            },
            {
              category: 'Judging Consistency',
              insight:
                'Analysis of scoring patterns and suggestions to improve judging fairness.',
            },
            {
              category: 'Track Optimization',
              insight:
                'Insights on track popularity and recommendations for resource allocation.',
            },
          ].map((rec) => (
            <div key={rec.category} className="border-2 border-ink p-5 relative overflow-hidden">
              {/* Coming soon overlay */}
              <div className="absolute inset-0 bg-cream/80 flex items-center justify-center z-10">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted border border-muted px-3 py-1.5">
                  Coming soon
                </span>
              </div>
              <div className="opacity-30">
                <p className="font-mono text-[9px] uppercase tracking-widest text-accent mb-2">
                  {rec.category}
                </p>
                <p className="font-archivo font-bold text-[14px] text-ink">
                  {selectedHackathon?.name ?? 'Hackathon'} &mdash; {rec.category}
                </p>
                <p className="text-[12px] text-muted mt-2">{rec.insight}</p>
              </div>
            </div>
          ))}

          <div className="border-2 border-dashed border-ink p-8 flex flex-col items-center gap-3 mt-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted text-center">
              Full AI recommendations engine in development
            </p>
            <p className="font-mono text-[9px] text-muted text-center max-w-sm">
              Connect your hackathon data to start receiving AI-powered insights on participant
              behavior, submission quality, and judging patterns
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
