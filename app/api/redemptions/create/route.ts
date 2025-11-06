import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { createRedemptionRequest, getRewardById } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rewardId } = await request.json()

    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 })
    }

    // Get reward details
    const reward = getRewardById(rewardId)

    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 })
    }

    if (!reward.isActive) {
      return NextResponse.json({ error: "Reward is not available" }, { status: 400 })
    }

    // Create redemption request (this handles balance check and point deduction)
    try {
      const redemptionId = createRedemptionRequest(user.id, rewardId, reward.cost)

      return NextResponse.json({
        success: true,
        redemptionId,
        message: "Redemption request created successfully",
      })
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("Redemption error:", error)
    return NextResponse.json({ error: "Failed to process redemption" }, { status: 500 })
  }
}
