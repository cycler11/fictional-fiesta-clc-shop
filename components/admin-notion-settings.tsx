"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, CheckCircle2, XCircle, RefreshCw, Database, Key } from "lucide-react"

interface NotionConfig {
  apiKey: string | null
  participantsDbId: string | null
  ledgerDbId: string | null
  isEnabled: boolean
  lastSyncAt: string | null
}

interface NotionSyncLog {
  id: number
  syncType: string
  status: string
  recordsSynced: number | null
  errorMessage: string | null
  createdAt: string
}

interface AdminNotionSettingsProps {
  config: NotionConfig
  syncLogs: NotionSyncLog[]
}

export function AdminNotionSettings({ config: initialConfig, syncLogs: initialLogs }: AdminNotionSettingsProps) {
  const [config, setConfig] = useState(initialConfig)
  const [apiKey, setApiKey] = useState(config.apiKey || "")
  const [participantsDbId, setParticipantsDbId] = useState(config.participantsDbId || "")
  const [ledgerDbId, setLedgerDbId] = useState(config.ledgerDbId || "")
  const [isEnabled, setIsEnabled] = useState(config.isEnabled)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [syncLogs, setSyncLogs] = useState(initialLogs)

  const handleSaveConfig = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/notion/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          participantsDbId,
          ledgerDbId,
          isEnabled,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save configuration")
      }

      setConfig(data.config)
      setMessage({ type: "success", text: "Configuration saved successfully" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/notion/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Connection test failed")
      }

      setMessage({ type: "success", text: "Connection successful! Notion API is working." })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSync = async (syncType: "participants" | "ledger" | "full") => {
    setIsSyncing(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/notion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Sync failed")
      }

      setMessage({
        type: "success",
        text: `Synced ${data.recordsSynced} records successfully`,
      })

      // Refresh sync logs
      const logsResponse = await fetch("/api/admin/notion/logs")
      const logsData = await logsResponse.json()
      setSyncLogs(logsData.logs)

      // Update last sync time
      setConfig((prev) => ({ ...prev, lastSyncAt: new Date().toISOString() }))
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#FF6C0C]" />
            Notion Integration Settings
          </CardTitle>
          <CardDescription>Connect your Notion databases to sync participants and points ledger</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Notion API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="secret_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6C0C] hover:underline"
                >
                  Notion Integrations
                </a>
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleTestConnection} disabled={!apiKey || isTesting} variant="outline" size="sm">
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participantsDbId">Participants Database ID</Label>
              <Input
                id="participantsDbId"
                placeholder="abc123..."
                value={participantsDbId}
                onChange={(e) => setParticipantsDbId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The database ID from your Notion participants database URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ledgerDbId">Points Ledger Database ID</Label>
              <Input
                id="ledgerDbId"
                placeholder="def456..."
                value={ledgerDbId}
                onChange={(e) => setLedgerDbId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">The database ID from your Notion ledger database URL</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isEnabled">Enable Notion Sync</Label>
                <p className="text-sm text-muted-foreground">Automatically sync data from Notion when enabled</p>
              </div>
              <Switch id="isEnabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>

            <Button onClick={handleSaveConfig} disabled={isSaving} className="bg-[#FF6C0C] hover:bg-[#FF6C0C]/90">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {config.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-[#FF6C0C]" />
              Manual Sync
            </CardTitle>
            <CardDescription>Manually trigger data synchronization from Notion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.lastSyncAt && (
              <p className="text-sm text-muted-foreground">
                Last synced: {new Date(config.lastSyncAt).toLocaleString()}
              </p>
            )}

            <div className="flex gap-2">
              <Button onClick={() => handleSync("participants")} disabled={isSyncing} variant="outline" size="sm">
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sync Participants
              </Button>
              <Button onClick={() => handleSync("ledger")} disabled={isSyncing} variant="outline" size="sm">
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sync Ledger
              </Button>
              <Button onClick={() => handleSync("full")} disabled={isSyncing} variant="outline" size="sm">
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Full Sync
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Recent synchronization logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {syncLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sync history yet</p>
            ) : (
              syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.syncType}</Badge>
                      {log.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    {log.recordsSynced !== null && (
                      <p className="text-sm text-muted-foreground">{log.recordsSynced} records synced</p>
                    )}
                    {log.errorMessage && <p className="text-sm text-red-600">{log.errorMessage}</p>}
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
