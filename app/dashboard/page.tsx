import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helpers"
import { getPointsHistory, getActiveRewards, getRedemptionRequests, getParticipantBalance } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard-header"
import { PointsBalance } from "@/components/points-balance"
import { PointsHistory } from "@/components/points-history"
import { RewardsShop } from "@/components/rewards-shop"
import { RedemptionHistory } from "@/components/redemption-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const balance = getParticipantBalance(user.id)
  const [pointsHistory, rewards, redemptions] = await Promise.all([
    Promise.resolve(getPointsHistory(user.id)),
    Promise.resolve(getActiveRewards()),
    Promise.resolve(getRedemptionRequests(user.id)),
  ])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <PointsBalance balance={balance} name={user.name} />

          <Tabs defaultValue="shop" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="shop">Shop</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="redemptions">My Redemptions</TabsTrigger>
            </TabsList>

            <TabsContent value="shop" className="mt-6">
              <RewardsShop rewards={rewards} userBalance={balance} userId={user.id} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <PointsHistory history={pointsHistory} />
            </TabsContent>

            <TabsContent value="redemptions" className="mt-6">
              <RedemptionHistory redemptions={redemptions} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
