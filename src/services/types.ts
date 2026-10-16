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
  createdAt: number;
};

export type TransactionKind = 'welcome' | 'earn' | 'redeem' | 'adjust';

export type PointsTransaction = {
  id: string;
  delta: number;
  kind: TransactionKind;
  amountEur?: number;
  rewardId?: string;
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
