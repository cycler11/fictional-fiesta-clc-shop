import { getSession } from "./auth"
import { getParticipantById } from "./notion-store"

export async function getCurrentUser() {
  const session = await getSession()

  if (!session) return null

  // Get participant data
  const participant = getParticipantById(session.participantId)

  if (!participant) return null

  return {
    ...participant,
    role: session.role,
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== "operator") {
    throw new Error("Unauthorized - Admin access required")
  }
  return user
}
