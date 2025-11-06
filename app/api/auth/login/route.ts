import { NextResponse } from "next/server"
import { verifyAccessCode, getParticipantById } from "@/lib/db"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Access code is required" }, { status: 400 })
    }

    // Verify the access code
    const accessCode = verifyAccessCode(code)

    if (!accessCode) {
      return NextResponse.json({ error: "Invalid or expired access code" }, { status: 401 })
    }

    // Get or create participant
    let participant
    if (accessCode.participantId) {
      participant = getParticipantById(accessCode.participantId)
      if (!participant) {
        return NextResponse.json({ error: "Participant not found" }, { status: 404 })
      }
    } else {
      // For guest codes without participant_id, we need to handle this
      // For now, return error - admin should assign codes to participants
      return NextResponse.json({ error: "This code must be activated by an administrator first" }, { status: 400 })
    }

    // Mark code as used (optional - remove if codes should be reusable)
    // markCodeAsUsed(code)

    // Create session
    await createSession(participant.id, participant.email, participant.name, participant.role)

    return NextResponse.json({
      success: true,
      name: participant.name,
      role: participant.role,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
