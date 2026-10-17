import type { ContentKey, ContentMap, EventItem } from '@/content/types';

export type Role = 'customer' | 'staff' | 'admin';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  /** Saldo punti spendibile. */
  points: number;
  /** Punti guadagnati da sempre (per i livelli). */
  totalEarned: number;
  /** Codice tessera breve, digitabile dallo staff se il QR non si legge. */
  cardCode: string;
  /** Quante volte ha riscattato ciascun premio (id premio → numero). */
  redeemed: Record<string, number>;
  createdAt: number;
};

export type TransactionKind = 'welcome' | 'earn' | 'redeem' | 'adjust';

export type PointsTransaction = {
  id: string;
  delta: number;
  kind: TransactionKind;
  amountEur?: number;
  rewardId?: string;
  rewardTitle?: string;
  note?: string;
  staffId?: string;
  staffName?: string;
  createdAt: number;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type ApplyPointsInput = {
  userId: string;
  delta: number;
  kind: Exclude<TransactionKind, 'welcome'>;
  amountEur?: number;
  rewardId?: string;
  rewardTitle?: string;
  /** Per i premi riscattabili una sola volta: rifiuta se già riscattato. */
  singleUse?: boolean;
  note?: string;
  staff: Pick<UserProfile, 'id' | 'name'>;
};

export type Unsubscribe = () => void;

export interface Backend {
  readonly mode: 'firebase' | 'demo';
  onAuthChange(cb: (uid: string | null) => void): Unsubscribe;
  signIn(email: string, password: string): Promise<void>;
  signUp(input: SignUpInput): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  deleteAccount(): Promise<void>;
  subscribeProfile(uid: string, cb: (profile: UserProfile | null) => void): Unsubscribe;
  subscribeTransactions(uid: string, cb: (items: PointsTransaction[]) => void, max?: number): Unsubscribe;
  updateOwnProfile(uid: string, patch: { name?: string; phone?: string }): Promise<void>;
  /* Funzioni staff */
  getProfile(uid: string): Promise<UserProfile | null>;
  findByCardCode(code: string): Promise<UserProfile | null>;
  searchCustomersByEmail(prefix: string): Promise<UserProfile[]>;
  applyPoints(input: ApplyPointsInput): Promise<UserProfile>;
  /* Contenuti modificabili (lettura per tutti, scrittura solo staff) */
  subscribeContent<K extends ContentKey>(key: K, cb: (data: ContentMap[K] | null) => void): Unsubscribe;
  saveContent<K extends ContentKey>(key: K, data: ContentMap[K]): Promise<void>;
  /** Con includeDrafts (solo staff) restituisce anche gli eventi non pubblicati. */
  subscribeEvents(includeDrafts: boolean, cb: (items: EventItem[]) => void): Unsubscribe;
  saveEvent(event: Omit<EventItem, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): Promise<EventItem>;
  deleteEvent(id: string): Promise<void>;
  /* Notifiche push */
  registerPushToken(token: string, uid: string | null): Promise<void>;
  listPushTokens(): Promise<string[]>;
  removePushTokens(tokens: string[]): Promise<void>;
}

/** Rimuove i campi undefined (Firestore non li accetta) facendo una copia profonda. */
export function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export class AppError extends Error {}

export const QR_PREFIX = 'DEHORS:';

export function qrPayloadFor(uid: string) {
  return `${QR_PREFIX}${uid}`;
}

export function parseQrPayload(data: string): string | null {
  const value = data.trim();
  if (!value.startsWith(QR_PREFIX)) return null;
  const uid = value.slice(QR_PREFIX.length);
  return /^[A-Za-z0-9_-]{6,128}$/.test(uid) ? uid : null;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCardCode(length = 8) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export function normalizeCardCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isStaff(profile: UserProfile | null | undefined) {
  return profile?.role === 'staff' || profile?.role === 'admin';
}
