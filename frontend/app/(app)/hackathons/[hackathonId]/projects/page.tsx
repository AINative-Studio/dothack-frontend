"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useHackathon, useSubmissions } from '@/hooks/use-api'
import { useAuth } from '@/lib/auth/auth-context'
import { apiClient } from '@/lib/api/client'
import { Plus, ExternalLink, Loader2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import type { Team } from '@/lib/types'
import type { Submission } from '@/lib/api/submissions-backend'

interface Project {
  project_id: string
  hackathon_id: string
  team_id: string
  title: string
  one_liner?: string
  status: 'IDEA' | 'BUILDING' | 'SUBMITTED'
  repo_url?: string
  demo_url?: string
}

export default function ProjectsPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)

  // Projects via apiClient
  const { data: projectsData, isLoading: projectsLoading } = useQuery<{ projects: Project[] }>({
    queryKey: ['dothack', 'projects', params.hackathonId],
    queryFn: () =>
      apiClient<{ projects: Project[] }>(
        `/hackathons/${params.hackathonId}/projects`,
        { token: token ?? undefined }
      ),
    enabled: !!params.hackathonId,
  })

  // Teams for the team picker
  const { data: teamsData, isLoading: teamsLoading } = useQuery<{ teams: Team[] }>({
    queryKey: ['dothack', 'teams', params.hackathonId],
    queryFn: () =>
      apiClient<{ teams: Team[] }>(`/hackathons/${params.hackathonId}/teams`, {
        token: token ?? undefined,
      }),
    enabled: !!params.hackathonId,
  })

  // Submissions to show which projects have been submitted
  const { data: submissionsData } = useSubmissions({ hackathon_id: params.hackathonId })

  const createProject = useMutation({
    mutationFn: (data: Omit<Project, 'project_id' | 'hackathon_id'>) =>
      apiClient<Project>(`/hackathons/${params.hackathonId}/projects`, {
        method: 'POST',
        body: JSON.stringify(data),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'projects', params.hackathonId] })
    },
  })

  const updateProject = useMutation({
    mutationFn: ({
      projectId,
      status,
    }: {
      projectId: string
      status: Project['status']
    }) =>
      apiClient<Project>(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dothack', 'projects', params.hackathonId] })
    },
  })

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    team_id: '',
    title: '',
    one_liner: '',
    repo_url: '',
    demo_url: '',
    status: 'IDEA' as Project['status'],
  })

  const isLoading = hackathonLoading || projectsLoading || teamsLoading

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

  const projects = projectsData?.projects ?? []
  const teams = teamsData?.teams ?? []
  const submissions = submissionsData?.submissions ?? []

  // Build a lookup of team names
  const teamById = Object.fromEntries(teams.map((t) => [t.team_id, t]))

  // Check whether a project has a submission
  const submissionByTeam = Object.fromEntries(
    submissions.map((s) => [s.team_name, s])
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProject.mutateAsync({
        team_id: formData.team_id,
        title: formData.title,
        one_liner: formData.one_liner || undefined,
        repo_url: formData.repo_url || undefined,
        demo_url: formData.demo_url || undefined,
        status: formData.status,
      })
      toast.success('Project created successfully')
      setFormData({ team_id: '', title: '', one_liner: '', repo_url: '', demo_url: '', status: 'IDEA' })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error('Failed to create project', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handleStatusChange = async (projectId: string, status: Project['status']) => {
    try {
      await updateProject.mutateAsync({ projectId, status })
      toast.success('Project status updated')
    } catch (error) {
      console.error('Failed to update project:', error)
      toast.error('Failed to update project', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const getStatusStyle = (status: Project['status']) => {
    switch (status) {
      case 'IDEA':
        return { border: 'var(--ink)', color: 'var(--ink)', opacity: 0.5 }
      case 'BUILDING':
        return { border: 'var(--accent)', color: 'var(--accent)', opacity: 1 }
      case 'SUBMITTED':
        return { border: '#16a34a', color: '#16a34a', opacity: 1 }
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
            Projects
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.6 }}>{hackathon.name}</p>
        </div>
        {!showForm && (
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
            Create Project
          </Button>
        )}
      </div>

      {showForm && (
        <Card
          className="mb-8"
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
            <CardTitle style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}>
              Create Project
            </CardTitle>
            <CardDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
              Register a new project for your team
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label style={labelStyle}>Team</Label>
                <select
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  required
                  style={{ ...inputStyle, width: '100%', padding: '8px 12px' }}
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
                <Label style={labelStyle}>Project Title</Label>
                <Input
                  placeholder="AI-Powered Task Manager"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <Label style={labelStyle}>
                  One-liner <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                </Label>
                <Input
                  placeholder="Manage tasks smarter with AI"
                  value={formData.one_liner}
                  onChange={(e) => setFormData({ ...formData, one_liner: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <Label style={labelStyle}>
                  Repository URL <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://github.com/team/project"
                  value={formData.repo_url}
                  onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <Label style={labelStyle}>
                  Demo URL <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://demo.example.com"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={createProject.isPending}
                  style={{
                    background: 'var(--ink)',
                    color: 'var(--cream)',
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {createProject.isPending ? (
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
                  onClick={() => setShowForm(false)}
                  disabled={createProject.isPending}
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

      {projects.length === 0 ? (
        <Card
          style={{ borderRadius: 0, border: '2px dashed var(--ink)', background: 'var(--cream)' }}
        >
          <CardContent className="text-center py-12">
            <FolderOpen
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: 'var(--ink)', opacity: 0.3 }}
            />
            <p style={{ color: 'var(--ink)', opacity: 0.6, marginBottom: '1rem' }}>
              No projects yet
            </p>
            {!showForm && (
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
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const team = teamById[project.team_id]
            const statusStyle = getStatusStyle(project.status)

            return (
              <Card
                key={project.project_id}
                style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
              >
                <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle
                        style={{
                          fontFamily: 'Archivo, sans-serif',
                          color: 'var(--ink)',
                          fontSize: '1.05rem',
                        }}
                      >
                        {project.title}
                      </CardTitle>
                      {project.one_liner && (
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.85rem',
                            color: 'var(--ink)',
                            opacity: 0.6,
                            marginTop: '4px',
                          }}
                        >
                          {project.one_liner}
                        </p>
                      )}
                      {team && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            border: '2px solid var(--ink)',
                            color: 'var(--ink)',
                          }}
                        >
                          {team.name}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        border: `2px solid ${statusStyle.border}`,
                        color: statusStyle.color,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {project.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {(project.repo_url || project.demo_url) && (
                      <div className="flex gap-4">
                        {project.repo_url && (
                          <a
                            href={project.repo_url}
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
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
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
                      </div>
                    )}

                    <div style={{ paddingTop: '8px', borderTop: '1px solid var(--ink)' }}>
                      <Label
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'Archivo, sans-serif',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          opacity: 0.6,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        Update Status
                      </Label>
                      <div className="flex gap-2">
                        {(['IDEA', 'BUILDING', 'SUBMITTED'] as Project['status'][]).map((s) => {
                          const ss = getStatusStyle(s)
                          const isActive = project.status === s
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(project.project_id, s)}
                              disabled={updateProject.isPending || isActive}
                              style={{
                                padding: '3px 10px',
                                border: `2px solid ${ss.border}`,
                                borderRadius: 0,
                                background: isActive ? ss.border : 'transparent',
                                color: isActive ? 'var(--cream)' : ss.color,
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: isActive ? 'default' : 'pointer',
                                opacity: updateProject.isPending ? 0.5 : 1,
                              }}
                            >
                              {s}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
