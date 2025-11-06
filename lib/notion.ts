import { Client } from "@notionhq/client"

export interface NotionParticipant {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
  role: "participant" | "operator"
}

export interface NotionLedgerEntry {
  id: string
  participantEmail: string
  delta: number
  reason: string
  source: "checkin" | "manual" | "redeem" | "adjustment" | "refund"
  date: string
}

export class NotionService {
  private client: Client | null = null

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new Client({ auth: apiKey })
    }
  }

  isConfigured(): boolean {
    return this.client !== null
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) return false

    try {
      await this.client.users.me({})
      return true
    } catch (error) {
      console.error("[v0] Notion connection test failed:", error)
      return false
    }
  }

  async fetchParticipants(databaseId: string): Promise<NotionParticipant[]> {
    if (!this.client) throw new Error("Notion client not configured")

    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
      })

      return response.results.map((page: any) => {
        const props = page.properties
        return {
          id: page.id,
          name: this.getPropertyValue(props.Name || props.Имя) || "",
          email: this.getPropertyValue(props.Email || props["E-mail"]) || "",
          status: (this.getPropertyValue(props.Status || props.Статус) || "active") as "active" | "inactive",
          role: (this.getPropertyValue(props.Role || props.Роль) || "participant") as "participant" | "operator",
        }
      })
    } catch (error) {
      console.error("[v0] Error fetching participants from Notion:", error)
      throw error
    }
  }

  async fetchLedgerEntries(databaseId: string): Promise<NotionLedgerEntry[]> {
    if (!this.client) throw new Error("Notion client not configured")

    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "Date",
            direction: "descending",
          },
        ],
      })

      return response.results.map((page: any) => {
        const props = page.properties
        return {
          id: page.id,
          participantEmail: this.getPropertyValue(props.Email || props["Participant Email"]) || "",
          delta: Number.parseInt(this.getPropertyValue(props.Delta || props.Points) || "0"),
          reason: this.getPropertyValue(props.Reason || props.Описание) || "",
          source: (this.getPropertyValue(props.Source || props.Источник) || "manual") as any,
          date: this.getPropertyValue(props.Date || props.Дата) || new Date().toISOString(),
        }
      })
    } catch (error) {
      console.error("[v0] Error fetching ledger from Notion:", error)
      throw error
    }
  }

  private getPropertyValue(property: any): string | null {
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
}
