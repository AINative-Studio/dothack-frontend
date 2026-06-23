"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useHackathon,
  useTeams,
  useCreateTeam,
  useTeam,
  useTracks,
} from '@/hooks/use-api'
import { Plus, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Team, TeamDetail, TeamMember } from '@/lib/api/hackathons-backend'

export default function TeamsPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)
  const { data: teamsData, isLoading: teamsLoading } = useTeams(params.hackathonId)
  const { data: tracksData, isLoading: tracksLoading } = useTracks(params.hackathonId)
  const createTeam = useCreateTeam()

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [teamData, setTeamData] = useState({ name: '', track_id: '', description: '' })

  const isLoading = hackathonLoading || teamsLoading || tracksLoading

  if (isLoading) {
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

  const teams = teamsData?.teams ?? []
  const tracks = tracksData?.tracks ?? []

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTeam.mutateAsync({
        hackathon_id: params.hackathonId,
        name: teamData.name,
        track_id: teamData.track_id || null,
        description: teamData.description || null,
      })
      toast.success('Team created successfully')
      setTeamData({ name: '', track_id: '', description: '' })
      setShowTeamForm(false)
    } catch (error) {
      console.error('Failed to create team:', error)
      toast.error('Failed to create team', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

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

  const getStatusColor = (status: Team['status']) => {
    switch (status) {
      case 'ACTIVE': return 'var(--accent)'
      case 'SUBMITTED': return '#16a34a'
      default: return 'var(--ink)'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}
          >
            Teams
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.6 }}>{hackathon.name}</p>
        </div>
        {!showTeamForm && (
          <Button
            onClick={() => setShowTeamForm(true)}
            style={{
              background: 'var(--ink)',
              color: 'var(--cream)',
              border: '2px solid var(--ink)',
              borderRadius: 0,
              fontFamily: 'Archivo, sans-serif',
              fontWeight: 700,
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      {showTeamForm && (
        <Card
          className="mb-8"
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
            <CardTitle style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}>
              Create Team
            </CardTitle>
            <CardDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
              Set up a new team for this hackathon
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label style={labelStyle}>Team Name</Label>
                <Input
                  placeholder="Team Awesome"
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              {tracks.length > 0 && (
                <div className="space-y-2">
                  <Label style={labelStyle}>
                    Track <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                  </Label>
                  <select
                    value={teamData.track_id}
                    onChange={(e) => setTeamData({ ...teamData, track_id: e.target.value })}
                    style={{ ...inputStyle, width: '100%', padding: '8px 12px' }}
                  >
                    <option value="">No track</option>
                    {tracks.map((track) => (
                      <option key={track.track_id} value={track.track_id}>
                        {track.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label style={labelStyle}>
                  Description <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                </Label>
                <Input
                  placeholder="What is this team building?"
                  value={teamData.description}
                  onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={createTeam.isPending}
                  style={{
                    background: 'var(--ink)',
                    color: 'var(--cream)',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {createTeam.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTeamForm(false)}
                  disabled={createTeam.isPending}
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
          </CardContent>
        </Card>
      )}

      {teams.length === 0 ? (
        <Card
          style={{ borderRadius: 0, border: '2px dashed var(--ink)', background: 'var(--cream)' }}
        >
          <CardContent className="text-center py-12">
            <Users
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: 'var(--ink)', opacity: 0.3 }}
            />
            <p style={{ color: 'var(--ink)', opacity: 0.6, marginBottom: '1rem' }}>
              No teams yet
            </p>
            {!showTeamForm && (
              <Button
                onClick={() => setShowTeamForm(true)}
                style={{
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  border: '2px solid var(--ink)',
                  borderRadius: 0,
                  fontFamily: 'Archivo, sans-serif',
                  fontWeight: 700,
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => {
            const track = team.track_id ? tracks.find((t) => t.track_id === team.track_id) : null
            const statusColor = getStatusColor(team.status)

            return (
              <TeamCard
                key={team.team_id}
                team={team}
                track={track ?? null}
                statusColor={statusColor}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function TeamCard({
  team,
  track,
  statusColor,
}: {
  team: Team
  track: { track_id: string; name: string } | null
  statusColor: string
}) {
  // useTeam returns TeamDetail which includes members[]
  const { data: teamDetail, isLoading } = useTeam(team.team_id)

  const members = teamDetail?.members ?? []

  return (
    <Card
      style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
    >
      <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle
              className="flex items-center gap-2"
              style={{
                fontFamily: 'Archivo, sans-serif',
                color: 'var(--ink)',
                fontSize: '1.05rem',
              }}
            >
              <Users className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              {team.name}
            </CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              {track && (
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    border: '2px solid var(--accent)',
                    color: 'var(--accent)',
                  }}
                >
                  {track.name}
                </span>
              )}
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  border: `2px solid ${statusColor}`,
                  color: statusColor,
                }}
              >
                {team.status}
              </span>
            </div>
          </div>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: 'var(--ink)',
              opacity: 0.5,
            }}
          >
            {teamDetail?.member_count ?? 0} member{(teamDetail?.member_count ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {team.description && (
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              color: 'var(--ink)',
              opacity: 0.7,
              marginBottom: '12px',
            }}
          >
            {team.description}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2
              className="h-4 w-4 animate-spin"
              style={{ color: 'var(--ink)', opacity: 0.4 }}
            />
          </div>
        ) : members.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--ink)', opacity: 0.4 }}>
            No members yet
          </p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.participant_id}
                className="flex items-center justify-between"
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--ink)',
                  background: 'rgba(0,0,0,0.02)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'var(--ink)',
                    fontWeight: 500,
                  }}
                >
                  {member.name}
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    border: `2px solid ${member.role === 'LEAD' ? 'var(--accent)' : 'var(--ink)'}`,
                    color: member.role === 'LEAD' ? 'var(--accent)' : 'var(--ink)',
                  }}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
