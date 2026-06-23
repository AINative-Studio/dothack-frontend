"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useHackathon, useUpdateHackathon } from '@/hooks/use-api'
import { useAuth } from '@/lib/auth/auth-context'
import { apiClient } from '@/lib/api/client'
import { Plus, Loader2, Settings } from 'lucide-react'
import { toast } from 'sonner'
import type { Track, Rubric } from '@/lib/types'
import type { HackathonStatus } from '@/lib/api/hackathons-backend'

export default function SetupPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)
  const updateHackathon = useUpdateHackathon()

  // Tracks via apiClient — no dedicated hook in use-api.ts yet
  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ['dothack', 'tracks', params.hackathonId],
    queryFn: () =>
      apiClient<Track[]>(`/hackathons/${params.hackathonId}/tracks`, {
        token: token ?? undefined,
      }),
    enabled: !!params.hackathonId,
  })

  // Rubrics via apiClient — no dedicated hook in use-api.ts yet
  const { data: rubrics = [], isLoading: rubricsLoading } = useQuery<Rubric[]>({
    queryKey: ['dothack', 'rubrics', params.hackathonId],
    queryFn: () =>
      apiClient<Rubric[]>(`/hackathons/${params.hackathonId}/rubrics`, {
        token: token ?? undefined,
      }),
    enabled: !!params.hackathonId,
  })

  const createTrack = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiClient<Track>(`/hackathons/${params.hackathonId}/tracks`, {
        method: 'POST',
        body: JSON.stringify(data),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'tracks', params.hackathonId] })
    },
  })

  const createRubric = useMutation({
    mutationFn: (data: { title: string; criteria: unknown }) =>
      apiClient<Rubric>(`/hackathons/${params.hackathonId}/rubrics`, {
        method: 'POST',
        body: JSON.stringify(data),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'rubrics', params.hackathonId] })
    },
  })

  const [showTrackForm, setShowTrackForm] = useState(false)
  const [trackData, setTrackData] = useState({ name: '', description: '' })

  const [showRubricForm, setShowRubricForm] = useState(false)
  const [rubricData, setRubricData] = useState({ title: '', criteria_json: '' })

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTrack.mutateAsync({
        name: trackData.name,
        description: trackData.description,
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
      let criteria: unknown
      try {
        criteria = JSON.parse(rubricData.criteria_json)
      } catch {
        toast.error('Invalid JSON format for criteria')
        return
      }
      await createRubric.mutateAsync({ title: rubricData.title, criteria })
      toast.success('Rubric created successfully')
      setRubricData({ title: '', criteria_json: '' })
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

  const getStatusStyle = (status: string, isActive: boolean) => ({
    border: `2px solid var(--ink)`,
    borderRadius: 0,
    background: isActive ? 'var(--ink)' : 'transparent',
    color: isActive ? 'var(--cream)' : 'var(--ink)',
    fontFamily: 'Archivo, sans-serif',
    fontWeight: 700,
    fontSize: '0.85rem',
  })

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
                  border: '2px solid var(--ink)',
                  color: 'var(--ink)',
                  background: 'var(--cream)',
                  textTransform: 'uppercase',
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
              {(['draft', 'active', 'judging', 'completed'] as HackathonStatus[]).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  onClick={() => handleStatusChange(s)}
                  disabled={updateHackathon.isPending || hackathon.status === s}
                  style={getStatusStyle(s, hackathon.status === s)}
                >
                  {updateHackathon.isPending && hackathon.status !== s ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    s.charAt(0).toUpperCase() + s.slice(1)
                  )}
                </Button>
              ))}
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
                  <Label
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Name
                  </Label>
                  <Input
                    placeholder="AI & Machine Learning"
                    value={trackData.name}
                    onChange={(e) => setTrackData({ ...trackData, name: e.target.value })}
                    required
                    style={{
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      background: 'var(--cream)',
                      color: 'var(--ink)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Description
                  </Label>
                  <Textarea
                    placeholder="Projects using AI/ML technologies..."
                    value={trackData.description}
                    onChange={(e) => setTrackData({ ...trackData, description: e.target.value })}
                    required
                    style={{
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      background: 'var(--cream)',
                      color: 'var(--ink)',
                      fontFamily: 'Inter, sans-serif',
                    }}
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
                    style={{ padding: '12px', border: '1px solid var(--ink)', background: 'rgba(0,0,0,0.02)' }}
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
                    <p style={{ fontSize: '0.875rem', color: 'var(--ink)', opacity: 0.6 }}>
                      {track.description}
                    </p>
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
                  <Label
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Title
                  </Label>
                  <Input
                    placeholder="Main Rubric"
                    value={rubricData.title}
                    onChange={(e) => setRubricData({ ...rubricData, title: e.target.value })}
                    required
                    style={{
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      background: 'var(--cream)',
                      color: 'var(--ink)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Criteria (JSON)
                  </Label>
                  <Textarea
                    placeholder='{"innovation": {"weight": 30, "max": 10}, "execution": {"weight": 40, "max": 10}}'
                    value={rubricData.criteria_json}
                    onChange={(e) => setRubricData({ ...rubricData, criteria_json: e.target.value })}
                    rows={6}
                    required
                    style={{
                      border: '2px solid var(--ink)',
                      borderRadius: 0,
                      background: 'var(--cream)',
                      color: 'var(--ink)',
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
                    Enter criteria as JSON with weights and max scores
                  </p>
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
              <div className="space-y-2">
                {rubrics.map((rubric) => (
                  <div
                    key={rubric.rubric_id}
                    style={{ padding: '12px', border: '1px solid var(--ink)', background: 'rgba(0,0,0,0.02)' }}
                  >
                    <h4
                      style={{
                        fontFamily: 'Archivo, sans-serif',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        marginBottom: '8px',
                      }}
                    >
                      {rubric.title}
                    </h4>
                    <pre
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.75rem',
                        color: 'var(--ink)',
                        opacity: 0.8,
                        background: 'rgba(0,0,0,0.03)',
                        padding: '8px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {rubric.criteria_json}
                    </pre>
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
