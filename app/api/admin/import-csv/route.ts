import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { addLedgerEntry, getParticipantByEmail } from "@/lib/db"

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())

    // Skip header row
    const dataLines = lines.slice(1)

    let imported = 0
    const errors: string[] = []

    for (const line of dataLines) {
      const [email, deltaStr, reason] = line.split(",").map((s) => s.trim())

      if (!email || !deltaStr || !reason) {
        errors.push(`Invalid line: ${line}`)
        continue
      }

      const delta = Number.parseInt(deltaStr)
      if (isNaN(delta)) {
        errors.push(`Invalid delta for ${email}: ${deltaStr}`)
        continue
      }

      const participant = getParticipantByEmail(email)
      if (!participant) {
        errors.push(`Participant not found: ${email}`)
        continue
      }

      try {
        addLedgerEntry(participant.id, delta, reason, "manual")
        imported++
      } catch (error) {
        errors.push(`Failed to import for ${email}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("CSV import error:", error)
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 })
  }
}
