"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Invalid access code")
      }

      toast({
        title: "Welcome!",
        description: `Logged in as ${data.name}`,
      })

      // Redirect based on role
      if (data.role === "operator") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid or expired access code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-[#FF6C0C]/20">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-4xl font-bold text-balance">Caltech Longevity</CardTitle>
          <CardTitle className="text-2xl font-semibold text-[#FF6C0C]">Points Shop</CardTitle>
          <CardDescription className="text-pretty text-base">
            Enter your access code to view and redeem rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Access Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="ENTER-YOUR-CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                disabled={loading}
                className="h-11 font-mono text-center text-lg tracking-wider"
                maxLength={20}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#FF6C0C] hover:bg-[#FF6C0C]/90"
              disabled={loading || !code.trim()}
            >
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </form>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-muted rounded-lg border">
              <p className="text-xs font-semibold mb-2">Test Codes (Dev Only):</p>
              <div className="space-y-1 text-xs font-mono">
                <p>
                  Admin: <strong>ADMIN2025</strong>
                </p>
                <p>
                  Alice: <strong>ALICE2025</strong> (150 pts)
                </p>
                <p>
                  Bob: <strong>BOB2025</strong> (200 pts)
                </p>
                <p>
                  Guest: <strong>GUEST001</strong>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
