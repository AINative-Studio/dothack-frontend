"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useHackathon, usePrizes, useCreatePrize } from '@/hooks/use-api'
import { Trophy, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PrizesPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(params.hackathonId)
  const { data: prizesData, isLoading: prizesLoading } = usePrizes(params.hackathonId)
  const createPrize = useCreatePrize()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    currency: 'USD',
    rank: 1,
    sponsor: '',
  })

  const prizes = prizesData?.prizes ?? []
  const sortedPrizes = [...prizes].sort((a, b) => a.rank - b.rank)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPrize.mutateAsync({
        hackathonId: params.hackathonId,
        data: {
          title: formData.title,
          description: formData.description,
          amount: formData.amount,
          currency: formData.currency,
          rank: formData.rank,
          sponsor: formData.sponsor || undefined,
        },
      })
      toast.success('Prize created successfully')
      setFormData({ title: '', description: '', amount: 0, currency: 'USD', rank: 1, sponsor: '' })
      setOpen(false)
    } catch (error) {
      console.error('Failed to create prize:', error)
      toast.error('Failed to create prize', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  if (hackathonLoading || prizesLoading) {
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

  const getRankAccentColor = (rank: number) => {
    if (rank === 1) return '#f59e0b'
    if (rank === 2) return '#9ca3af'
    if (rank === 3) return '#b45309'
    return 'var(--accent)'
  }

  const getRankLabel = (rank: number) => {
    if (rank === 1) return '1st Place'
    if (rank === 2) return '2nd Place'
    if (rank === 3) return '3rd Place'
    return `${rank}th Place`
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
            Prizes
          </h1>
          <p style={{ color: 'var(--ink)', opacity: 0.6 }}>{hackathon.name}</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
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
              <Plus className="h-4 w-4 mr-2" />
              Add Prize
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
                Add New Prize
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--ink)', opacity: 0.6 }}>
                Create a new prize for this hackathon
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label style={labelStyle}>Prize Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Grand Prize"
                  required
                  style={{ ...inputStyle, marginTop: '6px' }}
                />
              </div>
              <div>
                <Label style={labelStyle}>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Prize details and benefits..."
                  rows={3}
                  required
                  style={{ ...inputStyle, marginTop: '6px' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label style={labelStyle}>Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    placeholder="5000"
                    required
                    style={{ ...inputStyle, marginTop: '6px' }}
                  />
                </div>
                <div>
                  <Label style={labelStyle}>Currency</Label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    style={{ ...inputStyle, width: '100%', padding: '8px 12px', marginTop: '6px' }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label style={labelStyle}>Rank</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) || 1 })}
                    required
                    style={{ ...inputStyle, marginTop: '6px' }}
                  />
                </div>
                <div>
                  <Label style={labelStyle}>
                    Sponsor <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
                  </Label>
                  <Input
                    value={formData.sponsor}
                    onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                    placeholder="Sponsor name"
                    style={{ ...inputStyle, marginTop: '6px' }}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    border: '2px solid var(--ink)',
                    borderRadius: 0,
                    background: 'transparent',
                    color: 'var(--ink)',
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 700,
                  }}
                  disabled={createPrize.isPending}
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
                  disabled={createPrize.isPending}
                >
                  {createPrize.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Prize'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedPrizes.length === 0 ? (
        <Card
          style={{
            borderRadius: 0,
            border: '2px dashed var(--ink)',
            background: 'var(--cream)',
          }}
        >
          <CardContent className="text-center py-12">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trophy className="h-8 w-8" style={{ color: 'var(--cream)' }} />
            </div>
            <p style={{ color: 'var(--ink)', opacity: 0.6, marginBottom: '1rem' }}>
              No prizes added yet
            </p>
            <Button
              onClick={() => setOpen(true)}
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
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Prize
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPrizes.map((prize) => {
            const accentColor = getRankAccentColor(prize.rank)

            return (
              <Card
                key={prize.prize_id}
                style={{
                  borderRadius: 0,
                  border: `2px solid ${accentColor}`,
                  background: 'var(--cream)',
                }}
              >
                <CardHeader>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <Trophy className="h-6 w-6" style={{ color: 'var(--cream)' }} />
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: accentColor,
                      marginBottom: '4px',
                    }}
                  >
                    {getRankLabel(prize.rank)}
                    {prize.sponsor && (
                      <span style={{ fontWeight: 400, opacity: 0.7 }}> · {prize.sponsor}</span>
                    )}
                  </div>
                  <CardTitle
                    style={{
                      fontFamily: 'Archivo, sans-serif',
                      color: 'var(--ink)',
                      fontSize: '1.1rem',
                      marginBottom: '4px',
                    }}
                  >
                    {prize.title}
                  </CardTitle>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#16a34a',
                    }}
                  >
                    {prize.currency}{' '}
                    {typeof prize.amount === 'number'
                      ? prize.amount.toLocaleString()
                      : prize.amount}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      color: 'var(--ink)',
                      opacity: 0.7,
                    }}
                  >
                    {prize.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
