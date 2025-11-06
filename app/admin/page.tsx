import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth-helpers"
import {
  getAllRedemptionRequests,
  getAllRewards,
  getParticipantsWithBalances,
  getAccessCodesWithParticipants,
  getParticipantAccessCode,
  getNotionConfig,
  getNotionSyncLogs,
} from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminRedemptions } from "@/components/admin-redemptions"
import { AdminRewards } from "@/components/admin-rewards"
import { AdminCSVImport } from "@/components/admin-csv-import"
import { AdminParticipants } from "@/components/admin-participants"
import { AdminNotionSettings } from "@/components/admin-notion-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminPage() {
  try {
    const user = await requireAdmin()

    const [redemptions, rewards, participantsData, accessCodesData, notionConfig, notionLogs] = await Promise.all([
      Promise.resolve(getAllRedemptionRequests()),
      Promise.resolve(getAllRewards()),
      Promise.resolve(getParticipantsWithBalances()),
      Promise.resolve(getAccessCodesWithParticipants()),
      Promise.resolve(getNotionConfig()),
      Promise.resolve(getNotionSyncLogs(20)),
    ])

    const participants = participantsData.map((p) => ({
      ...p,
      access_code: getParticipantAccessCode(p.id) || undefined,
    }))

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage redemption requests and rewards</p>
            </div>

            <Tabs defaultValue="redemptions" className="w-full">
              <TabsList>
                <TabsTrigger value="redemptions">Redemption Requests</TabsTrigger>
                <TabsTrigger value="rewards">Manage Rewards</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="notion">Notion Integration</TabsTrigger>
                <TabsTrigger value="import">Import/Export</TabsTrigger>
              </TabsList>

              <TabsContent value="redemptions" className="mt-6">
                <AdminRedemptions redemptions={redemptions} />
              </TabsContent>

              <TabsContent value="rewards" className="mt-6">
                <AdminRewards rewards={rewards} />
              </TabsContent>

              <TabsContent value="participants" className="mt-6">
                <AdminParticipants participants={participants} accessCodes={accessCodesData} />
              </TabsContent>

              <TabsContent value="notion" className="mt-6">
                <AdminNotionSettings config={notionConfig} syncLogs={notionLogs} />
              </TabsContent>

              <TabsContent value="import" className="mt-6">
                <AdminCSVImport />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    redirect("/dashboard")
  }
}
