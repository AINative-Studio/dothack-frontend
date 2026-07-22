"use client"

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  useLumaStatus,
  useConnectLuma,
  useDisconnectLuma,
  useUpdateSyncOptions,
  useLumaEvents,
  useImportLumaEvent,
  useSyncLumaGuests,
  useLumaContacts,
  useHackathons,
  type SyncOptions,
} from '@/hooks/use-api'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso?: string | null): string {
  if (!iso) return 'Never'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Not-connected state
// ---------------------------------------------------------------------------

function ConnectLumaCard() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const connectMutation = useConnectLuma()

  async function handleConnect() {
    if (!apiKey.trim()) {
      toast.error('Please enter your Luma API key')
      return
    }
    try {
      const result = await connectMutation.mutateAsync(apiKey.trim())
      toast.success(`Connected to "${result.calendar_name}"`)
      setApiKey('')
    } catch (err: any) {
      toast.error('Failed to connect', {
        description: err?.message ?? 'Check your API key and try again',
      })
    }
  }

  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Connect Luma</CardTitle>
          <CardDescription>
            Link your Luma account to import events, sync guests, and browse
            your contacts list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="luma-api-key">
              <MonoLabel>API Key</MonoLabel>
            </Label>
            <div className="flex gap-2">
              <Input
                id="luma-api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="luma_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                className="border-2 border-ink bg-cream font-mono text-sm focus-visible:ring-accent"
                disabled={connectMutation.isPending}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowKey((v) => !v)}
                className="shrink-0 font-mono text-[10px] uppercase tracking-widest border-2 border-ink"
              >
                {showKey ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Find your API key at{' '}
            <a
              href="https://lu.ma/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2"
            >
              lu.ma/settings/api
            </a>
          </p>
        </CardContent>
        <CardFooter className="border-t-2 border-ink">
          <Button
            onClick={handleConnect}
            disabled={connectMutation.isPending || !apiKey.trim()}
            className="bg-accent text-white border-2 border-accent hover:bg-[#e03a14] font-archivo font-extrabold uppercase tracking-wider"
          >
            {connectMutation.isPending ? 'Connecting...' : 'Test & Connect'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sync options card
// ---------------------------------------------------------------------------

function SyncOptionsCard({ current }: { current: SyncOptions }) {
  const [options, setOptions] = useState<SyncOptions>(current)
  const updateMutation = useUpdateSyncOptions()

  async function handleSave() {
    try {
      await updateMutation.mutateAsync(options)
      toast.success('Sync options saved')
    } catch (err: any) {
      toast.error('Failed to save options', {
        description: err?.message,
      })
    }
  }

  function toggle(key: keyof SyncOptions) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Options</CardTitle>
        <CardDescription>Choose what data to sync from Luma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-[#ddd6c6]">
        {(
          [
            { key: 'events' as const, label: 'Import Events', description: 'Pull events from your Luma calendar' },
            { key: 'guests' as const, label: 'Sync Guests', description: 'Import event attendees as participants' },
            { key: 'contacts' as const, label: 'Historical Contacts', description: 'Browse all contacts across events' },
          ] as const
        ).map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between py-3 gap-4">
            <div>
              <p className="text-sm font-medium text-ink">{label}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {description}
              </p>
            </div>
            <Switch
              checked={options[key]}
              onCheckedChange={() => toggle(key)}
              aria-label={label}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t-2 border-ink">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-accent text-white border-2 border-accent hover:bg-[#e03a14] font-archivo font-extrabold uppercase tracking-wider"
          size="sm"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Options'}
        </Button>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Events tab
// ---------------------------------------------------------------------------

function EventsTab() {
  const { data, isLoading } = useLumaEvents()
  const importMutation = useImportLumaEvent()

  async function handleImport(eventId: string, eventName: string) {
    try {
      const result = await importMutation.mutateAsync(eventId)
      toast.success(`Imported as "${result.hackathon_name}"`, {
        description: (
          <Link href={`/hackathons/${result.hackathon_id}`} className="underline text-accent">
            Open hackathon
          </Link>
        ) as any,
      })
    } catch (err: any) {
      toast.error(`Failed to import "${eventName}"`, {
        description: err?.message,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full bg-cream-mid border-2 border-ink" />
        ))}
      </div>
    )
  }

  const events = data?.events ?? []

  if (events.length === 0) {
    return (
      <div className="border-2 border-ink bg-cream py-12 text-center">
        <MonoLabel>No events found in your Luma calendar</MonoLabel>
      </div>
    )
  }

  return (
    <div className="border-2 border-ink bg-cream divide-y-2 divide-ink">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_160px_100px_120px] gap-4 px-4 py-2 bg-ink text-cream">
        <MonoLabel>Event Name</MonoLabel>
        <MonoLabel>Date</MonoLabel>
        <MonoLabel>Guests</MonoLabel>
        <MonoLabel>Action</MonoLabel>
      </div>
      {events.map((event) => (
        <div
          key={event.event_id}
          className="grid grid-cols-[1fr_160px_100px_120px] gap-4 px-4 py-3 items-center hover:bg-cream-mid transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-ink leading-tight truncate">{event.name}</p>
            {event.location && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted truncate">
                {event.is_online ? 'Online' : event.location}
              </p>
            )}
          </div>
          <div>
            {event.start_at ? (
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink">
                {formatDate(event.start_at)}
              </p>
            ) : (
              <MonoLabel>TBD</MonoLabel>
            )}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink">
              {event.guest_count}
            </p>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleImport(event.event_id, event.name)}
              disabled={importMutation.isPending}
              className="font-mono text-[10px] uppercase tracking-widest border-2 border-ink"
            >
              {importMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sync Guests tab
// ---------------------------------------------------------------------------

function SyncGuestsTab() {
  const [lumaEventId, setLumaEventId] = useState('')
  const [hackathonId, setHackathonId] = useState('')
  const [result, setResult] = useState<{
    imported: number
    skipped: number
    total: number
  } | null>(null)

  const { data: eventsData } = useLumaEvents()
  const { data: hackathonsData } = useHackathons()
  const syncMutation = useSyncLumaGuests()

  async function handleSync() {
    if (!lumaEventId || !hackathonId) {
      toast.error('Select both a Luma event and a target hackathon')
      return
    }
    try {
      const res = await syncMutation.mutateAsync({ lumaEventId, hackathonId })
      setResult({ imported: res.imported, skipped: res.skipped, total: res.total })
      toast.success(res.message)
    } catch (err: any) {
      toast.error('Sync failed', { description: err?.message })
    }
  }

  const events = eventsData?.events ?? []
  const hackathons = hackathonsData?.hackathons ?? []

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Sync Guests</CardTitle>
          <CardDescription>
            Import Luma event attendees into a DotHack hackathon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="luma-event-select">
              <MonoLabel>Luma Event</MonoLabel>
            </Label>
            <Select value={lumaEventId} onValueChange={setLumaEventId}>
              <SelectTrigger
                id="luma-event-select"
                className="border-2 border-ink bg-cream font-mono text-[11px] uppercase tracking-widest"
              >
                <SelectValue placeholder="Select a Luma event..." />
              </SelectTrigger>
              <SelectContent className="border-2 border-ink bg-cream">
                {events.map((e) => (
                  <SelectItem
                    key={e.event_id}
                    value={e.event_id}
                    className="font-mono text-[11px] uppercase tracking-widest"
                  >
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hackathon-select">
              <MonoLabel>Target Hackathon</MonoLabel>
            </Label>
            <Select value={hackathonId} onValueChange={setHackathonId}>
              <SelectTrigger
                id="hackathon-select"
                className="border-2 border-ink bg-cream font-mono text-[11px] uppercase tracking-widest"
              >
                <SelectValue placeholder="Select a hackathon..." />
              </SelectTrigger>
              <SelectContent className="border-2 border-ink bg-cream">
                {hackathons.map((h) => (
                  <SelectItem
                    key={h.hackathon_id}
                    value={h.hackathon_id}
                    className="font-mono text-[11px] uppercase tracking-widest"
                  >
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t-2 border-ink">
          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending || !lumaEventId || !hackathonId}
            className="bg-accent text-white border-2 border-accent hover:bg-[#e03a14] font-archivo font-extrabold uppercase tracking-wider"
            size="sm"
          >
            {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 divide-x-2 divide-ink border-2 border-ink">
              {[
                { label: 'Imported', value: result.imported },
                { label: 'Skipped', value: result.skipped },
                { label: 'Total', value: result.total },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3 text-center">
                  <p className="font-archivo font-black text-2xl text-ink">{value}</p>
                  <MonoLabel>{label}</MonoLabel>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Contacts tab
// ---------------------------------------------------------------------------

function ContactsTab() {
  const { data, isLoading } = useLumaContacts()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full bg-cream-mid border-2 border-ink" />
        ))}
      </div>
    )
  }

  const contacts = data?.contacts ?? []

  if (contacts.length === 0) {
    return (
      <div className="border-2 border-ink bg-cream py-12 text-center">
        <MonoLabel>No contacts found</MonoLabel>
      </div>
    )
  }

  return (
    <div className="border-2 border-ink bg-cream divide-y-2 divide-ink">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_1fr_100px] gap-4 px-4 py-2 bg-ink text-cream">
        <MonoLabel>Name</MonoLabel>
        <MonoLabel>Email</MonoLabel>
        <MonoLabel>Events</MonoLabel>
      </div>
      {contacts.map((contact) => (
        <div
          key={contact.email}
          className="grid grid-cols-[1fr_1fr_100px] gap-4 px-4 py-3 items-center hover:bg-cream-mid transition-colors"
        >
          <p className="text-sm font-medium text-ink truncate">
            {contact.name ?? '-'}
          </p>
          <p className="font-mono text-[11px] text-muted truncate">{contact.email}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink">
            {contact.event_count}
          </p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Connected state
// ---------------------------------------------------------------------------

function DisconnectDialog({
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-2 border-ink bg-cream">
        <DialogHeader>
          <DialogTitle className="font-archivo font-black uppercase tracking-tight">
            Disconnect Luma
          </DialogTitle>
          <DialogDescription className="font-inter text-sm text-muted">
            This will remove your Luma API key and disable all syncing. Existing
            imported events and participants will not be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="border-2 border-ink font-mono text-[10px] uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="font-mono text-[10px] uppercase tracking-widest"
          >
            {isPending ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConnectedView() {
  const { data: status } = useLumaStatus()
  const disconnectMutation = useDisconnectLuma()
  const [showDisconnect, setShowDisconnect] = useState(false)

  const syncOptions: SyncOptions = status?.sync_options ?? {
    events: true,
    guests: true,
    contacts: false,
  }

  async function handleDisconnect() {
    try {
      await disconnectMutation.mutateAsync()
      toast.success('Luma disconnected')
      setShowDisconnect(false)
    } catch (err: any) {
      toast.error('Failed to disconnect', { description: err?.message })
    }
  }

  return (
    <div className="space-y-5">
      {/* Connection status card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Connection Status</CardTitle>
              {status?.calendar_name && (
                <CardDescription className="mt-1">{status.calendar_name}</CardDescription>
              )}
            </div>
            <Badge variant="live">Connected</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-3">
            <MonoLabel>Last synced:</MonoLabel>
            <span className="font-mono text-[10px] text-ink">
              {formatDate(status?.last_synced_at)}
            </span>
          </div>
          {status?.status && (
            <div className="flex items-center gap-3">
              <MonoLabel>Status:</MonoLabel>
              <span className="font-mono text-[10px] text-ink">{status.status}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t-2 border-ink">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDisconnect(true)}
            className="font-mono text-[10px] uppercase tracking-widest"
          >
            Disconnect
          </Button>
        </CardFooter>
      </Card>

      {/* Sync options */}
      <SyncOptionsCard current={syncOptions} />

      {/* Data tabs */}
      <Tabs defaultValue="events">
        <TabsList className="border-2 border-ink bg-cream h-auto p-0 gap-0 rounded-none">
          {syncOptions.events && (
            <TabsTrigger
              value="events"
              className="font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-none border-r-2 border-ink data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none"
            >
              Events
            </TabsTrigger>
          )}
          {syncOptions.guests && (
            <TabsTrigger
              value="guests"
              className="font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-none border-r-2 border-ink data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none"
            >
              Sync Guests
            </TabsTrigger>
          )}
          {syncOptions.contacts && (
            <TabsTrigger
              value="contacts"
              className="font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-none data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none"
            >
              Contacts
            </TabsTrigger>
          )}
        </TabsList>

        {syncOptions.events && (
          <TabsContent value="events" className="mt-4">
            <EventsTab />
          </TabsContent>
        )}
        {syncOptions.guests && (
          <TabsContent value="guests" className="mt-4">
            <SyncGuestsTab />
          </TabsContent>
        )}
        {syncOptions.contacts && (
          <TabsContent value="contacts" className="mt-4">
            <ContactsTab />
          </TabsContent>
        )}
      </Tabs>

      <DisconnectDialog
        open={showDisconnect}
        onClose={() => setShowDisconnect(false)}
        onConfirm={handleDisconnect}
        isPending={disconnectMutation.isPending}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function LumaIntegrationPage() {
  const { data: status, isLoading } = useLumaStatus()

  return (
    <div className="p-7 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center gap-2 mb-1">
        <Link
          href="/integrations"
          className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          Integrations
        </Link>
        <span className="font-mono text-[10px] text-muted">/</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink">Luma</span>
      </div>
      <h1 className="font-archivo font-black text-2xl uppercase tracking-tight text-ink mb-1">
        Luma Integration
      </h1>
      <p className="font-inter text-sm text-muted mb-6">
        Import events, sync attendees, and browse contacts from your Luma calendar
      </p>

      {isLoading ? (
        <div className="space-y-4 max-w-lg">
          <Skeleton className="h-40 w-full bg-cream-mid border-2 border-ink" />
          <Skeleton className="h-24 w-full bg-cream-mid border-2 border-ink" />
        </div>
      ) : status?.connected ? (
        <ConnectedView />
      ) : (
        <ConnectLumaCard />
      )}
    </div>
  )
}
