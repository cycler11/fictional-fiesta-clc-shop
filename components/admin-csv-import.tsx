"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Upload, Download } from "lucide-react"

export function AdminCSVImport() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to import CSV")
      }

      toast({
        title: "Import successful",
        description: `Imported ${data.imported} entries${data.errors ? ` with ${data.errors.length} errors` : ""}`,
      })

      setFile(null)
      router.refresh()
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import CSV",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/export-ledger")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ledger-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful",
        description: "Ledger data has been exported",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export ledger data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Import Points</CardTitle>
          <CardDescription>Upload a CSV file to batch import points transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              CSV format: <code className="bg-muted px-1 py-0.5 rounded">email,delta,reason</code>
            </p>
            <p className="text-xs text-muted-foreground">Example: alice@caltech.edu,50,Event attendance</p>
          </div>
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={loading} />
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full bg-[#FF6C0C] hover:bg-[#FF6C0C]/90"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? "Importing..." : "Import CSV"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Ledger</CardTitle>
          <CardDescription>Download all ledger transactions as CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} variant="outline" className="w-full bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export Ledger CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
