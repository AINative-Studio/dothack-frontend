"use client"

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useHackathon, useParticipants, useInviteJudges } from '@/hooks/use-api'
import { useAuth } from '@/lib/auth/auth-context'
import { apiClient } from '@/lib/api/client'
import { Plus, Mail, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Participant } from '@/lib/api/hackathons-backend'

export default function ParticipantsPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)
  const { data: participantsData, isLoading: participantsLoading } = useParticipants(params.hackathonId)
  const inviteJudges = useInviteJudges()

  // Invite dialog state — uses useInviteJudges (emails-based bulk invite)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [roleFilter, setRoleFilter] = useState<Participant['role'] | 'ALL'>('ALL')

  if (hackathonLoading || participantsLoading) {
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

  const filteredParticipants =
    roleFilter === 'ALL'
      ? allParticipants
      : allParticipants.filter((p) => p.role === roleFilter)

  const judges = allParticipants.filter((p) => p.role === 'JUDGE')
  const builders = allParticipants.filter((p) => p.role === 'BUILDER')
  const mentors = allParticipants.filter((p) => p.role === 'MENTOR')
  const organizers = allParticipants.filter((p) => p.role === 'ORGANIZER')

  const handleInviteJudge = async (e: React.FormEvent) => {
    e.preventDefault()
    const emails = inviteEmail
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    if (emails.length === 0) {
      toast.error('Please enter at least one email address')
      return
    }

    try {
      await inviteJudges.mutateAsync({ hackathonId: params.hackathonId, emails })
      toast.success(`Invitation sent to ${emails.length} judge${emails.length !== 1 ? 's' : ''}`)
      setInviteEmail('')
      setShowInviteDialog(false)
    } catch (error) {
      console.error('Failed to send invitation:', error)
      toast.error('Failed to send invitation', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    const colors: Record<string, { border: string; color: string }> = {
      ORGANIZER: { border: 'var(--accent)', color: 'var(--accent)' },
      JUDGE: { border: '#7c3aed', color: '#7c3aed' },
      MENTOR: { border: '#059669', color: '#059669' },
      BUILDER: { border: 'var(--ink)', color: 'var(--ink)' },
    }
    return colors[role] ?? { border: 'var(--ink)', color: 'var(--ink)' }
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
              Invite Judges
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
                Invite Judges
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
                Send judge invitations by email. Separate multiple emails with commas.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteJudge} className="space-y-4 mt-2">
              <div>
                <Label
                  style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                >
                  Email Address(es)
                </Label>
                <Textarea
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="judge@example.com, another@example.com"
                  rows={3}
                  required
                  style={{
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    background: 'var(--cream)',
                    color: 'var(--ink)',
                    fontFamily: 'Inter, sans-serif',
                    marginTop: '6px',
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
                  disabled={inviteJudges.isPending}
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
                  disabled={inviteJudges.isPending}
                >
                  {inviteJudges.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invites'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', count: allParticipants.length, role: 'ALL' as const },
          { label: 'Builders', count: builders.length, role: 'BUILDER' as const },
          { label: 'Judges', count: judges.length, role: 'JUDGE' as const },
          { label: 'Mentors', count: mentors.length, role: 'MENTOR' as const },
        ].map(({ label, count, role }) => (
          <button
            key={label}
            onClick={() => setRoleFilter(role)}
            style={{
              border: `2px solid ${roleFilter === role ? 'var(--accent)' : 'var(--ink)'}`,
              background: roleFilter === role ? 'var(--ink)' : 'var(--cream)',
              color: roleFilter === role ? 'var(--cream)' : 'var(--ink)',
              padding: '12px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: 0,
              transition: 'all 0.1s',
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
        ))}
      </div>

      {/* Participants table */}
      {filteredParticipants.length === 0 ? (
        <Card
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
              {roleFilter === 'ALL' ? 'No participants yet' : `No ${roleFilter.toLowerCase()}s yet`}
            </p>
            {roleFilter === 'JUDGE' && (
              <Button
                onClick={() => setShowInviteDialog(true)}
                style={{
                  marginTop: '1rem',
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  border: '2px solid var(--ink)',
                  borderRadius: 0,
                  fontFamily: 'Archivo, sans-serif',
                  fontWeight: 700,
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Invite Judges
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
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
                  Name
                </TableHead>
                <TableHead
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Handle
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
                  Team
                </TableHead>
                <TableHead
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((p) => {
                const roleStyle = getRoleBadgeStyle(p.role)
                return (
                  <TableRow
                    key={p.participant_id}
                    style={{ borderBottom: '1px solid var(--ink)', opacity: 0.9 }}
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
                        opacity: 0.7,
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
                          border: `2px solid ${roleStyle.border}`,
                          color: roleStyle.color,
                          whiteSpace: 'nowrap',
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
    </div>
  )
}
