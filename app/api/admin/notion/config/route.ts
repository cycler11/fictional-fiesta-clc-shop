import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { getNotionConfig, updateNotionConfig } from "@/lib/db"

export async function GET() {
  try {
    await requireAdmin()
    const config = getNotionConfig()
    return NextResponse.json({ config })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { apiKey, participantsDbId, ledgerDbId, isEnabled } = body

    updateNotionConfig({
      apiKey,
      participantsDbId,
      ledgerDbId,
      isEnabled,
    })

    const config = getNotionConfig()

    return NextResponse.json({ config })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
