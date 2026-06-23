"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useHackathon } from '@/hooks/use-api'
import { useAuth } from '@/lib/auth/auth-context'
import { apiClient } from '@/lib/api/client'
import { Plus, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Team, Track } from '@/lib/types'
import type { Participant } from '@/lib/api/hackathons-backend'

export default function TeamsPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)

  // Teams via apiClient
  const { data: teamsData, isLoading: teamsLoading } = useQuery<{ teams: Team[] }>({
    queryKey: ['dothack', 'teams', params.hackathonId],
    queryFn: () =>
      apiClient<{ teams: Team[] }>(`/hackathons/${params.hackathonId}/teams`, {
        token: token ?? undefined,
      }),
    enabled: !!params.hackathonId,
  })

  // Tracks via apiClient
  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ['dothack', 'tracks', params.hackathonId],
    queryFn: () =>
      apiClient<Track[]>(`/hackathons/${params.hackathonId}/tracks`, {
        token: token ?? undefined,
      }),
    enabled: !!params.hackathonId,
  })

  // Participants for the member picker
  const { data: participantsData, isLoading: participantsLoading } = useQuery<{
    participants: Participant[]
  }>({
    queryKey: ['dothack', 'participants', params.hackathonId],
    queryFn: () =>
      apiClient<{ participants: Participant[] }>(
        `/hackathons/${params.hackathonId}/participants`,
        { token: token ?? undefined }
      ),
    enabled: !!params.hackathonId,
  })

  const createTeam = useMutation({
    mutationFn: (data: { name: string; track_id?: string }) =>
      apiClient<Team>(`/hackathons/${params.hackathonId}/teams`, {
        method: 'POST',
        body: JSON.stringify(data),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'teams', params.hackathonId] })
    },
  })

  const addMember = useMutation({
    mutationFn: ({
      teamId,
      participantId,
      role,
    }: {
      teamId: string
      participantId: string
      role: 'LEAD' | 'MEMBER'
    }) =>
      apiClient(`/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify({ participant_id: participantId, role }),
        token: token!,
      }),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'team-members', teamId] })
    },
  })

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [teamData, setTeamData] = useState({ name: '', track_id: '' })
  const [showMemberForm, setShowMemberForm] = useState<string | null>(null)
  const [memberData, setMemberData] = useState({
    participant_id: '',
    role: 'MEMBER' as 'LEAD' | 'MEMBER',
  })

  const isLoading = hackathonLoading || teamsLoading || tracksLoading || participantsLoading

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
  const participants = participantsData?.participants ?? []

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTeam.mutateAsync({
        name: teamData.name,
        track_id: teamData.track_id || undefined,
      })
      toast.success('Team created successfully')
      setTeamData({ name: '', track_id: '' })
      setShowTeamForm(false)
    } catch (error) {
      console.error('Failed to create team:', error)
      toast.error('Failed to create team', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showMemberForm) return
    try {
      await addMember.mutateAsync({
        teamId: showMemberForm,
        participantId: memberData.participant_id,
        role: memberData.role,
      })
      toast.success('Member added successfully')
      setMemberData({ participant_id: '', role: 'MEMBER' })
      setShowMemberForm(null)
    } catch (error) {
      console.error('Failed to add member:', error)
      toast.error('Failed to add member', {
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
            <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--ink)', opacity: 0.3 }} />
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
            const isAddingMember = showMemberForm === team.team_id

            return (
              <Card
                key={team.team_id}
                style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
              >
                <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle
                        className="flex items-center gap-2"
                        style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)', fontSize: '1.05rem' }}
                      >
                        <Users className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                        {team.name}
                      </CardTitle>
                      {track && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '8px',
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
                    </div>
                    {!isAddingMember && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowMemberForm(team.team_id)}
                        style={{
                          border: '2px solid var(--ink)',
                          borderRadius: 0,
                          background: 'transparent',
                          color: 'var(--ink)',
                          fontFamily: 'Archivo, sans-serif',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Member
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {isAddingMember && (
                    <form
                      onSubmit={handleAddMember}
                      className="mb-4 space-y-3"
                      style={{ padding: '12px', border: '1px solid var(--ink)' }}
                    >
                      <div className="space-y-2">
                        <Label style={{ ...labelStyle, fontSize: '0.8rem' }}>Participant</Label>
                        <select
                          value={memberData.participant_id}
                          onChange={(e) =>
                            setMemberData({ ...memberData, participant_id: e.target.value })
                          }
                          required
                          style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                          <option value="">Select participant</option>
                          {participants
                            .filter((p) => p.role === 'BUILDER')
                            .map((p) => (
                              <option key={p.participant_id} value={p.participant_id}>
                                {p.name} (@{p.handle})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label style={{ ...labelStyle, fontSize: '0.8rem' }}>Role</Label>
                        <select
                          value={memberData.role}
                          onChange={(e) =>
                            setMemberData({
                              ...memberData,
                              role: e.target.value as 'LEAD' | 'MEMBER',
                            })
                          }
                          style={{ ...inputStyle, width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                          <option value="LEAD">Lead</option>
                          <option value="MEMBER">Member</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={addMember.isPending}
                          style={{
                            background: 'var(--ink)',
                            color: 'var(--cream)',
                            border: '2px solid var(--ink)',
                            borderRadius: 0,
                            fontFamily: 'Archivo, sans-serif',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          {addMember.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Add'
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setShowMemberForm(null)}
                          disabled={addMember.isPending}
                          style={{
                            border: '2px solid var(--ink)',
                            borderRadius: 0,
                            background: 'transparent',
                            color: 'var(--ink)',
                            fontFamily: 'Archivo, sans-serif',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  <TeamMembers teamId={team.team_id} token={token} participants={participants} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TeamMembers({
  teamId,
  token,
  participants,
}: {
  teamId: string
  token: string | null
  participants: Participant[]
}) {
  const { data: membersData, isLoading } = useQuery<{
    members: Array<{ participant_id: string; role: 'LEAD' | 'MEMBER' }>
  }>({
    queryKey: ['dothack', 'team-members', teamId],
    queryFn: () =>
      apiClient<{ members: Array<{ participant_id: string; role: 'LEAD' | 'MEMBER' }> }>(
        `/teams/${teamId}/members`,
        { token: token ?? undefined }
      ),
    enabled: !!teamId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--ink)', opacity: 0.4 }} />
      </div>
    )
  }

  const members = membersData?.members ?? []

  if (members.length === 0) {
    return (
      <p style={{ fontSize: '0.875rem', color: 'var(--ink)', opacity: 0.5 }}>
        No members yet
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const participant = participants.find((p) => p.participant_id === member.participant_id)
        return (
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
              }}
            >
              {participant?.name ?? member.participant_id}
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
        )
      })}
    </div>
  )
}
