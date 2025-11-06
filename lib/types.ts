export interface Participant {
  id: number
  name: string
  email: string
  status: "active" | "inactive"
  role: "participant" | "operator"
  createdAt: string
}

export interface PointsLedger {
  id: number
  participantId: number
  delta: number
  reason: string
  source: "checkin" | "manual" | "redeem" | "adjustment" | "refund"
  createdAt: string
}

export interface Reward {
  id: number
  title: string
  cost: number
  category: string
  stock: number | null
  description: string | null
  imagePath: string | null
  isActive: boolean
  createdAt: string
}

export interface RedemptionRequest {
  id: number
  participantId: number
  rewardId: number
  status: "pending" | "approved" | "rejected" | "fulfilled"
  costSnapshot: number
  notes: string | null
  createdAt: string
  updatedAt: string
  participant?: Participant
  reward?: Reward
}

export interface AccessCode {
  id: number
  code: string
  participantId: number | null
  role: "participant" | "operator"
  isUsed: boolean
  expiresAt: string | null
  createdAt: string
}

export interface Session {
  participantId: number
  email: string
  name: string
  role: "participant" | "operator"
}

export interface NotionConfig {
  id: number
  apiKey: string | null
  participantsDbId: string | null
  ledgerDbId: string | null
  isEnabled: boolean
  lastSyncAt: string | null
  createdAt: string
  updatedAt: string
}

export interface NotionSyncLog {
  id: number
  syncType: "participants" | "ledger" | "full"
  status: "success" | "error"
  recordsSynced: number | null
  errorMessage: string | null
  createdAt: string
}
