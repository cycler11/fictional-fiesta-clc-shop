// lib/db.ts
// Адаптер под старые импорты "@/lib/db". Часть берём из notion-store,
// недостающие вещи — простые заглушки, чтобы проект собирался.

// ---- типы (не строгие, чтобы не блокировать сборку) ----
type Any = any;

// ---- реэкспорты того, что уже реализовано в notion-store ----
export {
  getParticipantById,
  getParticipantByEmail,
  getAllParticipants,
  getAllLedgerEntries,
  getParticipantBalance,
  getPointsHistory,
  getNotionConfig,
  initializeNotion,
  isNotionConfigured,
  syncParticipantsFromNotion,
  syncLedgerFromNotion,
  fullSync,
  getLastSyncTime,
  testNotionConnection,
} from "./notion-store";

// ---- недостающие экспорты — временные реализации ----

// «БД» как объект-заглушка, если где-то делают import { db } from "@/lib/db"
export const db: Any = { _placeholder: true };

// Добавление проводки (минимальная сигнатура; подстрой если нужно)
export async function addLedgerEntry(entry: Any): Promise<Any> {
  // если у тебя есть реальная реализация — сведи сюда
  // пока просто возвращаем ID-заглушку
  return { id: Date.now(), ...entry };
}

// upsert участника (по email/идентификатору)
export async function upsertParticipant(participant: Any): Promise<Any> {
  // замени на реальную запись в БД, когда появится
  return { id: participant?.id ?? Date.now(), ...participant };
}

// синк-логи и метки времени — простые no-op заглушки
export function addNotionSyncLog(_log: Any): void {
  // noop
}
export function updateNotionSyncTime(): void {
  // noop
}

// иногда в коде спрашивают "инстанс" БД
export function getDbInstance(): Any {
  return db;
}
