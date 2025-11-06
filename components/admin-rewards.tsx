import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Reward } from "@/lib/types"
import { Package, Users, Calendar, Gift } from "lucide-react"

interface AdminRewardsProps {
  rewards: Reward[]
}

const categoryIcons = {
  "1:1 (VC/Founder/Biohacker)": Users,
  Merch: Package,
  "Event Perk": Calendar,
  Other: Gift,
}

export function AdminRewards({ rewards }: AdminRewardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards Catalog</CardTitle>
        <CardDescription>View all rewards in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rewards.map((reward) => {
            const Icon = categoryIcons[reward.category] || Gift

            return (
              <div key={reward.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-[#FF6C0C]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-[#FF6C0C]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#FF6C0C]">{reward.cost}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">{reward.category}</Badge>
                      <Badge variant="secondary">{reward.fulfillmentType}</Badge>
                      {reward.stock !== null && <Badge variant="secondary">{reward.stock} in stock</Badge>}
                      {reward.stock === null && <Badge variant="secondary">Unlimited stock</Badge>}
                      <Badge
                        className={
                          reward.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
                        }
                      >
                        {reward.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {rewards.length === 0 && <p className="text-center text-muted-foreground py-8">No rewards in the system</p>}
        </div>
      </CardContent>
    </Card>
  )
}
