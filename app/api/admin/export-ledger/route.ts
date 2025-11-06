import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { getAllLedgerEntries, getParticipantById } from "@/lib/db"

export async function GET() {
  try {
    await requireAdmin()

    const entries = getAllLedgerEntries()

    // Create CSV content
    const header = "Date,Participant,Email,Delta,Reason,Source\n"
    const rows = entries
      .map((entry) => {
        const participant = getParticipantById(entry.participantId)
        return `${entry.createdAt},${participant?.name || "Unknown"},${participant?.email || ""},${entry.delta},"${entry.reason}",${entry.source}`
      })
      .join("\n")

    const csv = header + rows

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ledger-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("CSV export error:", error)
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}
