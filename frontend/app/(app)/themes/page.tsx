"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import {
  useThemes,
  useCreateTheme,
  useUpdateTheme,
  useDeleteTheme,
  useReorderTheme,
} from '@/hooks/use-api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Theme {
  id: string
  name: string
  description?: string | null
  color?: string | null
  display_order?: number
  created_at?: string
}

// ---------------------------------------------------------------------------
// Color picker swatches
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#ff4d23',
  '#16140f',
  '#1d6ae5',
  '#9333ea',
  '#16a34a',
  '#d97706',
  '#0891b2',
  '#db2777',
  '#65a30d',
  '#ea580c',
]

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            style={{ backgroundColor: c }}
            className={[
              'w-7 h-7 border-2 transition-transform hover:scale-110',
              value === c ? 'border-ink scale-110' : 'border-transparent',
            ].join(' ')}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#16140f'}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 border-2 border-ink cursor-pointer bg-transparent p-0"
          aria-label="Custom color"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="bg-cream border-2 border-ink px-3 py-1 font-mono text-[12px] text-ink outline-none focus:border-accent transition-colors w-28"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Theme Form Modal (create + edit)
// ---------------------------------------------------------------------------

interface ThemeFormModalProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<Theme>
  onClose: () => void
}

function ThemeFormModal({ mode, initialValues, onClose }: ThemeFormModalProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [color, setColor] = useState(initialValues?.color ?? '#ff4d23')
  const [displayOrder, setDisplayOrder] = useState(initialValues?.display_order ?? 1)

  const createTheme = useCreateTheme()
  const updateTheme = useUpdateTheme()

  const isPending = createTheme.isPending || updateTheme.isPending
  const error = createTheme.error ?? updateTheme.error

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { name, description: description || null, color: color || null, display_order: displayOrder }

    if (mode === 'create') {
      await createTheme.mutateAsync(body)
    } else if (initialValues?.id) {
      await updateTheme.mutateAsync({ id: initialValues.id, body })
    }
    onClose()
  }

  const title = mode === 'create' ? 'New Theme' : 'Edit Theme'
  const submitLabel = mode === 'create'
    ? (isPending ? 'Creating...' : 'Create Theme')
    : (isPending ? 'Saving...' : 'Save Changes')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-cream border-2 border-ink w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink bg-ink">
          <h2 className="font-archivo font-black text-[14px] uppercase tracking-wide text-cream">
            {title}
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
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="theme-name"
              className="font-mono text-[10px] uppercase tracking-widest text-muted"
            >
              Theme Name *
            </label>
            <input
              id="theme-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sustainability, Web3, AI..."
              className="bg-cream border-2 border-ink px-3 py-2 font-sans text-[13px] text-ink outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="theme-description"
              className="font-mono text-[10px] uppercase tracking-widest text-muted"
            >
              Description
            </label>
            <textarea
              id="theme-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this theme..."
              className="bg-cream border-2 border-ink px-3 py-2 font-sans text-[13px] text-ink outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Theme Color
            </span>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {/* Display Order */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="theme-order"
              className="font-mono text-[10px] uppercase tracking-widest text-muted"
            >
              Display Order
            </label>
            <input
              id="theme-order"
              type="number"
              min={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="bg-cream border-2 border-ink px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-accent transition-colors w-24"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-mono text-[10px] text-accent" role="alert">
              {(error as Error).message}
            </p>
          )}

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
              disabled={isPending || !name.trim()}
              className="bg-accent text-white font-archivo font-extrabold text-[11px] uppercase tracking-wide px-5 py-2 hover:bg-danger transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Theme card
// ---------------------------------------------------------------------------

interface ThemeCardProps {
  theme: Theme
  total: number
  onEdit: (theme: Theme) => void
}

function ThemeCard({ theme, total, onEdit }: ThemeCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteTheme = useDeleteTheme()
  const reorderTheme = useReorderTheme()
  const order = theme.display_order ?? 1

  async function handleDelete() {
    await deleteTheme.mutateAsync(theme.id)
    setConfirmDelete(false)
  }

  return (
    <div className="border-2 border-ink bg-cream flex flex-col">
      {/* Color accent strip */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{ backgroundColor: theme.color ?? '#ff4d23' }}
        aria-hidden="true"
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-archivo font-extrabold text-[15px] text-ink uppercase tracking-tight leading-tight flex-1">
            {theme.name}
          </h3>
          {/* Color dot */}
          <span
            className="w-4 h-4 border border-ink/40 shrink-0 mt-0.5"
            style={{ backgroundColor: theme.color ?? '#ff4d23' }}
            aria-label={`Color: ${theme.color ?? 'default'}`}
          />
        </div>

        {/* Description */}
        {theme.description && (
          <p className="font-sans text-[12px] text-muted leading-relaxed flex-1">
            {theme.description}
          </p>
        )}

        {/* Order badge */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
            Order:
          </span>
          <span className="font-mono text-[10px] text-ink font-semibold">{order}</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-ink/20 px-5 py-3 flex items-center justify-between gap-2 bg-cream-dark">
        {/* Reorder controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => reorderTheme.mutate({ id: theme.id, order: order - 1 })}
            disabled={order <= 1 || reorderTheme.isPending}
            aria-label="Move up"
            className="border border-ink w-5 h-5 flex items-center justify-center font-mono text-[9px] text-ink hover:bg-ink hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↑
          </button>
          <button
            onClick={() => reorderTheme.mutate({ id: theme.id, order: order + 1 })}
            disabled={order >= total || reorderTheme.isPending}
            aria-label="Move down"
            className="border border-ink w-5 h-5 flex items-center justify-center font-mono text-[9px] text-ink hover:bg-ink hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↓
          </button>
        </div>

        {/* Edit / Delete chips */}
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="font-mono text-[9px] text-muted uppercase tracking-widest">
                Delete?
              </span>
              <button
                onClick={handleDelete}
                disabled={deleteTheme.isPending}
                className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-accent text-white border border-accent hover:bg-danger transition-colors disabled:opacity-50"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border border-ink text-ink hover:bg-cream transition-colors"
              >
                No
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(theme)}
                className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 border border-ink text-ink hover:bg-ink hover:text-cream transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 border border-ink text-ink hover:border-accent hover:text-accent transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ThemesPage() {
  useAuth() // ensure auth context is consumed (token used by hooks)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Theme | null>(null)

  const themesQuery = useThemes()

  const rawThemes: any[] = Array.isArray(themesQuery.data)
    ? themesQuery.data
    : (themesQuery.data as any)?.themes ?? (themesQuery.data as any)?.items ?? []

  const themes: Theme[] = [...rawThemes].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  )

  const isLoading = themesQuery.isLoading

  return (
    <div className="p-7 max-w-5xl">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-archivo font-black text-[28px] uppercase tracking-tight text-ink leading-none">
            Hackathon Themes
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1.5">
            Manage theme categories for hackathon tagging
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-accent text-white font-archivo font-extrabold text-[11px] uppercase tracking-wide px-5 py-2.5 hover:bg-danger transition-colors shrink-0"
        >
          + New Theme
        </button>
      </div>

      {/* Stat tiles */}
      <div className="flex gap-4 mb-7">
        <div className="border-2 border-ink px-5 py-3 bg-cream-dark min-w-[120px]">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">
            Total Themes
          </p>
          <p className="font-archivo font-black text-[24px] text-ink leading-none">
            {isLoading ? '–' : themes.length}
          </p>
        </div>
      </div>

      {/* Error state */}
      {themesQuery.isError && (
        <div className="border-2 border-accent bg-[#fff3ef] px-5 py-4 mb-5" role="alert">
          <p className="font-mono text-[11px] text-accent uppercase tracking-widest">
            Failed to load themes: {(themesQuery.error as Error).message}
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
      {!isLoading && themes.length === 0 && !themesQuery.isError && (
        <div className="border-2 border-dashed border-ink p-16 flex flex-col items-center justify-center gap-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted text-center">
            No themes yet. Create your first theme to start tagging hackathons.
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent px-4 py-1.5 hover:bg-accent hover:text-white transition-colors"
          >
            + Create first theme
          </button>
        </div>
      )}

      {/* Theme grid */}
      {!isLoading && themes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              total={themes.length}
              onEdit={(t) => setEditTarget(t)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <ThemeFormModal
          mode="create"
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <ThemeFormModal
          mode="edit"
          initialValues={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
