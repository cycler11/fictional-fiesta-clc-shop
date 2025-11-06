"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DashboardHeaderProps {
  user: {
    name: string
    email: string
    role: "participant" | "operator"
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast({
        title: "Logged out",
        description: "See you next time!",
      })
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="border-b bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Caltech Longevity</h1>
            <p className="text-sm text-muted-foreground">Points Shop</p>
          </div>

          <div className="flex items-center gap-4">
            {user.role === "operator" && (
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="border-[#FF6C0C] text-[#FF6C0C] hover:bg-[#FF6C0C]/10"
              >
                Admin Panel
              </Button>
            )}
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
