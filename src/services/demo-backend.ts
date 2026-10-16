import AsyncStorage from '@react-native-async-storage/async-storage';

import { Loyalty } from '@/config/loyalty';
import {
  AppError,
  generateCardCode,
  normalizeCardCode,
  type Backend,
  type PointsTransaction,
  type UserProfile,
} from './types';

/**
 * Backend locale per provare l'app senza Firebase: tutti i dati restano sul telefono.
 * Account staff di prova: staff@dehors.demo / staff123
 */
type DemoUser = UserProfile & { password: string };
type DemoDb = {
  users: Record<string, DemoUser>;
  transactions: Record<string, PointsTransaction[]>;
  session: string | null;
};

const STORAGE_KEY = 'dehors-demo-db-v1';
export const DEMO_STAFF = { email: 'staff@dehors.demo', password: 'staff123' };

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function seed(): DemoDb {
  const staffId = 'demo-staff';
  const customerId = 'demo-cliente';
  const now = Date.now();
  return {
    session: null,
    users: {
      [staffId]: {
        id: staffId,
        name: 'Staff Dehors',
        email: DEMO_STAFF.email,
        password: DEMO_STAFF.password,
        role: 'admin',
        points: 0,
        totalEarned: 0,
        cardCode: 'STAFF001',
        createdAt: now,
      },
      [customerId]: {
        id: customerId,
        name: 'Cliente Demo',
        email: 'cliente@dehors.demo',
        password: 'cliente123',
        role: 'customer',
        points: 64,
        totalEarned: 134,
        cardCode: 'DEMO2345',
        createdAt: now,
      },
    },
    transactions: {
      [customerId]: [
        { id: newId(), delta: -50, kind: 'redeem', rewardId: 'colazione', staffName: 'Staff Dehors', createdAt: now - 86400000 },
        { id: newId(), delta: 24, kind: 'earn', amountEur: 24.5, staffName: 'Staff Dehors', createdAt: now - 3 * 86400000 },
        { id: newId(), delta: 100, kind: 'earn', amountEur: 100, staffName: 'Staff Dehors', createdAt: now - 7 * 86400000 },
        { id: newId(), delta: 10, kind: 'welcome', createdAt: now - 10 * 86400000 },
      ],
    },
  };
}

function publicProfile(user: DemoUser | undefined): UserProfile | null {
  if (!user) return null;
  const { password: _password, ...profile } = user;
  return profile;
}

export function createDemoBackend(): Backend {
  let db: DemoDb | null = null;
  const listeners = new Set<() => void>();

  async function load(): Promise<DemoDb> {
    if (db) return db;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      db = raw ? (JSON.parse(raw) as DemoDb) : seed();
    } catch {
      db = seed();
    }
    return db;
  }

  async function commit() {
    if (!db) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // In demo i dati restano comunque in memoria.
    }
    listeners.forEach((l) => l());
  }

  function watch(fn: (state: DemoDb) => void) {
    let active = true;
    const run = () => {
      load().then((state) => active && fn(state));
    };
    listeners.add(run);
    run();
    return () => {
      active = false;
      listeners.delete(run);
    };
  }

  const delay = () => new Promise((r) => setTimeout(r, 250));

  return {
    mode: 'demo',

    onAuthChange(cb) {
      let last: string | null | undefined;
      return watch((state) => {
        if (state.session !== last) {
          last = state.session;
          cb(state.session);
        }
      });
    },

    async signIn(email, password) {
      await delay();
      const state = await load();
      const user = Object.values(state.users).find((u) => u.email === email.trim().toLowerCase());
      if (!user || user.password !== password) throw new AppError('Email o password non corretti.');
      state.session = user.id;
      await commit();
    },

    async signUp({ name, email, password, phone }) {
      await delay();
      const state = await load();
      const normalized = email.trim().toLowerCase();
      if (Object.values(state.users).some((u) => u.email === normalized)) {
        throw new AppError('Esiste già un account con questa email.');
      }
      const id = newId();
      state.users[id] = {
        id,
        name: name.trim(),
        email: normalized,
        phone: phone?.trim() || undefined,
        password,
        role: 'customer',
        points: Loyalty.welcomeBonus,
        totalEarned: Loyalty.welcomeBonus,
        cardCode: generateCardCode(),
        createdAt: Date.now(),
      };
      state.transactions[id] =
        Loyalty.welcomeBonus > 0
          ? [{ id: newId(), delta: Loyalty.welcomeBonus, kind: 'welcome', createdAt: Date.now() }]
          : [];
      state.session = id;
      await commit();
    },

    async signOut() {
      const state = await load();
      state.session = null;
      await commit();
    },

    async resetPassword() {
      await delay();
      throw new AppError('In modalità demo il recupero password non è disponibile.');
    },

    async deleteAccount() {
      const state = await load();
      if (!state.session) return;
      delete state.users[state.session];
      delete state.transactions[state.session];
      state.session = null;
      await commit();
    },

    subscribeProfile(uid, cb) {
      return watch((state) => cb(publicProfile(state.users[uid])));
    },

    subscribeTransactions(uid, cb, max = 50) {
      return watch((state) => cb((state.transactions[uid] ?? []).slice(0, max)));
    },

    async updateOwnProfile(uid, patch) {
      const state = await load();
      const user = state.users[uid];
      if (!user) throw new AppError('Utente non trovato.');
      if (patch.name !== undefined) user.name = patch.name.trim();
      if (patch.phone !== undefined) user.phone = patch.phone.trim() || undefined;
      await commit();
    },

    async getProfile(uid) {
      const state = await load();
      return publicProfile(state.users[uid]);
    },

    async findByCardCode(code) {
      const state = await load();
      const normalized = normalizeCardCode(code);
      return publicProfile(Object.values(state.users).find((u) => u.cardCode === normalized));
    },

    async searchCustomersByEmail(prefix) {
      const state = await load();
      const p = prefix.trim().toLowerCase();
      if (p.length < 2) return [];
      return Object.values(state.users)
        .filter((u) => u.email.startsWith(p))
        .slice(0, 10)
        .map((u) => publicProfile(u)!);
    },

    async applyPoints({ userId, delta, kind, amountEur, rewardId, note, staff }) {
      await delay();
      if (!Number.isInteger(delta) || delta === 0) throw new AppError('Numero di punti non valido.');
      const state = await load();
      const user = state.users[userId];
      if (!user) throw new AppError('Cliente non trovato.');
      if (user.points + delta < 0) throw new AppError(`Saldo insufficiente: il cliente ha ${user.points} punti.`);
      user.points += delta;
      if (delta > 0) user.totalEarned += delta;
      const list = state.transactions[userId] ?? [];
      list.unshift({
        id: newId(),
        delta,
        kind,
        amountEur,
        rewardId,
        note: note?.trim() || undefined,
        staffId: staff.id,
        staffName: staff.name,
        createdAt: Date.now(),
      });
      state.transactions[userId] = list;
      await commit();
      return publicProfile(user)!;
    },
  };
}
