import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { getNotionSyncLogs } from "@/lib/db"

export async function GET() {
  try {
    await requireAdmin()
    const logs = getNotionSyncLogs(20)
    return NextResponse.json({ logs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
