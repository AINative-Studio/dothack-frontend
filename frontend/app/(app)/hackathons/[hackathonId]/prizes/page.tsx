"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePrizesByHackathon, useCreatePrize } from '@/hooks/use-prizes'
import { useTracksByHackathon } from '@/hooks/use-tracks'
import { Trophy, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PrizesPage({
  params,
}: {
  params: { hackathonId: string }
}) {
  const { data: prizes = [], isLoading: prizesLoading } = usePrizesByHackathon(params.hackathonId)
  const { data: tracks = [], isLoading: tracksLoading } = useTracksByHackathon(params.hackathonId)
  const createPrize = useCreatePrize()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    rank: 1,
    track_id: '',
  })

  const sortedPrizes = [...prizes].sort((a, b) => a.rank - b.rank)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createPrize.mutateAsync({
        hackathon_id: params.hackathonId,
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        rank: formData.rank,
        track_id: formData.track_id || undefined,
      })

      toast.success('Prize created successfully')
      setFormData({ title: '', description: '', amount: '', rank: 1, track_id: '' })
      setOpen(false)
    } catch (error) {
      console.error('Failed to create prize:', error)
      toast.error('Failed to create prize', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500 to-amber-500'
      case 2: return 'from-slate-400 to-slate-500'
      case 3: return 'from-orange-600 to-amber-700'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1: return '1st Place'
      case 2: return '2nd Place'
      case 3: return '3rd Place'
      default: return `${rank}th Place`
    }
  }

  if (prizesLoading || tracksLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Prizes
          </h1>
          <p className="text-slate-600 mt-2">Manage prizes and rewards for this hackathon</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30">
              <Plus className="h-4 w-4 mr-2" />
              Add Prize
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Prize</DialogTitle>
              <DialogDescription>Create a new prize for this hackathon</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Prize Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Grand Prize"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Prize details and benefits"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount/Value</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g., $5,000 or Swag Pack"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rank">Rank</Label>
                <Input
                  id="rank"
                  type="number"
                  min="1"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="track">Track (Optional)</Label>
                <Select
                  value={formData.track_id}
                  onValueChange={(value) => setFormData({ ...formData, track_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a track (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General Prize</SelectItem>
                    {tracks.map((track) => (
                      <SelectItem key={track.track_id} value={track.track_id}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={createPrize.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
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
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <p className="text-slate-600 mb-4">No prizes added yet</p>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              className="border-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Prize
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPrizes.map((prize) => {
            const track = tracks.find(t => t.track_id === prize.track_id)
            return (
              <Card key={prize.prize_id} className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className={`w-16 h-16 mb-3 rounded-xl bg-gradient-to-br ${getRankColor(prize.rank)} flex items-center justify-center shadow-lg`}>
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-600">
                      {getRankLabel(prize.rank)}
                    </span>
                    {track && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {track.name}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{prize.title}</CardTitle>
                  <div className="text-2xl font-bold text-emerald-600 mt-2">
                    {prize.amount}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
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
