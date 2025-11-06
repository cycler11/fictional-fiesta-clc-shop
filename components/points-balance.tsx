import { Card, CardContent } from "@/components/ui/card"
import { Coins } from "lucide-react"

interface PointsBalanceProps {
  balance: number
  name: string
}

export function PointsBalance({ balance, name }: PointsBalanceProps) {
  return (
    <Card className="border-[#FF6C0C]/20 bg-gradient-to-br from-white to-orange-50 dark:from-gray-950 dark:to-orange-950/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Welcome back, {name}!</p>
            <p className="text-4xl font-bold text-[#FF6C0C]">{balance}</p>
            <p className="text-sm text-muted-foreground mt-1">Longevity Points</p>
          </div>
          <div className="h-20 w-20 rounded-full bg-[#FF6C0C]/10 flex items-center justify-center">
            <Coins className="h-10 w-10 text-[#FF6C0C]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
