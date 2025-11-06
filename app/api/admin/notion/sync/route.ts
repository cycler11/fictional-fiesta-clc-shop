import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { NotionService } from "@/lib/notion"
import {
  getNotionConfig,
  upsertParticipant,
  addLedgerEntry,
  getParticipantByEmail,
  addNotionSyncLog,
  updateNotionSyncTime,
  db,
} from "@/lib/db"

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { syncType } = body as { syncType: "participants" | "ledger" | "full" }

    const config = getNotionConfig()

    if (!config || !config.isEnabled) {
      return NextResponse.json({ error: "Notion integration is not enabled" }, { status: 400 })
    }

    if (!config.apiKey) {
      return NextResponse.json({ error: "Notion API key is not configured" }, { status: 400 })
    }

    const notionService = new NotionService(config.apiKey)
    let recordsSynced = 0

    try {
      if (syncType === "participants" || syncType === "full") {
        if (!config.participantsDbId) {
          throw new Error("Participants database ID is not configured")
        }

        const participants = await notionService.fetchParticipants(config.participantsDbId)

        for (const participant of participants) {
          upsertParticipant({
            email: participant.email,
            name: participant.name,
            status: participant.status,
            role: participant.role,
          })
          recordsSynced++
        }
      }

      if (syncType === "ledger" || syncType === "full") {
        if (!config.ledgerDbId) {
          throw new Error("Ledger database ID is not configured")
        }

        const entries = await notionService.fetchLedgerEntries(config.ledgerDbId)

        for (const entry of entries) {
          const participant = getParticipantByEmail(entry.participantEmail)

          if (participant) {
            // Check if entry already exists (by checking if same participant, delta, reason, and date)
            const existing = db
              .prepare(
                `SELECT id FROM ledger 
                 WHERE participant_id = ? 
                 AND delta = ? 
                 AND reason = ? 
                 AND date(created_at) = date(?)
                 LIMIT 1`,
              )
              .get(participant.id, entry.delta, entry.reason, entry.date)

            if (!existing) {
              addLedgerEntry(participant.id, entry.delta, entry.reason, entry.source)
              recordsSynced++
            }
          }
        }
      }

      addNotionSyncLog(syncType, "success", recordsSynced)
      updateNotionSyncTime()

      return NextResponse.json({ success: true, recordsSynced })
    } catch (error: any) {
      addNotionSyncLog(syncType, "error", 0, error.message)
      throw error
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
