import { Client } from "@notionhq/client"
import type { Participant, PointsLedger } from "./types"

// In-memory cache for Notion data
let notionClient: Client | null = null
let notionConfig: {
  apiKey: string
  participantsDbId: string
  ledgerDbId: string
  rewardsDbId?: string
} | null = null

// Cache
let participantsCache: Participant[] = []
let ledgerCache: PointsLedger[] = []
let lastSyncTime: Date | null = null

export function initializeNotion(config: {
  apiKey: string
  participantsDbId: string
  ledgerDbId: string
  rewardsDbId?: string
}) {
  notionConfig = config
  notionClient = new Client({ auth: config.apiKey })
  console.log("[v0] Notion initialized")
}

export function isNotionConfigured(): boolean {
  return notionClient !== null && notionConfig !== null
}

export function getNotionConfig() {
  return notionConfig
}

// Helper to get property value from Notion
function getPropertyValue(property: any): string | null {
  if (!property) return null

  switch (property.type) {
    case "title":
      return property.title?.[0]?.plain_text || null
    case "rich_text":
      return property.rich_text?.[0]?.plain_text || null
    case "email":
      return property.email || null
    case "select":
      return property.select?.name || null
    case "number":
      return property.number?.toString() || null
    case "date":
      return property.date?.start || null
    default:
      return null
  }
}

// Fetch participants from Notion
export async function syncParticipantsFromNotion(): Promise<Participant[]> {
  if (!notionClient || !notionConfig) {
    throw new Error("Notion not configured")
  }

  try {
    const response = await notionClient.databases.query({
      database_id: notionConfig.participantsDbId,
    })

    participantsCache = response.results.map((page: any, index) => {
      const props = page.properties
      return {
        id: index + 1, // Use index as ID since Notion IDs are strings
        notionId: page.id,
        name: getPropertyValue(props.Name || props.Имя) || "",
        email: getPropertyValue(props.Email || props["E-mail"]) || "",
        status: (getPropertyValue(props.Status || props.Статус) || "active") as "active" | "inactive",
        role: (getPropertyValue(props.Role || props.Роль) || "participant") as "participant" | "operator",
        createdAt: page.created_time,
      }
    })

    lastSyncTime = new Date()
    console.log(`[v0] Synced ${participantsCache.length} participants from Notion`)
    return participantsCache
  } catch (error) {
    console.error("[v0] Error syncing participants from Notion:", error)
    throw error
  }
}

// Fetch ledger from Notion
export async function syncLedgerFromNotion(): Promise<PointsLedger[]> {
  if (!notionClient || !notionConfig) {
    throw new Error("Notion not configured")
  }

  try {
    const response = await notionClient.databases.query({
      database_id: notionConfig.ledgerDbId,
      sorts: [{ property: "Date", direction: "descending" }],
    })

    ledgerCache = response.results.map((page: any, index) => {
      const props = page.properties
      const email = getPropertyValue(props.Email || props["Participant Email"]) || ""
      const participant = participantsCache.find((p) => p.email === email)

      return {
        id: index + 1,
        notionId: page.id,
        participantId: participant?.id || 0,
        delta: Number.parseInt(getPropertyValue(props.Delta || props.Points) || "0"),
        reason: getPropertyValue(props.Reason || props.Описание) || "",
        source: (getPropertyValue(props.Source || props.Источник) || "manual") as any,
        createdAt: getPropertyValue(props.Date || props.Дата) || page.created_time,
      }
    })

    console.log(`[v0] Synced ${ledgerCache.length} ledger entries from Notion`)
    return ledgerCache
  } catch (error) {
    console.error("[v0] Error syncing ledger from Notion:", error)
    throw error
  }
}

// Full sync
export async function fullSync() {
  await syncParticipantsFromNotion()
  await syncLedgerFromNotion()
}

// Get participant by email
export function getParticipantByEmail(email: string): Participant | null {
  return participantsCache.find((p) => p.email === email) || null
}

// Get participant by ID
export function getParticipantById(id: number): Participant | null {
  return participantsCache.find((p) => p.id === id) || null
}

// Get all participants
export function getAllParticipants(): Participant[] {
  return participantsCache
}

// Calculate balance for a participant
export function getParticipantBalance(participantId: number): number {
  return ledgerCache
    .filter((entry) => entry.participantId === participantId)
    .reduce((sum, entry) => sum + entry.delta, 0)
}

// Get points history for a participant
export function getPointsHistory(participantId: number): PointsLedger[] {
  return ledgerCache
    .filter((entry) => entry.participantId === participantId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Get all ledger entries
export function getAllLedgerEntries(): PointsLedger[] {
  return ledgerCache
}

// Get last sync time
export function getLastSyncTime(): Date | null {
  return lastSyncTime
}

// Test Notion connection
export async function testNotionConnection(): Promise<boolean> {
  if (!notionClient) return false

  try {
    await notionClient.users.me({})
    return true
  } catch (error) {
    console.error("[v0] Notion connection test failed:", error)
    return false
  }
}
