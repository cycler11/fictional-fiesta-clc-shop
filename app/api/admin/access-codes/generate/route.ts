import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { getDbInstance } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "operator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { participantId, role, expiresInDays } = await request.json()

    // Generate unique code
    const code = crypto.randomBytes(4).toString("hex").toUpperCase()

    const db = getDbInstance()
    const insertCode = db.prepare(`
      INSERT INTO access_codes (code, participant_id, role, is_used, expires_at)
      VALUES (?, ?, ?, 0, datetime('now', '+' || ? || ' days'))
    `)

    insertCode.run(code, participantId || null, role || "participant", expiresInDays || 30)

    return NextResponse.json({
      success: true,
      code,
    })
  } catch (error) {
    console.error("Error generating access code:", error)
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}
