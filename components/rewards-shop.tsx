"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Reward } from "@/lib/types"
import { Coins, Package, Users, Calendar, Gift } from "lucide-react"

interface RewardsShopProps {
  rewards: Reward[]
  userBalance: number
  userId: number // Changed from string to number
}

const categoryIcons = {
  "1:1 (VC/Founder/Biohacker)": Users,
  Merch: Package,
  "Event Perk": Calendar,
  Other: Gift,
}

export function RewardsShop({ rewards, userBalance, userId }: RewardsShopProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRedeem = async () => {
    if (!selectedReward) return

    setLoading(true)
    try {
      const res = await fetch("/api/redemptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: selectedReward.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to redeem reward")
      }

      toast({
        title: "Redemption requested!",
        description: "Your request is pending approval. Check the 'My Redemptions' tab for status.",
      })

      setDialogOpen(false)
      setNotes("")
      setSelectedReward(null)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to redeem reward",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rewards Shop</CardTitle>
          <CardDescription>Browse and redeem rewards with your points</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No rewards available at the moment</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Rewards Shop</h2>
        <p className="text-muted-foreground">Browse and redeem rewards with your longevity points</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => {
          const Icon = categoryIcons[reward.category] || Gift
          const canAfford = userBalance >= reward.cost
          const outOfStock = reward.stock !== null && reward.stock <= 0

          return (
            <Card key={reward.id} className={`flex flex-col ${!canAfford || outOfStock ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="h-12 w-12 rounded-lg bg-[#FF6C0C]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-[#FF6C0C]" />
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="outline" className="text-xs">
                      {reward.category}
                    </Badge>
                    {reward.stock !== null && (
                      <Badge variant="secondary" className="text-xs">
                        {reward.stock} left
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{reward.title}</CardTitle>
                <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1">
                    <Coins className="h-5 w-5 text-[#FF6C0C]" />
                    <span className="text-2xl font-bold text-[#FF6C0C]">{reward.cost}</span>
                  </div>
                  <Dialog
                    open={dialogOpen && selectedReward?.id === reward.id}
                    onOpenChange={(open) => {
                      setDialogOpen(open)
                      if (!open) {
                        setSelectedReward(null)
                        setNotes("")
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        disabled={!canAfford || outOfStock}
                        onClick={() => setSelectedReward(reward)}
                        className="bg-[#FF6C0C] hover:bg-[#FF6C0C]/90"
                      >
                        {outOfStock ? "Out of Stock" : !canAfford ? "Not Enough Points" : "Redeem"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Redeem {reward.title}</DialogTitle>
                        <DialogDescription>
                          This will cost {reward.cost} points. Your request will be reviewed by an admin.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Additional Notes (Optional)</label>
                          <Textarea
                            placeholder="Add any special requests or information..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              setDialogOpen(false)
                              setSelectedReward(null)
                              setNotes("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 bg-[#FF6C0C] hover:bg-[#FF6C0C]/90"
                            onClick={handleRedeem}
                            disabled={loading}
                          >
                            {loading ? "Redeeming..." : "Confirm Redemption"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
