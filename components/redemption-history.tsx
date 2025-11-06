import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RedemptionRequest } from "@/lib/types"

interface RedemptionHistoryProps {
  redemptions: RedemptionRequest[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  fulfilled: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
}

export function RedemptionHistory({ redemptions }: RedemptionHistoryProps) {
  if (redemptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Redemptions</CardTitle>
          <CardDescription>Track your reward redemption requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No redemptions yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Redemptions</CardTitle>
        <CardDescription>Track your reward redemption requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {redemptions.map((redemption) => (
            <div key={redemption.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{redemption.reward?.title}</h3>
                    <Badge className={statusColors[redemption.status]}>
                      {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{redemption.reward?.description}</p>
                  {redemption.notes && <p className="text-sm text-muted-foreground italic">Note: {redemption.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    Requested on{" "}
                    {new Date(redemption.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#FF6C0C]">{redemption.costSnapshot}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
