"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useHackathon, useSubmissions } from '@/hooks/use-api'
import { useAuth } from '@/lib/auth/auth-context'
import { apiClient } from '@/lib/api/client'
import { Plus, Search, AlertCircle, Loader2, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { Submission } from '@/lib/api/submissions-backend'
import type { Team } from '@/lib/types'

export default function SubmissionsPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)

  const { data: submissionsData, isLoading: submissionsLoading } = useSubmissions({
    hackathon_id: params.hackathonId,
  })

  // Teams via apiClient — no dedicated hook in use-api.ts yet
  const { data: teamsData, isLoading: teamsLoading } = useQuery<{ teams: Team[] }>({
    queryKey: ['dothack', 'teams', params.hackathonId],
    queryFn: () =>
      apiClient<{ teams: Team[] }>(
        `/hackathons/${params.hackathonId}/teams`,
        { token: token ?? undefined }
      ),
    enabled: !!params.hackathonId,
  })

  // Submit a new submission via the backend API
  const createSubmission = useMutation({
    mutationFn: (data: {
      team_id: string
      description: string
      repository_url?: string
      demo_url?: string
      video_url?: string
    }) =>
      apiClient<Submission>(`/hackathons/${params.hackathonId}/submissions`, {
        method: 'POST',
        body: JSON.stringify(data),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'submissions'] })
    },
  })

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    team_id: '',
    description: '',
    repository_url: '',
    demo_url: '',
    video_url: '',
  })
  const [searchQuery, setSearchQuery] = useState('')

  const isLoading = hackathonLoading || submissionsLoading || teamsLoading

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

  const submissions = submissionsData?.submissions ?? []
  const teams = teamsData?.teams ?? []
  const isClosed = hackathon.status === 'completed' || hackathon.status === 'cancelled'

  const filteredSubmissions = searchQuery
    ? submissions.filter(
        (s) =>
          s.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : submissions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isClosed) return

    try {
      await createSubmission.mutateAsync({
        team_id: formData.team_id,
        description: formData.description,
        repository_url: formData.repository_url || undefined,
        demo_url: formData.demo_url || undefined,
        video_url: formData.video_url || undefined,
      })
      toast.success('Submission created successfully')
      setFormData({ team_id: '', description: '', repository_url: '', demo_url: '', video_url: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to submit:', error)
      toast.error('Failed to create submission', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const getStatusColor = (status: Submission['status']) => {
    switch (status) {
      case 'SUBMITTED': return 'var(--accent)'
      case 'SCORED': return '#16a34a'
      default: return '#6b7280'
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
            Submissions
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.6 }}>{hackathon.name}</p>
        </div>
        {!showForm && !isClosed && (
          <Button
            onClick={() => setShowForm(true)}
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
            New Submission
          </Button>
        )}
      </div>

      {isClosed && (
        <Alert
          className="mb-8"
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription style={{ color: 'var(--ink)' }}>
            This hackathon is closed. Submissions are no longer accepted.
          </AlertDescription>
        </Alert>
      )}

      {showForm && !isClosed && (
        <Card
          className="mb-8"
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
            <CardTitle style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}>
              Submit Project
            </CardTitle>
            <CardDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
              Submit your team's work for judging
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                >
                  Team
                </Label>
                <select
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    background: 'var(--cream)',
                    color: 'var(--ink)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.team_id} value={team.team_id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                >
                  Project Description
                </Label>
                <Textarea
                  placeholder="Describe your project, what you built, challenges faced, and outcomes..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Repository URL <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://github.com/team/project"
                  value={formData.repository_url}
                  onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
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
                  Demo URL <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://demo.example.com"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
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
                  Video URL <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  style={{
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    background: 'var(--cream)',
                    color: 'var(--ink)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={createSubmission.isPending}
                  style={{
                    background: 'var(--ink)',
                    color: 'var(--cream)',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {createSubmission.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={createSubmission.isPending}
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

      <div
        className="relative mb-6"
        style={{ border: '2px solid var(--ink)', background: 'var(--cream)' }}
      >
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: 'var(--ink)', opacity: 0.5 }}
        />
        <Input
          placeholder="Search by project name, team, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{
            background: 'transparent',
            color: 'var(--ink)',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>

      {filteredSubmissions.length === 0 ? (
        <Card
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardContent className="text-center py-12">
            <FileText
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: 'var(--ink)', opacity: 0.3 }}
            />
            <p style={{ color: 'var(--ink)', opacity: 0.6, marginBottom: '1rem' }}>
              {searchQuery ? 'No submissions match your search' : 'No submissions yet'}
            </p>
            {!showForm && !isClosed && !searchQuery && (
              <Button
                onClick={() => setShowForm(true)}
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
                Submit First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card
              key={submission.submission_id}
              style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
            >
              <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle
                      style={{
                        fontFamily: 'Archivo, sans-serif',
                        color: 'var(--ink)',
                        fontSize: '1.1rem',
                      }}
                    >
                      {submission.project_name}
                    </CardTitle>
                    <div className="flex gap-2 mt-2 flex-wrap items-center">
                      <Badge
                        variant="outline"
                        style={{
                          borderRadius: 0,
                          border: '2px solid var(--ink)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.7rem',
                          color: 'var(--ink)',
                        }}
                      >
                        {submission.team_name}
                      </Badge>
                      {submission.track && (
                        <Badge
                          variant="outline"
                          style={{
                            borderRadius: 0,
                            border: '2px solid var(--accent)',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.7rem',
                            color: 'var(--accent)',
                          }}
                        >
                          {submission.track}
                        </Badge>
                      )}
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.7rem',
                          color: getStatusColor(submission.status),
                          fontWeight: 700,
                        }}
                      >
                        {submission.status}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.7rem',
                      color: 'var(--ink)',
                      opacity: 0.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p
                  style={{
                    color: 'var(--ink)',
                    opacity: 0.8,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    marginBottom: submission.repository_url || submission.demo_url || submission.video_url ? '1rem' : 0,
                  }}
                >
                  {submission.description}
                </p>
                {(submission.repository_url || submission.demo_url || submission.video_url) && (
                  <div className="flex gap-4 flex-wrap">
                    {submission.repository_url && (
                      <a
                        href={submission.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                        style={{
                          color: 'var(--accent)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Repository
                      </a>
                    )}
                    {submission.demo_url && (
                      <a
                        href={submission.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                        style={{
                          color: 'var(--accent)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Demo
                      </a>
                    )}
                    {submission.video_url && (
                      <a
                        href={submission.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                        style={{
                          color: 'var(--accent)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Video
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
