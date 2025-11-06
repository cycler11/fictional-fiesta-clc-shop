// lib/db.ts
// Совместимый слой под импорты "@/lib/db".
// Часть функций — реэкспорты из notion-store, остальное — простые заглушки in-memory,
// чтобы сборка прошла и приложение работало.

type Any = any;

// ===== Реэкспорты из notion-store (уже реализованы) =====
export {
  // участники и леджер
  getParticipantById,
  getParticipantByEmail,
  getAllParticipants,
  getAllLedgerEntries,
  getParticipantBalance,
  getPointsHistory,

  // конфиг/синхронизация с Notion
  getNotionConfig,
  initializeNotion,
  isNotionConfigured,
  syncParticipantsFromNotion,
  syncLedgerFromNotion,
  fullSync,
  getLastSyncTime,
  testNotionConnection,
} from "./notion-store";

// ====== In-memory хранилище для «магазина» ======
type Reward = {
  id: number;
  title: string;
  cost: number;
  category: string | null;
  stock: number | null;      // null = без ограничений
  description: string | null;
  imagePath: string | null;
  isActive: boolean;
  createdAt: string;
};

type RedemptionRequest = {
  id: number;
  participantId: number;
  rewardId: number;
  status: "pending" | "approved" | "rejected" | "fulfilled";
  costSnapshot: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type AccessCode = {
  id: number;
  code: string;
  participantId: number | null; // null = гостевой
  role: "participant" | "operator";
  isUsed: boolean;
  expiresAt: string | null;
  createdAt: string;
};

const rewards: Reward[] = [
  {
    id: 1,
    title: "T-Shirt",
    cost: 50,
    category: "Merch",
    stock: 100,
    description: "Club merch",
    imagePath: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "1:1 with Mentor",
    cost: 200,
    category: "1:1",
    stock: 5,
    description: null,
    imagePath: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

let redemptions: RedemptionRequest[] = [];
let accessCodes: AccessCode[] = [
  { id: 1, code: "ADMIN2025", participantId: null, role: "operator", isUsed: false, expiresAt: null, createdAt: new Date().toISOString() },
  { id: 2, code: "ALICE2025", participantId: 1, role: "participant", isUsed: false, expiresAt: null, createdAt: new Date().toISOString() },
  { id: 3, code: "BOB2025",   participantId: 2, role: "participant", isUsed: false, expiresAt: null, createdAt: new Date().toISOString() },
];

// ====== Экспорты, которых не хватало (ожидаются роутами/страницами) ======

// «Инстанс БД» — заглушка для import { db } from "@/lib/db"
export const db: Any = { _placeholder: true };
export function getDbInstance(): Any { return db; }

// ---- Награды
export function getAllRewards(): Reward[] { return rewards.slice(); }
export function getActiveRewards(): Reward[] { return rewards.filter(r => r.isActive); }
export function getRewardById(id: number): Reward | undefined { return rewards.find(r => r.id === id); }

// ---- Редемпшны
export function getAllRedemptionRequests(): RedemptionRequest[] {
  return redemptions.slice().sort((a, b) => b.id - a.id);
}
export function getRedemptionRequests(participantId: number): RedemptionRequest[] {
  return redemptions.filter(r => r.participantId === participantId).sort((a, b) => b.id - a.id);
}
export function createRedemptionRequest(
  participantId: number,
  rewardId: number,
  costSnapshot: number,
): number {
  const reward = getRewardById(rewardId);
  if (!reward || !reward.isActive) throw new Error("Reward is not available");
  const id = redemptions.length ? redemptions[redemptions.length - 1].id + 1 : 1;
  const now = new Date().toISOString();
  redemptions.push({
    id, participantId, rewardId, status: "pending",
    costSnapshot, notes: null, createdAt: now, updatedAt: now
  });
  return id;
}
export function updateRedemptionStatus(
  requestId: number,
  newStatus: "approved" | "rejected" | "fulfilled",
  adminNotes?: string | null,
) {
  const r = redemptions.find(x => x.id === requestId);
  if (!r) throw new Error("Redemption request not found");
  r.status = newStatus;
  r.notes = adminNotes ?? r.notes;
  r.updatedAt = new Date().toISOString();
}

// ---- Балансы/сводки для админки (минимум, чтобы страницы работали)
export function getParticipantsWithBalances(): Array<Any & { balance: number }> {
  // для реальной логики посчитай суммы из getAllLedgerEntries по participantId
  return [];
}

// ---- Access codes / логин кодом
export function verifyAccessCode(code: string): AccessCode | null {
  const ac = accessCodes.find(c => c.code.toUpperCase() === code.toUpperCase());
  return ac ?? null;
}
export function getAccessCodesWithParticipants(): Array<AccessCode & { participant?: Any }> {
  return accessCodes.map(c => ({ ...c }));
}
export function getParticipantAccessCode(_participantId: number): AccessCode | null {
  // Можно вернуть самый свежий код участника — пока просто null
  return null;
}

// ---- Логи синка и метка времени (для страниц админки)
let notionSyncLogs: Array<{ id: number; createdAt: string; level: "info" | "error"; message: string }> = [];
export function addNotionSyncLog(log: { level: "info" | "error"; message: string }) {
  const id = notionSyncLogs.length ? notionSyncLogs[notionSyncLogs.length - 1].id + 1 : 1;
  notionSyncLogs.push({ id, createdAt: new Date().toISOString(), ...log });
}
export function getNotionSyncLogs() { return notionSyncLogs.slice().sort((a, b) => b.id - a.id); }
export function updateNotionSyncTime() { /* отметка делается в getNotionConfig внутри notion-store; здесь no-op */ }

// ---- Операции с леджером/участниками, которые ждут API-роуты
export async function addLedgerEntry(entry: Any): Promise<Any> {
  // Если будешь хранить леджер в SQLite — перенеси сюда реальную вставку.
  return { id: Date.now(), ...entry };
}
export async function upsertParticipant(participant: Any): Promise<Any> {
  // Пока просто возвращаем входной объект с id
  return { id: participant?.id ?? Date.now(), ...participant };
}

// ---- Настройки Notion (обновление, чтение реэкспортируется выше)
export function updateNotionConfig(patch: Any) {
  // Здесь можно передать дальше в notion-store, если там есть update;
  // пока просто no-op, чтобы удовлетворить импорт.
}
