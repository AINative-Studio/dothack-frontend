"use client"

export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/auth/auth-context'
import { useHackathons, usePrizes } from '@/hooks/use-api'
import type { Prize } from '@/lib/api/hackathons-backend'

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="border-2 border-ink p-5 flex flex-col gap-3">
      <div className="h-4 bg-cream-mid animate-pulse w-2/3" />
      <div className="h-3 bg-cream-mid animate-pulse w-1/2" />
      <div className="h-6 bg-cream-mid animate-pulse w-1/3 mt-1" />
      <div className="h-3 bg-cream-mid animate-pulse w-3/4 mt-1" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Prize card
// ---------------------------------------------------------------------------

function PrizeCard({ prize, hackathonName }: { prize: Prize; hackathonName: string }) {
  const formattedAmount = prize.amount
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: prize.currency ?? 'USD',
        maximumFractionDigits: 0,
      }).format(prize.amount)
    : null

  return (
    <div className="border-2 border-ink p-5 flex flex-col gap-2 hover:bg-cream-mid transition-colors">
      {/* Rank ribbon */}
      <div className="flex items-center gap-2 mb-1">
        {prize.rank && prize.rank <= 3 ? (
          <span className="font-archivo font-black text-[28px] text-accent leading-none">
            #{prize.rank}
          </span>
        ) : prize.rank ? (
          <span className="font-mono text-[12px] text-muted">RANK {prize.rank}</span>
        ) : null}
      </div>

      {/* Title */}
      <p className="font-archivo font-bold text-[15px] text-ink leading-snug">{prize.title}</p>

      {/* Amount */}
      {formattedAmount && (
        <p className="font-archivo font-black text-[22px] text-accent leading-none">
          {formattedAmount}
        </p>
      )}

      {/* Sponsor */}
      {prize.sponsor && (
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted">
          Sponsored by {prize.sponsor}
        </p>
      )}

      {/* Description */}
      {prize.description && (
        <p className="text-[12px] text-muted leading-relaxed mt-1">{prize.description}</p>
      )}

      {/* Hackathon label */}
      <div className="mt-2 pt-3 border-t border-ink/20">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
          {hackathonName}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Prizes for a single hackathon
// ---------------------------------------------------------------------------

function HackathonPrizes({
  hackathonId,
  hackathonName,
}: {
  hackathonId: string
  hackathonName: string
}) {
  const { data, isLoading } = usePrizes(hackathonId)
  const prizes = data?.prizes ?? []

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={`${hackathonId}-skel-${i}`} />
        ))}
      </>
    )
  }

  if (prizes.length === 0) return null

  return (
    <>
      {prizes.map((prize) => (
        <PrizeCard key={prize.prize_id} prize={prize} hackathonName={hackathonName} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function PrizesPage() {
  useAuth()

  const { data: hackathonsData, isLoading: hackathonsLoading } = useHackathons({ limit: 200 })
  const hackathons = hackathonsData?.hackathons ?? []

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Prizes
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          All prizes across hackathons
        </p>
      </div>

      {/* Loading skeleton */}
      {hackathonsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hackathonsLoading && hackathons.length === 0 && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            No hackathons found
          </span>
          <span className="font-mono text-[10px] text-muted">
            Create a hackathon and add prizes to see them here
          </span>
        </div>
      )}

      {/* Prize cards grid */}
      {!hackathonsLoading && hackathons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hackathons.map((h) => (
            <HackathonPrizes
              key={h.hackathon_id}
              hackathonId={h.hackathon_id}
              hackathonName={h.name}
            />
          ))}
        </div>
      )}
    </div>
  )
}
