"use client"

import { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  useHackathon,
  useSubmissions,
  useTeams,
  useCreateSubmission,
  useUploadFile,
  useDeleteFile,
} from '@/hooks/use-api'
import { Plus, Search, AlertCircle, Loader2, FileText, ExternalLink, Upload, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { Submission } from '@/lib/api/submissions-backend'
import { downloadFile } from '@/lib/api/hackathons-backend'
import { useAuth } from '@/lib/auth/auth-context'

// ---------------------------------------------------------------------------
// File upload zone — rendered inside a submission's expanded detail view
// ---------------------------------------------------------------------------

function FileUploadZone({ submissionId }: { submissionId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadFile = useUploadFile()
  const deleteFileMutation = useDeleteFile()
  const { token } = useAuth()

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      try {
        await uploadFile.mutateAsync({ submissionId, file })
        toast.success(`Uploaded ${file.name}`)
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  async function handleDownload(fileId: string, fileName: string) {
    try {
      const blob = await downloadFile(fileId, token ?? undefined)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  async function handleDelete(fileId: string) {
    try {
      await deleteFileMutation.mutateAsync(fileId)
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete file')
    }
  }

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <p
        style={{
          fontFamily: 'Archivo, sans-serif',
          fontWeight: 700,
          color: 'var(--ink)',
          fontSize: '0.875rem',
          marginBottom: '0.5rem',
        }}
      >
        Files
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '1.5px dashed #c9c2b1',
          padding: '1.25rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'var(--cream)',
          marginBottom: '0.75rem',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ink)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#c9c2b1'
        }}
      >
        <Upload
          className="mx-auto mb-2"
          style={{ color: 'var(--ink)', opacity: 0.4, width: '1.25rem', height: '1.25rem' }}
        />
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: 'var(--ink)',
            opacity: 0.6,
          }}
        >
          Drop files here or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload button */}
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={uploadFile.isPending}
        style={{
          background: 'var(--accent)',
          color: 'var(--cream)',
          border: '2px solid var(--accent)',
          borderRadius: 0,
          fontFamily: 'Archivo, sans-serif',
          fontWeight: 700,
          fontSize: '0.8rem',
          marginBottom: '0.75rem',
        }}
      >
        {uploadFile.isPending ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-3 w-3 mr-1" />
            Upload File
          </>
        )}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// File list — shown for a submission that already has files
// ---------------------------------------------------------------------------

interface FileListProps {
  files: Array<{ file_id: string; file_name: string; file_url?: string; file_size?: number }>
  submissionId: string
}

function FileList({ files, submissionId }: FileListProps) {
  const deleteFileMutation = useDeleteFile()
  const { token } = useAuth()

  if (files.length === 0) return null

  async function handleDownload(fileId: string, fileName: string) {
    try {
      const blob = await downloadFile(fileId, token ?? undefined)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  async function handleDelete(fileId: string) {
    try {
      await deleteFileMutation.mutateAsync(fileId)
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete file')
    }
  }

  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {files.map((f) => (
        <div
          key={f.file_id}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.3rem 0.6rem',
            border: '2px solid var(--ink)',
            background: 'var(--cream)',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: 'var(--ink)',
              maxWidth: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={f.file_name}
          >
            {f.file_name}
          </span>
          <button
            onClick={() => handleDownload(f.file_id, f.file_name)}
            title="Download"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0.125rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--ink)',
              opacity: 0.6,
            }}
          >
            <Download style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
          <button
            onClick={() => handleDelete(f.file_id)}
            disabled={deleteFileMutation.isPending}
            title="Delete"
            style={{
              background: 'none',
              border: 'none',
              cursor: deleteFileMutation.isPending ? 'not-allowed' : 'pointer',
              padding: '0 0.125rem',
              display: 'flex',
              alignItems: 'center',
              color: '#ff4d23',
              opacity: deleteFileMutation.isPending ? 0.4 : 0.8,
            }}
          >
            <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SubmissionsPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)

  const { data: submissionsData, isLoading: submissionsLoading } = useSubmissions({
    hackathon_id: params.hackathonId,
  })

  const { data: teamsData, isLoading: teamsLoading } = useTeams(params.hackathonId)

  const createSubmission = useCreateSubmission()

  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    team_id: '',
    project_name: '',
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
      const created = await createSubmission.mutateAsync({
        hackathon_id: params.hackathonId,
        team_id: formData.team_id,
        project_name: formData.project_name,
        description: formData.description,
        repository_url: formData.repository_url || null,
        demo_url: formData.demo_url || null,
        video_url: formData.video_url || null,
      })
      toast.success('Submission created successfully')
      setFormData({ team_id: '', project_name: '', description: '', repository_url: '', demo_url: '', video_url: '' })
      setShowForm(false)
      // Auto-expand to allow file upload
      if (created?.submission_id) setExpandedId(created.submission_id)
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
                  Project Name
                </Label>
                <Input
                  placeholder="My Awesome Project"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
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
          {filteredSubmissions.map((submission) => {
            const isExpanded = expandedId === submission.submission_id
            const files: Array<{ file_id: string; file_name: string; file_url?: string }> =
              (submission as any).files ?? []

            return (
              <Card
                key={submission.submission_id}
                style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
              >
                <CardHeader style={{ borderBottom: '2px solid var(--ink)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div style={{ flex: 1 }}>
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : submission.submission_id)
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        <CardTitle
                          style={{
                            fontFamily: 'Archivo, sans-serif',
                            color: 'var(--ink)',
                            fontSize: '1.1rem',
                          }}
                        >
                          {submission.project_name}
                        </CardTitle>
                      </button>
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
                        {files.length > 0 && (
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '0.65rem',
                              color: 'var(--ink)',
                              opacity: 0.5,
                            }}
                          >
                            {files.length} file{files.length !== 1 ? 's' : ''}
                          </span>
                        )}
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
                      marginBottom:
                        submission.repository_url || submission.demo_url || submission.video_url
                          ? '1rem'
                          : 0,
                    }}
                  >
                    {submission.description}
                  </p>

                  {(submission.repository_url || submission.demo_url || submission.video_url) && (
                    <div className="flex gap-4 flex-wrap" style={{ marginBottom: isExpanded ? '0.5rem' : 0 }}>
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

                  {/* Existing files */}
                  {files.length > 0 && (
                    <FileList files={files} submissionId={submission.submission_id} />
                  )}

                  {/* Expand/collapse toggle for file upload */}
                  {!isClosed && (
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : submission.submission_id)
                      }
                      style={{
                        marginTop: '0.875rem',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.7rem',
                        color: 'var(--ink)',
                        opacity: 0.5,
                        textDecoration: 'underline',
                      }}
                    >
                      {isExpanded ? 'Hide file upload' : 'Add files'}
                    </button>
                  )}

                  {/* File upload zone — only visible when expanded */}
                  {isExpanded && !isClosed && (
                    <FileUploadZone submissionId={submission.submission_id} />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
