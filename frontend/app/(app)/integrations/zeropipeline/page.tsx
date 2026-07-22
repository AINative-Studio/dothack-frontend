"use client"

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  useZeroPipelineStatus,
  useConnectZeroPipeline,
  useDisconnectZeroPipeline,
  useUpdateZeroPipelineSyncOptions,
  useZeroPipelinePipelines,
  useZeroPipelineDeals,
  useZeroPipelineCustomers,
  useImportZeroPipelineCustomers,
  useZeroPipelineDashboard,
  useHackathons,
  type ZeroPipelineSyncOptions,
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

function formatCurrency(value?: number, currency?: string): string {
  if (value === undefined || value === null) return '-'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency ?? 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency ?? '$'}${value}`
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

function ConnectZeroPipelineCard() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const connectMutation = useConnectZeroPipeline()

  async function handleConnect() {
    if (!apiKey.trim()) {
      toast.error('Please enter your ZeroPipeline API key')
      return
    }
    try {
      const result = await connectMutation.mutateAsync(apiKey.trim())
      toast.success(`Connected to "${result.account_name}"`)
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
          <CardTitle>Connect ZeroPipeline</CardTitle>
          <CardDescription>
            Link your ZeroPipeline account to manage CRM pipelines, track deals,
            and import customers into your hackathons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zeropipeline-api-key">
              <MonoLabel>API Key</MonoLabel>
            </Label>
            <div className="flex gap-2">
              <Input
                id="zeropipeline-api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="zp_..."
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
            Find your API key in{' '}
            <a
              href="https://pipeline.ainative.studio/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2"
            >
              ZeroPipeline Settings &gt; API Keys
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

function SyncOptionsCard({ current }: { current: ZeroPipelineSyncOptions }) {
  const [options, setOptions] = useState<ZeroPipelineSyncOptions>(current)
  const updateMutation = useUpdateZeroPipelineSyncOptions()

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

  function toggle(key: keyof ZeroPipelineSyncOptions) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const rows: { key: keyof ZeroPipelineSyncOptions; label: string; description: string }[] = [
    { key: 'pipelines', label: 'Sync Pipelines', description: 'Pull pipeline definitions from ZeroPipeline' },
    { key: 'deals', label: 'Sync Deals', description: 'Import deals and their stage data' },
    { key: 'customers', label: 'Sync Customers', description: 'Import customer profiles and contact info' },
    { key: 'tasks', label: 'Sync Tasks', description: 'Pull open and completed CRM tasks' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Options</CardTitle>
        <CardDescription>Choose what data to sync from ZeroPipeline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-[#ddd6c6]">
        {rows.map(({ key, label, description }) => (
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
// Pipelines tab
// ---------------------------------------------------------------------------

function PipelinesTab() {
  const { data, isLoading } = useZeroPipelinePipelines()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full bg-cream-mid border-2 border-ink" />
        ))}
      </div>
    )
  }

  const pipelines = data?.pipelines ?? []

  if (pipelines.length === 0) {
    return (
      <div className="border-2 border-ink bg-cream py-12 text-center">
        <MonoLabel>No pipelines found in your ZeroPipeline account</MonoLabel>
      </div>
    )
  }

  return (
    <div className="border-2 border-ink bg-cream divide-y-2 divide-ink">
      <div className="grid grid-cols-[1fr_120px_120px] gap-4 px-4 py-2 bg-ink text-cream">
        <MonoLabel>Pipeline Name</MonoLabel>
        <MonoLabel>Stages</MonoLabel>
        <MonoLabel>Deals</MonoLabel>
      </div>
      {pipelines.map((pipeline) => (
        <div
          key={pipeline.pipeline_id}
          className="grid grid-cols-[1fr_120px_120px] gap-4 px-4 py-3 items-center hover:bg-cream-mid transition-colors"
        >
          <p className="text-sm font-medium text-ink truncate">{pipeline.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink">
            {pipeline.stage_count}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink">
            {pipeline.deal_count}
          </p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Deals tab
// ---------------------------------------------------------------------------

function DealsTab() {
  const [pipelineFilter, setPipelineFilter] = useState<string>('')
  const { data: pipelinesData } = useZeroPipelinePipelines()
  const { data, isLoading } = useZeroPipelineDeals(pipelineFilter || undefined)

  const pipelines = pipelinesData?.pipelines ?? []

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full bg-cream-mid border-2 border-ink" />
        ))}
      </div>
    )
  }

  const deals = data?.deals ?? []

  return (
    <div className="space-y-4">
      {pipelines.length > 0 && (
        <div className="flex items-center gap-3">
          <MonoLabel>Filter by pipeline:</MonoLabel>
          <Select
            value={pipelineFilter}
            onValueChange={(v) => setPipelineFilter(v === '__all__' ? '' : v)}
          >
            <SelectTrigger className="w-52 border-2 border-ink bg-cream font-mono text-[11px] uppercase tracking-widest">
              <SelectValue placeholder="All pipelines" />
            </SelectTrigger>
            <SelectContent className="border-2 border-ink bg-cream">
              <SelectItem
                value="__all__"
                className="font-mono text-[11px] uppercase tracking-widest"
              >
                All Pipelines
              </SelectItem>
              {pipelines.map((p) => (
                <SelectItem
                  key={p.pipeline_id}
                  value={p.pipeline_id}
                  className="font-mono text-[11px] uppercase tracking-widest"
                >
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {deals.length === 0 ? (
        <div className="border-2 border-ink bg-cream py-12 text-center">
          <MonoLabel>No deals found</MonoLabel>
        </div>
      ) : (
        <div className="border-2 border-ink bg-cream divide-y-2 divide-ink">
          <div className="grid grid-cols-[1fr_120px_120px_100px_120px] gap-4 px-4 py-2 bg-ink text-cream">
            <MonoLabel>Title</MonoLabel>
            <MonoLabel>Value</MonoLabel>
            <MonoLabel>Stage</MonoLabel>
            <MonoLabel>Status</MonoLabel>
            <MonoLabel>Customer</MonoLabel>
          </div>
          {deals.map((deal) => (
            <div
              key={deal.deal_id}
              className="grid grid-cols-[1fr_120px_120px_100px_120px] gap-4 px-4 py-3 items-center hover:bg-cream-mid transition-colors"
            >
              <p className="text-sm font-medium text-ink truncate">{deal.title}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink">
                {formatCurrency(deal.value, deal.currency)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink truncate">
                {deal.stage ?? '-'}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink">
                {deal.status ?? '-'}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted truncate">
                {deal.customer_name ?? '-'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Customers tab
// ---------------------------------------------------------------------------

function CustomersTab() {
  const { data, isLoading } = useZeroPipelineCustomers()
  const { data: hackathonsData } = useHackathons()
  const importMutation = useImportZeroPipelineCustomers()
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedHackathon, setSelectedHackathon] = useState('')

  const hackathons = hackathonsData?.hackathons ?? []

  async function handleImport() {
    if (!selectedHackathon) {
      toast.error('Select a target hackathon')
      return
    }
    try {
      const result = await importMutation.mutateAsync({ hackathonId: selectedHackathon })
      toast.success(result.message, {
        description: `Imported ${result.imported}, skipped ${result.skipped} of ${result.total}`,
      })
      setShowImportDialog(false)
      setSelectedHackathon('')
    } catch (err: any) {
      toast.error('Import failed', { description: err?.message })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full bg-cream-mid border-2 border-ink" />
        ))}
      </div>
    )
  }

  const customers = data?.customers ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </p>
        <Button
          size="sm"
          onClick={() => setShowImportDialog(true)}
          className="bg-accent text-white border-2 border-accent hover:bg-[#e03a14] font-archivo font-extrabold uppercase tracking-wider"
        >
          Import to Hackathon
        </Button>
      </div>

      {customers.length === 0 ? (
        <div className="border-2 border-ink bg-cream py-12 text-center">
          <MonoLabel>No customers found</MonoLabel>
        </div>
      ) : (
        <div className="border-2 border-ink bg-cream divide-y-2 divide-ink">
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 px-4 py-2 bg-ink text-cream">
            <MonoLabel>Name</MonoLabel>
            <MonoLabel>Email</MonoLabel>
            <MonoLabel>Company</MonoLabel>
          </div>
          {customers.map((customer) => (
            <div
              key={customer.customer_id}
              className="grid grid-cols-[1fr_1fr_1fr] gap-4 px-4 py-3 items-center hover:bg-cream-mid transition-colors"
            >
              <p className="text-sm font-medium text-ink truncate">
                {customer.name ?? '-'}
              </p>
              <p className="font-mono text-[11px] text-muted truncate">
                {customer.email ?? '-'}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink truncate">
                {customer.company ?? '-'}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showImportDialog} onOpenChange={(v) => !v && setShowImportDialog(false)}>
        <DialogContent className="border-2 border-ink bg-cream">
          <DialogHeader>
            <DialogTitle className="font-archivo font-black uppercase tracking-tight">
              Import Customers
            </DialogTitle>
            <DialogDescription className="font-inter text-sm text-muted">
              Import ZeroPipeline customers as participants into a hackathon.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="import-hackathon-select">
              <MonoLabel>Target Hackathon</MonoLabel>
            </Label>
            <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
              <SelectTrigger
                id="import-hackathon-select"
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

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              disabled={importMutation.isPending}
              className="border-2 border-ink font-mono text-[10px] uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importMutation.isPending || !selectedHackathon}
              className="bg-accent text-white border-2 border-accent hover:bg-[#e03a14] font-archivo font-extrabold uppercase tracking-wider"
            >
              {importMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard tab
// ---------------------------------------------------------------------------

function DashboardTab() {
  const { data, isLoading } = useZeroPipelineDashboard()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full bg-cream-mid border-2 border-ink" />
        ))}
      </div>
    )
  }

  const summaryItems = [
    { label: 'Total Deals', value: data?.total_deals ?? 0 },
    { label: 'Total Customers', value: data?.total_customers ?? 0 },
    {
      label: 'Total Revenue',
      value: data?.total_revenue !== undefined
        ? formatCurrency(data.total_revenue)
        : '-',
    },
    { label: 'Pipelines', value: data?.pipeline_count ?? 0 },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {summaryItems.map(({ label, value }) => (
        <Card key={label} className="border-2 border-ink bg-cream">
          <CardContent className="pt-5 pb-4 text-center">
            <p className="font-archivo font-black text-2xl text-ink">{value}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
              {label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Disconnect dialog
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
            Disconnect ZeroPipeline
          </DialogTitle>
          <DialogDescription className="font-inter text-sm text-muted">
            This will remove your ZeroPipeline API key and disable all syncing.
            Existing imported customers and participants will not be deleted.
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

// ---------------------------------------------------------------------------
// Connected state
// ---------------------------------------------------------------------------

function ConnectedView() {
  const { data: status } = useZeroPipelineStatus()
  const disconnectMutation = useDisconnectZeroPipeline()
  const [showDisconnect, setShowDisconnect] = useState(false)

  const syncOptions: ZeroPipelineSyncOptions = status?.sync_options ?? {
    pipelines: true,
    deals: true,
    customers: true,
    tasks: false,
  }

  async function handleDisconnect() {
    try {
      await disconnectMutation.mutateAsync()
      toast.success('ZeroPipeline disconnected')
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
              {status?.account_name && (
                <CardDescription className="mt-1">{status.account_name}</CardDescription>
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
      <Tabs defaultValue="pipelines">
        <TabsList className="border-2 border-ink bg-cream h-auto p-0 gap-0 rounded-none">
          <TabsTrigger
            value="pipelines"
            className="font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-none border-r-2 border-ink data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none"
          >
            Pipelines
          </TabsTrigger>
          <TabsTrigger
            value="deals"
            className="font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-none border-r-2 border-ink data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none"
          >
            Deals
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-none border-r-2 border-ink data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none"
          >
            Customers
          </TabsTrigger>
          <TabsTrigger
            value="dashboard"
            className="font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-none data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none"
          >
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="mt-4">
          <PipelinesTab />
        </TabsContent>
        <TabsContent value="deals" className="mt-4">
          <DealsTab />
        </TabsContent>
        <TabsContent value="customers" className="mt-4">
          <CustomersTab />
        </TabsContent>
        <TabsContent value="dashboard" className="mt-4">
          <DashboardTab />
        </TabsContent>
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

export default function ZeroPipelineIntegrationPage() {
  const { data: status, isLoading } = useZeroPipelineStatus()

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
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
          ZeroPipeline
        </span>
      </div>
      <h1 className="font-archivo font-black text-2xl uppercase tracking-tight text-ink mb-1">
        ZeroPipeline Integration
      </h1>
      <p className="font-inter text-sm text-muted mb-6">
        Manage CRM pipelines, track deals, and import customers from ZeroPipeline
      </p>

      {isLoading ? (
        <div className="space-y-4 max-w-lg">
          <Skeleton className="h-40 w-full bg-cream-mid border-2 border-ink" />
          <Skeleton className="h-24 w-full bg-cream-mid border-2 border-ink" />
        </div>
      ) : status?.connected ? (
        <ConnectedView />
      ) : (
        <ConnectZeroPipelineCard />
      )}
    </div>
  )
}
