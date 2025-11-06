import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { NotionService } from "@/lib/notion"

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { apiKey } = body

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    const notionService = new NotionService(apiKey)
    const isConnected = await notionService.testConnection()

    if (!isConnected) {
      return NextResponse.json({ error: "Failed to connect to Notion API" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
