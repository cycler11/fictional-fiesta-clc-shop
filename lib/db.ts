// lib/db.ts
// Совместимый слой, чтобы починить импорты "@/lib/db"

import type {
  Participant,
  Reward,
  RedemptionRequest,
  AccessCode,
  NotionConfig,
  NotionSyncLog,
} from "./types"

// ----- Реэкспорты из notion-store -----
export {
  // участники и баланс
  getParticipantById,
  getParticipantByEmail,
  getAllParticipants,
  getParticipantBalance,
  getPointsHistory,
  getAllLedgerEntries,
  // базовая конфигурация (чтение)
  getNotionConfig,
  initializeNotion,
  isNotionConfigured,
  syncParticipantsFromNotion,
  syncLedgerFromNotion,
  fullSync,
  getLastSyncTime,
  testNotionConnection,
} from "./notion-store"

// ----- Простейшее временное хранилище (in-memory) -----

// Награды
let rewards: Reward[] = [
  {
    id: 1,
    title: "T-shirt",
    cost: 50,
    category: "Merch",
    stock: 100,
    description: "Brand merch",
    imagePath: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "1:1 with VC",
    cost: 200,
    category: "1:1 (VC/Founder/Biohacker)",
    stock: 5,
    description: null,
    imagePath: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

let redemptions: RedemptionRequest[] = []
let accessCodes: AccessCode[] = []
let notionConfigMem: NotionConfig = {
  apiKey: "",
  participantsDbId: "",
  ledgerDbId: "",
  rewardsDbId: undefined,
  isEnabled: false,
  lastSyncAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
let notionLogs: NotionSyncLog[] = []

// -------- Награды / редемпшны --------
export function getActiveRewards(): Reward[] {
  return rewards.filter(r => r.isActive)
}
export function getAllRewards(): Reward[] {
  return rewards
}
export function getRewardById(id: number): Reward | undefined {
  return rewards.find(r => r.id === id)
}
export function getRedemptionRequests(participantId: number): RedemptionRequest[] {
  return redemptions
    .filter(r => r.participantId === participantId)
    .sort((a, b) => b.id - a.id)
}
export function getAllRedemptionRequests(): RedemptionRequest[] {
  return redemptions.slice().sort((a, b) => b.id - a.id)
}
export function createRedemptionRequest(
  participantId: number,
  rewardId: number,
  costSnapshot: number,
): number {
  const reward = getRewardById(rewardId)
  if (!reward || !reward.isActive) throw new Error("Reward is not available")

  const id = redemptions.length ? redemptions[redemptions.length - 1].id + 1 : 1
  const now = new Date().toISOString()
  redemptions.push({
    id,
    participantId,
    rewardId,
    status: "pending",
    costSnapshot,
    notes: null,
    createdAt: now,
    updatedAt: now,
  })
  return id
}
export function updateRedemptionStatus(
  requestId: number,
  newStatus: "approved" | "rejected" | "fulfilled",
  adminNotes?: string | null,
) {
  const r = redemptions.find(x => x.id === requestId)
  if (!r) throw new Error("Redemption request not found")
  r.status = newStatus
  r.notes = adminNotes ?? r.notes
  r.updatedAt = new Date().toISOString()
}

// -------- Access codes (логин по коду) --------
// Примитивная заглушка: код вида ADMIN-1 привязан к участнику #1,
// PARTICIPANT-<id> — к соответствующему участнику
export function verifyAccessCode(code: string): AccessCode | null {
  const mAdmin = code.match(/^ADMIN-(\d+)$/i)
  const mUser = code.match(/^PARTICIPANT-(\d+)$/i)
  const id = accessCodes.length ? accessCodes[accessCodes.length - 1].id + 1 : 1

  if (mAdmin) {
    const participantId = Number(mAdmin[1])
    const ac: AccessCode = {
      id,
      code,
      participantId,
      role: "operator",
      isUsed: false,
      expiresAt: null,
      createdAt: new Date().toISOString(),
    }
    return ac
  }
  if (mUser) {
    const participantId = Number(mUser[1])
    const ac: AccessCode = {
      id,
      code,
      participantId,
      role: "participant",
      isUsed: false,
      expiresAt: null,
      createdAt: new Date().toISOString(),
    }
    return ac
  }
  return null
}

// Для генерации кодов в админке здесь просто заглушки:
export function getDbInstance() {
  throw new Error("DB is not configured on this demo adapter")
}

// -------- Notion config + логи синка --------
export function updateNotionConfig(patch: Partial<NotionConfig>) {
  notionConfigMem = {
    ...notionConfigMem,
    ...patch,
    updatedAt: new Date().toISOString(),
  }
}
export function getNotionSyncLogs(): NotionSyncLog[] {
  return notionLogs.slice().sort((a, b) => b.id - a.id)
}
export function addNotionSyncLog(log: Omit<NotionSyncLog, "id" | "createdAt">) {
  const id = notionLogs.length ? notionLogs[notionLogs.length - 1].id + 1 : 1
  notionLogs.push({
    ...log,
    id,
    createdAt: new Date().toISOString(),
  })
}
export function updateNotionSyncTime() {
  notionConfigMem.lastSyncAt = new Date().toISOString()
}
export function getParticipantsWithBalances(): Array<Participant & { balance: number }> {
  // простая заглушка для админки; реальные балансы берите из notion-store.getParticipantBalance
  return []
}
export function getAccessCodesWithParticipants() {
  return []
}
export function getParticipantAccessCode(_participantId: number): AccessCode | null {
  return null
}
