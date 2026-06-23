"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useHackathon,
  useUpdateHackathon,
  useTracks,
  useCreateTrack,
  useRubrics,
  useCreateRubric,
} from '@/hooks/use-api'
import type { HackathonStatus } from '@/lib/api/hackathons-backend'
import { Plus, Loader2, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function SetupPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)
  const { data: tracksData, isLoading: tracksLoading } = useTracks(params.hackathonId)
  const { data: rubricsData, isLoading: rubricsLoading } = useRubrics(params.hackathonId)

  const updateHackathon = useUpdateHackathon()
  const createTrack = useCreateTrack(params.hackathonId)
  const createRubric = useCreateRubric(params.hackathonId)

  const [showTrackForm, setShowTrackForm] = useState(false)
  const [trackData, setTrackData] = useState({ name: '', description: '' })

  const [showRubricForm, setShowRubricForm] = useState(false)
  const [rubricData, setRubricData] = useState({
    name: '',
    criteria_json: '',
    is_active: true,
  })

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTrack.mutateAsync({
        name: trackData.name,
        description: trackData.description || null,
      })
      toast.success('Track created successfully')
      setTrackData({ name: '', description: '' })
      setShowTrackForm(false)
    } catch (error) {
      console.error('Failed to create track:', error)
      toast.error('Failed to create track', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handleAddRubric = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let criteria: { name: string; description: string; max_score: number; weight: number }[]
      try {
        criteria = JSON.parse(rubricData.criteria_json)
        if (!Array.isArray(criteria)) throw new Error('Criteria must be an array')
      } catch {
        toast.error('Invalid JSON: criteria must be an array of criterion objects')
        return
      }
      await createRubric.mutateAsync({
        name: rubricData.name,
        criteria,
        is_active: rubricData.is_active,
      })
      toast.success('Rubric created successfully')
      setRubricData({ name: '', criteria_json: '', is_active: true })
      setShowRubricForm(false)
    } catch (error) {
      console.error('Failed to create rubric:', error)
      toast.error('Failed to create rubric', {
        description: error instanceof Error ? error.message : 'Please check JSON format',
      })
    }
  }

  const handleStatusChange = async (newStatus: HackathonStatus) => {
    if (!hackathon) return
    try {
      await updateHackathon.mutateAsync({
        id: params.hackathonId,
        data: { status: newStatus },
      })
      toast.success(`Hackathon status changed to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  if (hackathonLoading || tracksLoading || rubricsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p style={{ color: 'var(--ink)', opacity: 0.6 }}>Hackathon not found</p>
      </div>
    )
  }

  const tracks = tracksData?.tracks ?? []
  const rubrics = rubricsData?.rubrics ?? []

  const inputStyle = {
    border: '2px solid var(--ink)',
    borderRadius: 0,
    background: 'var(--cream)',
    color: 'var(--ink)',
    fontFamily: 'Inter, sans-serif',
  }

  const labelStyle = {
    fontFamily: 'Archivo, sans-serif',
    fontWeight: 700 as const,
    color: 'var(--ink)',
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-7 w-7" style={{ color: 'var(--ink)' }} />
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}
          >
            Setup
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.6 }}>{hackathon.name}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Management */}
        <Card
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}>
                  Event Status
                </CardTitle>
                <CardDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
                  Control the hackathon lifecycle
                </CardDescription>
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  border: '2px solid var(--accent)',
                  color: 'var(--accent)',
                  textTransform: 'uppercase' as const,
                }}
              >
                {hackathon.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--ink)',
                opacity: 0.6,
                marginBottom: '1rem',
              }}
            >
              Status changes control participant access and submission windows.
            </p>
            <div className="flex gap-2 flex-wrap">
              {(['draft', 'active', 'judging', 'completed'] as HackathonStatus[]).map((s) => {
                const isActive = hackathon.status === s
                return (
                  <Button
                    key={s}
                    size="sm"
                    onClick={() => handleStatusChange(s)}
                    disabled={updateHackathon.isPending || isActive}
                    style={{
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      background: isActive ? 'var(--ink)' : 'transparent',
                      color: isActive ? 'var(--cream)' : 'var(--ink)',
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tracks */}
        <Card
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}>
                  Tracks
                </CardTitle>
                <CardDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
                  Organize projects by theme or category
                </CardDescription>
              </div>
              {!showTrackForm && (
                <Button
                  size="sm"
                  onClick={() => setShowTrackForm(true)}
                  style={{
                    background: 'var(--ink)',
                    color: 'var(--cream)',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Track
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {showTrackForm && (
              <form
                onSubmit={handleAddTrack}
                className="mb-6 space-y-4"
                style={{ padding: '16px', border: '1px solid var(--ink)' }}
              >
                <div className="space-y-2">
                  <Label style={labelStyle}>Name</Label>
                  <Input
                    placeholder="AI & Machine Learning"
                    value={trackData.name}
                    onChange={(e) => setTrackData({ ...trackData, name: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={labelStyle}>
                    Description <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                  </Label>
                  <Textarea
                    placeholder="Projects using AI/ML technologies..."
                    value={trackData.description}
                    onChange={(e) => setTrackData({ ...trackData, description: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createTrack.isPending}
                    style={{
                      background: 'var(--ink)',
                      color: 'var(--cream)',
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    {createTrack.isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add'
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTrackForm(false)}
                    disabled={createTrack.isPending}
                    style={{
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      background: 'transparent',
                      color: 'var(--ink)',
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {tracks.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--ink)', opacity: 0.5 }}>
                No tracks yet
              </p>
            ) : (
              <div className="space-y-2">
                {tracks.map((track) => (
                  <div
                    key={track.track_id}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--ink)',
                      background: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: 'Archivo, sans-serif',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        marginBottom: '4px',
                      }}
                    >
                      {track.name}
                    </h4>
                    {track.description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--ink)', opacity: 0.6 }}>
                        {track.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Judging Rubrics */}
        <Card
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}>
                  Judging Rubrics
                </CardTitle>
                <CardDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
                  Define evaluation criteria for judges
                </CardDescription>
              </div>
              {!showRubricForm && (
                <Button
                  size="sm"
                  onClick={() => setShowRubricForm(true)}
                  style={{
                    background: 'var(--ink)',
                    color: 'var(--cream)',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rubric
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {showRubricForm && (
              <form
                onSubmit={handleAddRubric}
                className="mb-6 space-y-4"
                style={{ padding: '16px', border: '1px solid var(--ink)' }}
              >
                <div className="space-y-2">
                  <Label style={labelStyle}>Rubric Name</Label>
                  <Input
                    placeholder="Main Judging Rubric"
                    value={rubricData.name}
                    onChange={(e) => setRubricData({ ...rubricData, name: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label style={labelStyle}>Criteria (JSON Array)</Label>
                  <Textarea
                    placeholder={`[
  { "name": "Innovation", "description": "How novel is the idea?", "max_score": 10, "weight": 0.3 },
  { "name": "Execution", "description": "How well is it built?", "max_score": 10, "weight": 0.4 },
  { "name": "Impact", "description": "What is the potential impact?", "max_score": 10, "weight": 0.3 }
]`}
                    value={rubricData.criteria_json}
                    onChange={(e) =>
                      setRubricData({ ...rubricData, criteria_json: e.target.value })
                    }
                    rows={8}
                    required
                    style={{
                      ...inputStyle,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.8rem',
                    }}
                  />
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--ink)',
                      opacity: 0.5,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Array of objects with: name, description, max_score, weight (weights should sum
                    to 1.0)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={rubricData.is_active}
                    onChange={(e) =>
                      setRubricData({ ...rubricData, is_active: e.target.checked })
                    }
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <Label
                    htmlFor="is_active"
                    style={{ ...labelStyle, cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Set as active rubric
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createRubric.isPending}
                    style={{
                      background: 'var(--ink)',
                      color: 'var(--cream)',
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    {createRubric.isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add'
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRubricForm(false)}
                    disabled={createRubric.isPending}
                    style={{
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      background: 'transparent',
                      color: 'var(--ink)',
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {rubrics.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--ink)', opacity: 0.5 }}>
                No rubrics yet
              </p>
            ) : (
              <div className="space-y-3">
                {rubrics.map((rubric) => (
                  <div
                    key={rubric.rubric_id}
                    style={{
                      padding: '12px',
                      border: rubric.is_active
                        ? '2px solid var(--accent)'
                        : '1px solid var(--ink)',
                      background: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        style={{
                          fontFamily: 'Archivo, sans-serif',
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                      >
                        {rubric.name}
                      </h4>
                      {rubric.is_active && (
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            border: '2px solid var(--accent)',
                            color: 'var(--accent)',
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {rubric.criteria.map((criterion, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                          style={{
                            fontSize: '0.8rem',
                            fontFamily: 'Inter, sans-serif',
                            color: 'var(--ink)',
                            padding: '4px 8px',
                            background: 'rgba(0,0,0,0.03)',
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{criterion.name}</span>
                          <span style={{ opacity: 0.6, fontFamily: 'JetBrains Mono, monospace' }}>
                            max {criterion.max_score} · weight {(criterion.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
