"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  useHackathon,
  useParticipants,
  useInviteJudges,
  useInvitations,
  useCreateInvitation,
} from '@/hooks/use-api'
import { Mail, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Participant } from '@/lib/api/hackathons-backend'
import type { InvitationRole } from '@/lib/api/hackathons-backend'

export default function ParticipantsPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)
  const { data: participantsData, isLoading: participantsLoading } = useParticipants(
    params.hackathonId
  )
  const { data: invitationsData, isLoading: invitationsLoading } = useInvitations(
    params.hackathonId
  )

  const inviteJudges = useInviteJudges()
  const createInvitation = useCreateInvitation(params.hackathonId)

  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState<InvitationRole>('JUDGE')
  const [roleFilter, setRoleFilter] = useState<Participant['role'] | 'ALL'>('ALL')

  if (hackathonLoading || participantsLoading || invitationsLoading) {
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

  const allParticipants = participantsData?.participants ?? []
  const invitations = invitationsData?.invitations ?? []

  const filteredParticipants =
    roleFilter === 'ALL'
      ? allParticipants
      : allParticipants.filter((p) => p.role === roleFilter)

  const counts = {
    ALL: allParticipants.length,
    BUILDER: allParticipants.filter((p) => p.role === 'BUILDER').length,
    JUDGE: allParticipants.filter((p) => p.role === 'JUDGE').length,
    MENTOR: allParticipants.filter((p) => p.role === 'MENTOR').length,
    ORGANIZER: allParticipants.filter((p) => p.role === 'ORGANIZER').length,
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    const emails = inviteEmails
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter(Boolean)

    if (emails.length === 0) {
      toast.error('Please enter at least one email address')
      return
    }

    try {
      // Use createInvitation which supports multiple emails and roles
      await createInvitation.mutateAsync({ emails, role: inviteRole })
      toast.success(
        `Invitation sent to ${emails.length} ${inviteRole.toLowerCase()}${emails.length !== 1 ? 's' : ''}`
      )
      setInviteEmails('')
      setInviteRole('JUDGE')
      setShowInviteDialog(false)
    } catch (error) {
      console.error('Failed to send invitation:', error)
      toast.error('Failed to send invitation', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const getRoleStyle = (role: string) => {
    const map: Record<string, string> = {
      ORGANIZER: 'var(--accent)',
      JUDGE: '#7c3aed',
      MENTOR: '#059669',
      BUILDER: 'var(--ink)',
    }
    return map[role] ?? 'var(--ink)'
  }

  const getInvitationStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return '#d97706'
      case 'ACCEPTED': return '#16a34a'
      case 'DECLINED': return '#dc2626'
      case 'EXPIRED': return '#6b7280'
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
            Participants
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.6 }}>{hackathon.name}</p>
        </div>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button
              style={{
                background: 'var(--ink)',
                color: 'var(--cream)',
                border: '2px solid var(--ink)',
                borderRadius: 0,
                fontFamily: 'Archivo, sans-serif',
                fontWeight: 700,
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </DialogTrigger>
          <DialogContent
            style={{
              borderRadius: 0,
              border: '2px solid var(--ink)',
              background: 'var(--cream)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}>
                Send Invitations
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
                Invite judges, mentors, or builders. Separate multiple emails with commas or
                newlines.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendInvitation} className="space-y-4 mt-2">
              <div>
                <Label
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Role
                </Label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as InvitationRole)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    background: 'var(--cream)',
                    color: 'var(--ink)',
                    fontFamily: 'Inter, sans-serif',
                    marginTop: '6px',
                  }}
                >
                  <option value="JUDGE">Judge</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="BUILDER">Builder</option>
                </select>
              </div>
              <div>
                <Label
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Email Addresses
                </Label>
                <textarea
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder={'judge@example.com\nanother@example.com'}
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    background: 'var(--cream)',
                    color: 'var(--ink)',
                    fontFamily: 'Inter, sans-serif',
                    marginTop: '6px',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                  style={{
                    flex: 1,
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    background: 'transparent',
                    color: 'var(--ink)',
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                  }}
                  disabled={createInvitation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'var(--ink)',
                    color: 'var(--cream)',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                  }}
                  disabled={createInvitation.isPending}
                >
                  {createInvitation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invitations'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role filter stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {(
          [
            { label: 'Total', role: 'ALL' as const },
            { label: 'Builders', role: 'BUILDER' as Participant['role'] },
            { label: 'Judges', role: 'JUDGE' as Participant['role'] },
            { label: 'Mentors', role: 'MENTOR' as Participant['role'] },
            { label: 'Organizers', role: 'ORGANIZER' as Participant['role'] },
          ] as Array<{ label: string; role: Participant['role'] | 'ALL' }>
        ).map(({ label, role }) => {
          const isActive = roleFilter === role
          const count = counts[role as keyof typeof counts] ?? 0
          return (
            <button
              key={label}
              onClick={() => setRoleFilter(role)}
              style={{
                border: `2px solid ${isActive ? 'var(--accent)' : 'var(--ink)'}`,
                background: isActive ? 'var(--ink)' : 'var(--cream)',
                color: isActive ? 'var(--cream)' : 'var(--ink)',
                padding: '12px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: 0,
              }}
            >
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {count}
              </div>
              <div
                style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: '0.75rem',
                  opacity: 0.7,
                  marginTop: '4px',
                }}
              >
                {label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Participants table */}
      {filteredParticipants.length === 0 ? (
        <Card
          className="mb-6"
          style={{
            borderRadius: 0,
            border: '2px dashed var(--ink)',
            background: 'var(--cream)',
          }}
        >
          <CardContent className="text-center py-12">
            <Users
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: 'var(--ink)', opacity: 0.3 }}
            />
            <p style={{ color: 'var(--ink)', opacity: 0.6 }}>
              {roleFilter === 'ALL'
                ? 'No participants yet'
                : `No ${roleFilter.toLowerCase()}s yet`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="mb-6"
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: '2px solid var(--ink)' }}>
                <TableHead
                  style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                >
                  Name
                </TableHead>
                <TableHead
                  style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                >
                  Handle
                </TableHead>
                <TableHead
                  style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                >
                  Role
                </TableHead>
                <TableHead
                  style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                >
                  Team
                </TableHead>
                <TableHead
                  style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                >
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((p) => {
                const roleColor = getRoleStyle(p.role)
                return (
                  <TableRow
                    key={p.participant_id}
                    style={{ borderBottom: '1px solid var(--ink)' }}
                  >
                    <TableCell
                      style={{
                        fontFamily: 'Archivo, sans-serif',
                        fontWeight: 600,
                        color: 'var(--ink)',
                      }}
                    >
                      {p.name}
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.8rem',
                        color: 'var(--ink)',
                        opacity: 0.6,
                      }}
                    >
                      @{p.handle}
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          border: `2px solid ${roleColor}`,
                          color: roleColor,
                        }}
                      >
                        {p.role}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.875rem',
                        color: 'var(--ink)',
                        opacity: 0.7,
                      }}
                    >
                      {p.team ?? '—'}
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.75rem',
                        color: 'var(--ink)',
                        opacity: 0.5,
                      }}
                    >
                      {new Date(p.joined_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Invitations table */}
      {invitations.length > 0 && (
        <>
          <h2
            style={{
              fontFamily: 'Archivo, sans-serif',
              fontWeight: 700,
              color: 'var(--ink)',
              fontSize: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            Pending Invitations
            <span
              style={{
                marginLeft: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                padding: '2px 8px',
                border: '2px solid var(--ink)',
                color: 'var(--ink)',
              }}
            >
              {invitations.length}
            </span>
          </h2>
          <Card
            style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '2px solid var(--ink)' }}>
                  <TableHead
                    style={{
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                      color: 'var(--ink)',
                    }}
                  >
                    Email
                  </TableHead>
                  <TableHead
                    style={{
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                      color: 'var(--ink)',
                    }}
                  >
                    Role
                  </TableHead>
                  <TableHead
                    style={{
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                      color: 'var(--ink)',
                    }}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    style={{
                      fontFamily: 'Archivo, sans-serif',
                      fontWeight: 700,
                      color: 'var(--ink)',
                    }}
                  >
                    Expires
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => {
                  const roleColor = getRoleStyle(inv.role)
                  const statusColor = getInvitationStatusStyle(inv.status)
                  return (
                    <TableRow
                      key={inv.invitation_id}
                      style={{ borderBottom: '1px solid var(--ink)' }}
                    >
                      <TableCell
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.875rem',
                          color: 'var(--ink)',
                        }}
                      >
                        {inv.email}
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            border: `2px solid ${roleColor}`,
                            color: roleColor,
                          }}
                        >
                          {inv.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: statusColor,
                          }}
                        >
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.75rem',
                          color: 'var(--ink)',
                          opacity: 0.5,
                        }}
                      >
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
