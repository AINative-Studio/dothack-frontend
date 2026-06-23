'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { featuredHackathonsAPI, FeaturedHackathon } from '@/lib/api/backend-client'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowRight, Globe } from 'lucide-react'

export default function HackathonsForYou() {
  const [hackathons, setHackathons] = useState<FeaturedHackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHackathons() {
      try {
        setLoading(true)
        setError(null)
        const response = await featuredHackathonsAPI.list()

        // Take only first 4 featured hackathons
        const featured = response.featured_hackathons
          .filter(h => h.is_featured)
          .sort((a, b) => a.display_order - b.display_order)
          .slice(0, 4)

        setHackathons(featured)
      } catch (err) {
        console.error('Error fetching featured hackathons:', err)
        setError('Failed to load hackathons')
      } finally {
        setLoading(false)
      }
    }

    fetchHackathons()
  }, [])

  const formatPrize = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatParticipants = (count: number) => {
    return new Intl.NumberFormat('en-US').format(count)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Hackathons for you</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-slate-200 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Hackathons for you</h2>
        </div>
        <Card className="p-6 bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Hackathons for you</h2>
        <Link
          href="/public-hackathons"
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
        >
          Edit your recommendations <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {hackathons.map((hackathon, index) => (
          <Card
            key={hackathon.featured_id}
            className={`p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 ${
              index === 1 ? 'border-l-teal-500 bg-gradient-to-r from-teal-50 to-transparent' : 'border-l-slate-200'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 shadow-md">
                <Image
                  src={hackathon.logo_url || '/placeholder-hackathon.png'}
                  alt={hackathon.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {hackathon.title}
                </h3>

                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-teal-500 hover:bg-teal-600 text-white">
                    {hackathon.days_left === 1 ? '1 day left' :
                     hackathon.days_left < 30 ? `${hackathon.days_left} days left` :
                     `about ${Math.round(hackathon.days_left / 30)} months left`}
                  </Badge>

                  {hackathon.is_online && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Online</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div>
                    <span className="font-bold text-slate-900">{formatPrize(hackathon.prize_amount)}</span> in prizes
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{formatParticipants(hackathon.participant_count)}</span> participants
                  </div>
                </div>
              </div>

              {index === 1 && (
                <div className="flex-shrink-0">
                  <ArrowRight className="h-6 w-6 text-teal-500" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
