import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "operator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, role, initialPoints } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Generate access code
    const accessCode = crypto.randomBytes(4).toString("hex").toUpperCase()

    // Start transaction
    const insertParticipant = db.prepare(`
      INSERT INTO participants (name, email, role, status)
      VALUES (?, ?, ?, 'active')
    `)

    const result = insertParticipant.run(name, email, role || "participant")
    const participantId = result.lastInsertRowid

    // Create access code
    db.prepare(`
      INSERT INTO access_codes (code, participant_id, role, is_used, expires_at)
      VALUES (?, ?, ?, 0, datetime('now', '+30 days'))
    `).run(accessCode, participantId, role || "participant")

    // Add initial points if specified
    if (initialPoints && initialPoints > 0) {
      db.prepare(`
        INSERT INTO ledger (participant_id, delta, reason, source)
        VALUES (?, ?, 'Initial balance', 'manual')
      `).run(participantId, initialPoints)
    }

    return NextResponse.json({
      success: true,
      participantId,
      accessCode,
    })
  } catch (error) {
    console.error("Error creating participant:", error)
    return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
  }
}
