"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Code, Key, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

type ApiKey = {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
}

export default function APISettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return

    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `dothack_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
    }

    setApiKeys([...apiKeys, newKey])
    setNewKeyName('')
    setShowNewKeyDialog(false)
    setVisibleKeys(new Set([newKey.id]))
  }

  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(k => k.id !== id))
      const newVisible = new Set(visibleKeys)
      newVisible.delete(id)
      setVisibleKeys(newVisible)
    }
  }

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '...' + key.substring(key.length - 4)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            API Settings
          </h1>
          <p className="text-slate-600">
            Manage API keys to integrate DotHack with your own applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Active Keys</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{apiKeys.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Documentation</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Code className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/docs">
                <Button variant="link" className="p-0 h-auto text-blue-600">
                  View API Docs →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Base URL</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Code className="h-5 w-5 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">https://dothack.ainative.studio/api/v1</code>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">API Keys</CardTitle>
                <CardDescription className="text-base">
                  Create and manage API keys for programmatic access
                </CardDescription>
              </div>
              {!showNewKeyDialog && (
                <Button
                  onClick={() => setShowNewKeyDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showNewKeyDialog && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold mb-3">Create New API Key</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Key name (e.g., Production API)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                    className="flex-1"
                  />
                  <Button onClick={handleCreateKey} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => { setShowNewKeyDialog(false); setNewKeyName('') }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {apiKeys.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <Key className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-600 mb-4">No API keys created yet</p>
                {!showNewKeyDialog && (
                  <Button
                    onClick={() => setShowNewKeyDialog(true)}
                    variant="outline"
                    className="border-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First API Key
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border-2 rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Created {new Date(apiKey.createdAt).toLocaleDateString()}
                          </Badge>
                          {apiKey.lastUsed && (
                            <Badge variant="outline" className="text-xs">
                              Last used {new Date(apiKey.lastUsed).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.id)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 text-green-400 p-3 rounded-lg font-mono text-sm">
                      <span className="flex-1 overflow-x-auto">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="text-green-400 hover:text-green-300 hover:bg-slate-800"
                      >
                        {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="text-green-400 hover:text-green-300 hover:bg-slate-800"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg">Security Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Store API keys securely and never commit them to version control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Use environment variables to manage API keys in your applications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Rotate API keys regularly and delete unused keys</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>Use separate API keys for development, staging, and production environments</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
