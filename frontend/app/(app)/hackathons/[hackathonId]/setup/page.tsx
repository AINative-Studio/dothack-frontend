"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useHackathonById, useUpdateHackathon } from '@/hooks/use-hackathons'
import { useTracksByHackathon, useCreateTrack } from '@/hooks/use-tracks'
import { useRubricByHackathon, useCreateRubric } from '@/hooks/use-rubrics'
import type { HackathonStatus } from '@/lib/types'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SetupPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { data: hackathon, isLoading: hackathonLoading } = useHackathonById(params.hackathonId)
  const { data: tracks = [], isLoading: tracksLoading } = useTracksByHackathon(params.hackathonId)
  const { data: rubrics = [], isLoading: rubricsLoading } = useRubricByHackathon(params.hackathonId)

  const updateHackathon = useUpdateHackathon()
  const createTrack = useCreateTrack()
  const createRubric = useCreateRubric()

  const [showTrackForm, setShowTrackForm] = useState(false)
  const [trackData, setTrackData] = useState({ name: '', description: '' })

  const [showRubricForm, setShowRubricForm] = useState(false)
  const [rubricData, setRubricData] = useState({ title: '', criteria_json: '' })

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTrack.mutateAsync({
        hackathon_id: params.hackathonId,
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
      const criteria = JSON.parse(rubricData.criteria_json)
      await createRubric.mutateAsync({
        hackathon_id: params.hackathonId,
        title: rubricData.title,
        criteria,
      })
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
        hackathon_id: params.hackathonId,
        status: newStatus,
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Hackathon not found</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'LIVE': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Setup - {hackathon.name}</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Event Status</CardTitle>
                <CardDescription>Control the hackathon lifecycle</CardDescription>
              </div>
              <Badge className={getStatusColor(hackathon.status)}>
                {hackathon.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Status changes are append-only and tracked with history
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={hackathon.status === 'DRAFT' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('DRAFT')}
                  disabled={updateHackathon.isPending}
                >
                  {updateHackathon.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Draft'}
                </Button>
                <Button
                  size="sm"
                  variant={hackathon.status === 'LIVE' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('LIVE')}
                  disabled={updateHackathon.isPending}
                >
                  {updateHackathon.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Live'}
                </Button>
                <Button
                  size="sm"
                  variant={hackathon.status === 'CLOSED' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('CLOSED')}
                  disabled={updateHackathon.isPending}
                >
                  {updateHackathon.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Closed'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tracks</CardTitle>
                <CardDescription>Organize projects by theme or category</CardDescription>
              </div>
              {!showTrackForm && (
                <Button size="sm" onClick={() => setShowTrackForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Track
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showTrackForm && (
              <form onSubmit={handleAddTrack} className="mb-6 p-4 border rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="track-name">Name</Label>
                  <Input
                    id="track-name"
                    placeholder="AI & Machine Learning"
                    value={trackData.name}
                    onChange={(e) => setTrackData({ ...trackData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="track-desc">Description</Label>
                  <Textarea
                    id="track-desc"
                    placeholder="Projects using AI/ML technologies..."
                    value={trackData.description}
                    onChange={(e) => setTrackData({ ...trackData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={createTrack.isPending}>
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
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {tracks.length === 0 ? (
              <p className="text-sm text-gray-600">No tracks yet</p>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => (
                  <div key={track.track_id} className="p-3 border rounded-lg">
                    <h4 className="font-semibold">{track.name}</h4>
                    <p className="text-sm text-gray-600">{track.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Judging Rubrics</CardTitle>
                <CardDescription>Define evaluation criteria</CardDescription>
              </div>
              {!showRubricForm && (
                <Button size="sm" onClick={() => setShowRubricForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rubric
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showRubricForm && (
              <form onSubmit={handleAddRubric} className="mb-6 p-4 border rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rubric-title">Title</Label>
                  <Input
                    id="rubric-title"
                    placeholder="Main Rubric"
                    value={rubricData.title}
                    onChange={(e) => setRubricData({ ...rubricData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rubric-criteria">Criteria (JSON)</Label>
                  <Textarea
                    id="rubric-criteria"
                    placeholder='{"innovation": {"weight": 30, "max": 10}, "execution": {"weight": 40, "max": 10}}'
                    value={rubricData.criteria_json}
                    onChange={(e) => setRubricData({ ...rubricData, criteria_json: e.target.value })}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Enter criteria as JSON with weights and max scores
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={createRubric.isPending}>
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
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {rubrics.length === 0 ? (
              <p className="text-sm text-gray-600">No rubrics yet</p>
            ) : (
              <div className="space-y-3">
                {rubrics.map((rubric) => (
                  <div key={rubric.rubric_id} className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">{rubric.title}</h4>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
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
