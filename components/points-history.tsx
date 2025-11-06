import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PointsLedger } from "@/lib/types"
import { ArrowDown, ArrowUp } from "lucide-react"

interface PointsHistoryProps {
  history: PointsLedger[]
}

export function PointsHistory({ history }: PointsHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
          <CardDescription>Your points transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points History</CardTitle>
        <CardDescription>Your points transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    entry.delta > 0 ? "bg-green-100 dark:bg-green-950" : "bg-red-100 dark:bg-red-950"
                  }`}
                >
                  {entry.delta > 0 ? (
                    <ArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{entry.reason}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{entry.source}</Badge>
                <p
                  className={`text-lg font-bold ${
                    entry.delta > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {entry.delta > 0 ? "+" : ""}
                  {entry.delta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
