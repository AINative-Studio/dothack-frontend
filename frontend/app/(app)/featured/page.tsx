"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import {
  useFeaturedHackathons,
  useCreateFeatured,
  useDeleteFeatured,
  useReorderFeatured,
  useHackathons,
} from '@/hooks/use-api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeaturedEntry {
  id: string
  hackathon_id: string
  display_order: number
  is_active: boolean
  hackathon?: {
    name: string
    status: string
  }
}

// ---------------------------------------------------------------------------
// Add Modal
// ---------------------------------------------------------------------------

function AddFeaturedModal({
  onClose,
  hackathons,
  existingIds,
}: {
  onClose: () => void
  hackathons: Array<{ hackathon_id: string; name: string; status: string }>
  existingIds: Set<string>
}) {
  const [hackathonId, setHackathonId] = useState('')
  const [displayOrder, setDisplayOrder] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const createFeatured = useCreateFeatured()

  const available = hackathons.filter((h) => !existingIds.has(h.hackathon_id))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hackathonId) return
    await createFeatured.mutateAsync({
      hackathon_id: hackathonId,
      display_order: displayOrder,
      is_active: isActive,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Feature a hackathon"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative bg-cream border-2 border-ink w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink bg-ink">
          <h2 className="font-archivo font-black text-[14px] uppercase tracking-wide text-cream">
            Feature a Hackathon
          </h2>
          <button
            onClick={onClose}
            className="text-cream hover:text-accent font-mono text-[16px] leading-none"
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Hackathon selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Hackathon
            </label>
            <select
              value={hackathonId}
              onChange={(e) => setHackathonId(e.target.value)}
              required
              className="bg-cream border-2 border-ink px-3 py-2 font-sans text-[13px] text-ink outline-none focus:border-accent transition-colors appearance-none"
            >
              <option value="">Select a hackathon...</option>
              {available.map((h) => (
                <option key={h.hackathon_id} value={h.hackathon_id}>
                  {h.name} [{h.status.toUpperCase()}]
                </option>
              ))}
            </select>
            {available.length === 0 && (
              <p className="font-mono text-[10px] text-muted">
                All hackathons are already featured.
              </p>
            )}
          </div>

          {/* Display order */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Display Order
            </label>
            <input
              type="number"
              min={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="bg-cream border-2 border-ink px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-accent transition-colors w-24"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <input
              id="modal-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 border-2 border-ink accent-accent"
            />
            <label
              htmlFor="modal-active"
              className="font-mono text-[11px] uppercase tracking-widest text-ink cursor-pointer"
            >
              Active (visible on landing page)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-ink">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[11px] uppercase tracking-widest text-muted border-2 border-ink px-4 py-2 hover:bg-cream-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFeatured.isPending || !hackathonId}
              className="bg-accent text-white font-archivo font-extrabold text-[11px] uppercase tracking-wide px-5 py-2 hover:bg-danger transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createFeatured.isPending ? 'Adding...' : 'Feature Hackathon'}
            </button>
          </div>

          {createFeatured.isError && (
            <p className="font-mono text-[10px] text-accent mt-1" role="alert">
              {(createFeatured.error as Error).message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border',
        active
          ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]'
          : 'bg-cream-dark text-muted border-ink',
      ].join(' ')}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Reorder controls
// ---------------------------------------------------------------------------

function ReorderControls({
  id,
  order,
  total,
}: {
  id: string
  order: number
  total: number
}) {
  const reorder = useReorderFeatured()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => reorder.mutate({ id, order: order - 1 })}
        disabled={order <= 1 || reorder.isPending}
        aria-label="Move up"
        className="border border-ink w-6 h-6 flex items-center justify-center font-mono text-[10px] text-ink hover:bg-ink hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ↑
      </button>
      <span className="font-mono text-[11px] text-ink w-6 text-center">{order}</span>
      <button
        onClick={() => reorder.mutate({ id, order: order + 1 })}
        disabled={order >= total || reorder.isPending}
        aria-label="Move down"
        className="border border-ink w-6 h-6 flex items-center justify-center font-mono text-[10px] text-ink hover:bg-ink hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ↓
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function FeaturedHackathonsPage() {
  const { token } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const featuredQuery = useFeaturedHackathons()
  const hackathonsQuery = useHackathons({ limit: 200 })
  const deleteFeatured = useDeleteFeatured()

  const rawFeatured: any[] = Array.isArray(featuredQuery.data)
    ? featuredQuery.data
    : (featuredQuery.data as any)?.featured ?? (featuredQuery.data as any)?.items ?? []

  // Sort by display_order ascending
  const featured: FeaturedEntry[] = [...rawFeatured].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  )

  const allHackathons = hackathonsQuery.data?.hackathons ?? []
  const existingIds = new Set(featured.map((f) => f.hackathon_id))

  // Helper: get hackathon name from the joined data or from allHackathons list
  function getHackathonName(entry: FeaturedEntry): string {
    if (entry.hackathon?.name) return entry.hackathon.name
    const found = allHackathons.find((h) => h.hackathon_id === entry.hackathon_id)
    return found?.name ?? entry.hackathon_id
  }

  async function handleDelete(id: string) {
    await deleteFeatured.mutateAsync(id)
    setDeleteTarget(null)
  }

  const isLoading = featuredQuery.isLoading

  return (
    <div className="p-7 max-w-5xl">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-archivo font-black text-[28px] uppercase tracking-tight text-ink leading-none">
            Featured Hackathons
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1.5">
            Curate which hackathons appear on the public landing page
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-accent text-white font-archivo font-extrabold text-[11px] uppercase tracking-wide px-5 py-2.5 hover:bg-danger transition-colors shrink-0"
        >
          + Feature Hackathon
        </button>
      </div>

      {/* Stat tile */}
      <div className="flex gap-4 mb-7">
        <div className="border-2 border-ink px-5 py-3 bg-cream-dark min-w-[120px]">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">
            Total Featured
          </p>
          <p className="font-archivo font-black text-[24px] text-ink leading-none">
            {isLoading ? '–' : featured.length}
          </p>
        </div>
        <div className="border-2 border-ink px-5 py-3 bg-cream-dark min-w-[120px]">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">
            Active
          </p>
          <p className="font-archivo font-black text-[24px] text-ink leading-none">
            {isLoading ? '–' : featured.filter((f) => f.is_active).length}
          </p>
        </div>
      </div>

      {/* Error state */}
      {featuredQuery.isError && (
        <div className="border-2 border-accent bg-[#fff3ef] px-5 py-4 mb-5" role="alert">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest">
            Failed to load featured hackathons:{' '}
            {(featuredQuery.error as Error).message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="border-2 border-ink p-8 flex items-center justify-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted animate-pulse">
            Loading...
          </span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && featured.length === 0 && !featuredQuery.isError && (
        <div className="border-2 border-dashed border-ink p-12 flex flex-col items-center justify-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            No featured hackathons yet
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent px-4 py-1.5 hover:bg-accent hover:text-white transition-colors"
          >
            + Feature your first hackathon
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && featured.length > 0 && (
        <div className="border-2 border-ink overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink">
                <th className="px-5 py-3 text-left font-archivo font-black text-[11px] uppercase tracking-widest text-cream">
                  Hackathon
                </th>
                <th className="px-5 py-3 text-left font-archivo font-black text-[11px] uppercase tracking-widest text-cream">
                  Status
                </th>
                <th className="px-5 py-3 text-center font-archivo font-black text-[11px] uppercase tracking-widest text-cream">
                  Order
                </th>
                <th className="px-5 py-3 text-right font-archivo font-black text-[11px] uppercase tracking-widest text-cream">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {featured.map((entry, idx) => (
                <tr
                  key={entry.id ?? entry.hackathon_id}
                  className={[
                    'border-t border-ink/20 transition-colors',
                    idx % 2 === 0 ? 'bg-cream' : 'bg-cream-dark',
                  ].join(' ')}
                >
                  {/* Hackathon name */}
                  <td className="px-5 py-3">
                    <span className="font-archivo font-semibold text-[13px] text-ink">
                      {getHackathonName(entry)}
                    </span>
                  </td>

                  {/* Active badge */}
                  <td className="px-5 py-3">
                    <StatusBadge active={entry.is_active} />
                  </td>

                  {/* Reorder controls */}
                  <td className="px-5 py-3">
                    <div className="flex justify-center">
                      <ReorderControls
                        id={entry.id ?? entry.hackathon_id}
                        order={entry.display_order ?? idx + 1}
                        total={featured.length}
                      />
                    </div>
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end">
                      {deleteTarget === (entry.id ?? entry.hackathon_id) ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-muted uppercase tracking-widest">
                            Remove?
                          </span>
                          <button
                            onClick={() => handleDelete(entry.id ?? entry.hackathon_id)}
                            disabled={deleteFeatured.isPending}
                            className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 bg-accent text-white border border-accent hover:bg-danger transition-colors disabled:opacity-50"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteTarget(null)}
                            className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border border-ink text-ink hover:bg-cream-dark transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteTarget(entry.id ?? entry.hackathon_id)}
                          className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 border border-ink text-ink hover:border-accent hover:text-accent transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <AddFeaturedModal
          onClose={() => setShowModal(false)}
          hackathons={allHackathons.map((h) => ({
            hackathon_id: h.hackathon_id,
            name: h.name,
            status: h.status,
          }))}
          existingIds={existingIds}
        />
      )}
    </div>
  )
}
