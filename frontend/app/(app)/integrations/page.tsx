"use client"

import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLumaStatus, useZeroPipelineStatus } from '@/hooks/use-api'

function LumaCard() {
  const { data: status, isLoading } = useLumaStatus()

  const connected = status?.connected ?? false

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">Luma</CardTitle>
          {isLoading ? (
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
              Loading...
            </span>
          ) : connected ? (
            <Badge variant="live">Connected</Badge>
          ) : (
            <Badge variant="default">Not Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription>
          Import events, sync attendees, and browse contacts from your Luma calendar.
          Connect your API key to get started.
        </CardDescription>
      </CardContent>
      <CardFooter className="border-t-2 border-ink">
        <Link href="/integrations/luma">
          <Button
            variant="outline"
            className="font-mono text-[10px] uppercase tracking-widest border-2 border-ink bg-cream hover:bg-ink hover:text-cream transition-colors"
          >
            Configure
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function ZeroPipelineCard() {
  const { data: status, isLoading } = useZeroPipelineStatus()

  const connected = status?.connected ?? false

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">ZeroPipeline</CardTitle>
          {isLoading ? (
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
              Loading...
            </span>
          ) : connected ? (
            <Badge variant="live">Connected</Badge>
          ) : (
            <Badge variant="default">Not Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription>
          Manage your CRM pipelines, track deals, and import customers from ZeroPipeline
          into your hackathons.
        </CardDescription>
      </CardContent>
      <CardFooter className="border-t-2 border-ink">
        <Link href="/integrations/zeropipeline">
          <Button
            variant="outline"
            className="font-mono text-[10px] uppercase tracking-widest border-2 border-ink bg-cream hover:bg-ink hover:text-cream transition-colors"
          >
            Configure
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

function ComingSoonCard({ name, description }: { name: string; description: string }) {
  return (
    <Card className="flex flex-col opacity-50">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter className="border-t-2 border-ink">
        <Button
          disabled
          variant="outline"
          className="font-mono text-[10px] uppercase tracking-widest border-2 border-ink bg-cream opacity-50 cursor-not-allowed"
        >
          Configure
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function IntegrationsPage() {
  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="font-archivo font-black text-2xl uppercase tracking-tight text-ink mb-1">
          Integrations
        </h1>
        <p className="font-inter text-sm text-muted">
          Connect external platforms to import events and participants
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        <LumaCard />
        <ZeroPipelineCard />
        <ComingSoonCard
          name="Meetup"
          description="Pull event RSVPs and member data from Meetup groups directly into your hackathon participant roster."
        />
      </div>
    </div>
  )
}
