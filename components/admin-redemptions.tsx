"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { RedemptionRequest } from "@/lib/types"
import { Check, X, Package } from "lucide-react"

interface AdminRedemptionsProps {
  redemptions: RedemptionRequest[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  fulfilled: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
}

export function AdminRedemptions({ redemptions }: AdminRedemptionsProps) {
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | "fulfill" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAction = async () => {
    if (!selectedRequest || !action) return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/redemptions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action,
          adminNotes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update request")
      }

      toast({
        title: "Request updated",
        description: `Redemption request has been ${action}d successfully.`,
      })

      setSelectedRequest(null)
      setAction(null)
      setAdminNotes("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const pendingRequests = redemptions.filter((r) => r.status === "pending")
  const approvedRequests = redemptions.filter((r) => r.status === "approved")
  const otherRequests = redemptions.filter((r) => r.status !== "pending" && r.status !== "approved")

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                {pendingRequests.length}
              </Badge>
              Pending Requests
            </CardTitle>
            <CardDescription>Review and approve or reject redemption requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{request.reward?.title}</h3>
                        <Badge className={statusColors[request.status]}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Participant:</strong> {request.participant?.name} ({request.participant?.email})
                        </p>
                        <p>
                          <strong>Cost:</strong> {request.costSnapshot} points
                        </p>
                        <p>
                          <strong>Category:</strong> {request.reward?.category}
                        </p>
                        {request.notes && (
                          <p className="italic mt-2">
                            <strong>User Notes:</strong> {request.notes}
                          </p>
                        )}
                        <p className="text-xs mt-2">
                          Requested on{" "}
                          {new Date(request.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#FF6C0C]">{request.costSnapshot}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedRequest(request)
                        setAction("approve")
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setSelectedRequest(request)
                        setAction("reject")
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {approvedRequests.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                {approvedRequests.length}
              </Badge>
              Approved - Awaiting Fulfillment
            </CardTitle>
            <CardDescription>Mark these as fulfilled once delivered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <div key={request.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.reward?.title}</h3>
                        <Badge className={statusColors[request.status]}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Participant:</strong> {request.participant?.name} ({request.participant?.email})
                        </p>
                        {request.notes && (
                          <p className="italic mt-2">
                            <strong>User Notes:</strong> {request.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setSelectedRequest(request)
                      setAction("fulfill")
                    }}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Mark as Fulfilled
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {otherRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Completed and rejected requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherRequests.map((request) => (
                <div key={request.id} className="p-3 rounded-lg border bg-card text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{request.reward?.title}</p>
                      <p className="text-muted-foreground">{request.participant?.name}</p>
                    </div>
                    <Badge className={statusColors[request.status]}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {redemptions.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No redemption requests yet</p>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedRequest && !!action}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null)
            setAction(null)
            setAdminNotes("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" && "Approve Redemption"}
              {action === "reject" && "Reject Redemption"}
              {action === "fulfill" && "Mark as Fulfilled"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve" && "This will deduct points from the user's balance and approve the request."}
              {action === "reject" && "This will reject the request without deducting points."}
              {action === "fulfill" && "This will mark the reward as delivered to the user."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setSelectedRequest(null)
                  setAction(null)
                  setAdminNotes("")
                }}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${
                  action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : action === "reject"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={handleAction}
                disabled={loading}
              >
                {loading ? "Processing..." : `Confirm ${action}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
