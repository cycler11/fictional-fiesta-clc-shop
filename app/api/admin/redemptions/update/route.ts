import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { updateRedemptionStatus } from "@/lib/db"

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const { requestId, action, adminNotes } = await request.json()

    if (!requestId || !action) {
      return NextResponse.json({ error: "Request ID and action are required" }, { status: 400 })
    }

    if (!["approve", "reject", "fulfill"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Map action to status
    let newStatus: "approved" | "rejected" | "fulfilled"
    switch (action) {
      case "approve":
        newStatus = "approved"
        break
      case "reject":
        newStatus = "rejected"
        break
      case "fulfill":
        newStatus = "fulfilled"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update the redemption status (this handles all the logic including refunds)
    try {
      updateRedemptionStatus(requestId, newStatus, adminNotes)
      return NextResponse.json({ success: true, newStatus })
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("Admin update error:", error)
    return NextResponse.json({ error: "Unauthorized or failed to update" }, { status: 500 })
  }
}
