"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useSearch } from '@/hooks/use-api'
import type { SearchEntityType } from '@/lib/api/search-backend'

// ---------------------------------------------------------------------------
// Type badge
// ---------------------------------------------------------------------------

function TypeBadge({ type }: { type: SearchEntityType }) {
  const styles: Record<SearchEntityType, string> = {
    hackathon:  'bg-accent text-white',
    submission: 'bg-ink text-cream',
    team:       'bg-cream-dark text-ink border border-ink',
  }
  return (
    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 ${styles[type]}`}>
      {type}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Score bar
// ---------------------------------------------------------------------------

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score * 100))
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 bg-cream-mid flex-1 max-w-[80px]">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[9px] text-muted">{pct}%</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton result row
// ---------------------------------------------------------------------------

function SkeletonResult() {
  return (
    <div className="border-b border-ink/10 px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 bg-cream-mid animate-pulse" />
        <div className="h-4 flex-1 bg-cream-mid animate-pulse max-w-xs" />
      </div>
      <div className="h-3 bg-cream-mid animate-pulse w-3/4" />
      <div className="h-2 bg-cream-mid animate-pulse w-24" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type EntityFilter = 'all' | SearchEntityType

const ENTITY_FILTERS: { value: EntityFilter; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'hackathon',  label: 'Hackathons' },
  { value: 'submission', label: 'Submissions' },
  { value: 'team',       label: 'Teams' },
]

export default function SearchPage() {
  useAuth()
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all')

  const { data, isLoading, isError, error } = useSearch(
    {
      query: submittedQuery,
      entity_type: entityFilter === 'all' ? undefined : entityFilter,
      limit: 50,
    },
    { enabled: !!submittedQuery }
  )

  const results = data?.results ?? []
  const totalResults = data?.total_results ?? 0
  const executionMs = data?.execution_time_ms

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) setSubmittedQuery(trimmed)
  }

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Semantic Search
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          AI-powered search across hackathons, submissions and teams
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-0 border-2 border-ink focus-within:border-accent transition-colors">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH ACROSS ALL ENTITIES..."
            className="flex-1 bg-cream px-5 py-3.5 font-mono text-[12px] uppercase tracking-wider text-ink placeholder:text-muted outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="bg-ink text-cream font-archivo font-black text-[12px] uppercase tracking-wide px-6 py-3.5 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Entity filter chips */}
      <div className="flex items-center gap-2 mb-7">
        {ENTITY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setEntityFilter(f.value)}
            className={[
              'font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border-2 transition-colors',
              entityFilter === f.value
                ? 'bg-ink text-cream border-ink'
                : 'bg-cream text-ink border-ink hover:bg-cream-dark',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <div className="border-2 border-accent bg-[#fff3ef] px-5 py-4 mb-5" role="alert">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest">
            Search failed: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="border-2 border-ink">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonResult key={i} />
          ))}
        </div>
      )}

      {/* Results meta */}
      {!isLoading && !isError && submittedQuery && (
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{submittedQuery}&rdquo;
          </p>
          {executionMs !== undefined && (
            <p className="font-mono text-[9px] text-muted">{executionMs}ms</p>
          )}
        </div>
      )}

      {/* No results */}
      {!isLoading && !isError && submittedQuery && results.length === 0 && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            No results found
          </span>
          <span className="font-mono text-[10px] text-muted">
            Try adjusting your search terms or entity filter
          </span>
        </div>
      )}

      {/* No query yet */}
      {!submittedQuery && !isLoading && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            Enter a query above to search
          </span>
          <span className="font-mono text-[10px] text-muted">
            Semantic search across hackathons, submissions, and teams
          </span>
        </div>
      )}

      {/* Results list */}
      {!isLoading && !isError && results.length > 0 && (
        <div className="border-2 border-ink">
          {results.map((result, idx) => (
            <div
              key={result.id}
              className={[
                'flex items-start gap-5 px-5 py-4 border-b border-ink/10 last:border-0 hover:bg-cream-mid transition-colors',
                idx % 2 === 0 ? 'bg-cream' : 'bg-cream-dark',
              ].join(' ')}
            >
              {/* Score bar */}
              <div className="shrink-0 pt-0.5 w-24">
                <ScoreBar score={result.score} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <TypeBadge type={result.metadata.entity_type} />
                  {result.metadata.status && (
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                      {result.metadata.status}
                    </span>
                  )}
                </div>
                <p className="font-archivo font-bold text-[14px] text-ink leading-snug">
                  {result.metadata.title}
                </p>
                {result.metadata.description && (
                  <p className="font-sans text-[12px] text-muted mt-1 leading-relaxed line-clamp-2">
                    {result.metadata.description}
                  </p>
                )}
                <p className="font-mono text-[9px] text-muted mt-2 uppercase tracking-widest">
                  ID: {result.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
