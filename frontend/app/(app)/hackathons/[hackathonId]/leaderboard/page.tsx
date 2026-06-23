"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useHackathon, useLeaderboard } from '@/hooks/use-api'
import { Trophy, Download, Loader2, Medal } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/api/judging'

export default function LeaderboardPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(params.hackathonId)

  const isLoading = hackathonLoading || leaderboardLoading

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

  const entries: LeaderboardEntry[] = leaderboard?.entries ?? []

  const exportToCSV = () => {
    const headers = ['Rank', 'Project', 'Team', 'Total Score', 'Average Score', 'Judges']
    const rows = entries.map((e) => [
      e.rank,
      e.project_title,
      e.team_name,
      e.total_score,
      e.average_score.toFixed(2),
      e.score_count,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${hackathon.name.replace(/\s+/g, '_')}_leaderboard.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#f59e0b'
    if (rank === 2) return '#9ca3af'
    if (rank === 3) return '#b45309'
    return 'var(--ink)'
  }

  const getMedalLabel = (rank: number) => {
    if (rank === 1) return '1st'
    if (rank === 2) return '2nd'
    if (rank === 3) return '3rd'
    return `${rank}th`
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8" style={{ color: '#f59e0b' }} />
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: 'Archivo, sans-serif', color: 'var(--ink)' }}
            >
              Leaderboard
            </h1>
            <p style={{ color: 'var(--ink)', opacity: 0.6 }}>{hackathon.name}</p>
          </div>
        </div>
        {entries.length > 0 && (
          <Button
            onClick={exportToCSV}
            variant="outline"
            style={{
              border: '2px solid var(--ink)',
              borderRadius: 0,
              background: 'transparent',
              color: 'var(--ink)',
              fontFamily: 'Archivo, sans-serif',
              fontWeight: 700,
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {leaderboard?.last_updated && (
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            color: 'var(--ink)',
            opacity: 0.4,
            marginBottom: '1.5rem',
          }}
        >
          Last updated: {new Date(leaderboard.last_updated).toLocaleString()}
        </p>
      )}

      {entries.length === 0 ? (
        <Card
          style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
        >
          <CardContent className="text-center py-12">
            <Trophy
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: 'var(--ink)', opacity: 0.2 }}
            />
            <p style={{ color: 'var(--ink)', opacity: 0.6 }}>
              No scores yet. Submissions need to be judged to appear on the leaderboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 podium */}
          {entries.length >= 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {entries.slice(0, 3).map((entry) => (
                <Card
                  key={entry.submission_id}
                  style={{
                    borderRadius: 0,
                    border: `2px solid ${getMedalColor(entry.rank)}`,
                    background: 'var(--cream)',
                  }}
                >
                  <CardContent className="text-center py-6">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: getMedalColor(entry.rank),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}
                    >
                      <Medal className="h-6 w-6" style={{ color: 'var(--cream)' }} />
                    </div>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: getMedalColor(entry.rank),
                        marginBottom: '4px',
                      }}
                    >
                      {getMedalLabel(entry.rank)} PLACE
                    </div>
                    <h3
                      style={{
                        fontFamily: 'Archivo, sans-serif',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        fontSize: '1rem',
                        marginBottom: '4px',
                      }}
                    >
                      {entry.project_title}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.85rem',
                        color: 'var(--ink)',
                        opacity: 0.6,
                        marginBottom: '12px',
                      }}
                    >
                      {entry.team_name}
                    </p>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: getMedalColor(entry.rank),
                      }}
                    >
                      {entry.average_score.toFixed(1)}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: 'var(--ink)',
                        opacity: 0.5,
                      }}
                    >
                      avg score
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Full leaderboard table */}
          <Card
            style={{ borderRadius: 0, border: '2px solid var(--ink)', background: 'var(--cream)' }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '2px solid var(--ink)' }}>
                  <TableHead
                    className="w-20"
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Rank
                  </TableHead>
                  <TableHead
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Project
                  </TableHead>
                  <TableHead
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Team
                  </TableHead>
                  <TableHead
                    className="text-right"
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Total
                  </TableHead>
                  <TableHead
                    className="text-right"
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Average
                  </TableHead>
                  <TableHead
                    className="text-right"
                    style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Judges
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow
                    key={entry.submission_id}
                    style={{
                      borderBottom: '1px solid var(--ink)',
                      background:
                        entry.rank <= 3
                          ? `${getMedalColor(entry.rank)}08`
                          : 'transparent',
                    }}
                  >
                    <TableCell>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: entry.rank <= 3 ? getMedalColor(entry.rank) : 'var(--ink)',
                        }}
                      >
                        #{entry.rank}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: 'Archivo, sans-serif',
                        fontWeight: 600,
                        color: 'var(--ink)',
                      }}
                    >
                      {entry.project_title}
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: 'var(--ink)',
                        opacity: 0.7,
                      }}
                    >
                      {entry.team_name}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        color: 'var(--ink)',
                      }}
                    >
                      {entry.total_score}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        color: entry.rank <= 3 ? getMedalColor(entry.rank) : 'var(--ink)',
                      }}
                    >
                      {entry.average_score.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--ink)',
                        opacity: 0.5,
                      }}
                    >
                      {entry.score_count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
