import AsyncStorage from '@react-native-async-storage/async-storage';

import { Loyalty } from '@/config/loyalty';
import type { ContentMap, EventItem } from '@/content/types';
import {
  AppError,
  generateCardCode,
  newId,
  normalizeCardCode,
  plain,
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
  content: Partial<ContentMap>;
  events: EventItem[];
  pushTokens: string[];
};

const STORAGE_KEY = 'dehors-demo-db-v1';
export const DEMO_STAFF = { email: 'staff@dehors.demo', password: 'staff123' };

function seed(): DemoDb {
  const staffId = 'demo-staff';
  const customerId = 'demo-cliente';
  const now = Date.now();
  return {
    session: null,
    content: {},
    events: [],
    pushTokens: [],
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
        redeemed: {},
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
        redeemed: { colazione: 1 },
        createdAt: now,
      },
    },
    transactions: {
      [customerId]: [
        { id: newId(), delta: -50, kind: 'redeem', rewardId: 'colazione', rewardTitle: 'Colazione', staffName: 'Staff Dehors', createdAt: now - 86400000 },
        { id: newId(), delta: 24, kind: 'earn', amountEur: 24.5, staffName: 'Staff Dehors', createdAt: now - 3 * 86400000 },
        { id: newId(), delta: 100, kind: 'earn', amountEur: 100, staffName: 'Staff Dehors', createdAt: now - 7 * 86400000 },
        { id: newId(), delta: 10, kind: 'welcome', createdAt: now - 10 * 86400000 },
      ],
    },
  };
}

function isStaffSession(state: DemoDb) {
  const role = state.session ? state.users[state.session]?.role : undefined;
  return role === 'staff' || role === 'admin';
}

/** Stesse regole di firestore.rules: i dati altrui e la gestione punti sono solo per lo staff. */
function requireStaff(state: DemoDb) {
  if (!isStaffSession(state)) throw new AppError('Operazione riservata allo staff.');
}

function canRead(state: DemoDb, uid: string) {
  return state.session === uid || isStaffSession(state);
}

function publicProfile(user: DemoUser | undefined): UserProfile | null {
  if (!user) return null;
  const { password: _password, ...profile } = user;
  return profile;
}

/** Completa i dati salvati da versioni precedenti dell'app. */
function normalize(state: DemoDb): DemoDb {
  state.content ??= {};
  state.events ??= [];
  state.pushTokens ??= [];
  Object.values(state.users).forEach((u) => {
    u.redeemed ??= {};
  });
  return state;
}

export function createDemoBackend(): Backend {
  let db: DemoDb | null = null;
  const listeners = new Set<() => void>();

  async function load(): Promise<DemoDb> {
    if (db) return db;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      db = raw ? normalize(JSON.parse(raw) as DemoDb) : seed();
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
        redeemed: {},
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
      return watch((state) => cb(canRead(state, uid) ? publicProfile(state.users[uid]) : null));
    },

    subscribeTransactions(uid, cb, max = 50) {
      return watch((state) => cb(canRead(state, uid) ? (state.transactions[uid] ?? []).slice(0, max) : []));
    },

    async updateOwnProfile(uid, patch) {
      const state = await load();
      if (state.session !== uid) throw new AppError('Operazione non consentita.');
      const user = state.users[uid];
      if (!user) throw new AppError('Utente non trovato.');
      if (patch.name !== undefined) user.name = patch.name.trim();
      if (patch.phone !== undefined) user.phone = patch.phone.trim() || undefined;
      await commit();
    },

    async getProfile(uid) {
      const state = await load();
      if (!canRead(state, uid)) throw new AppError('Operazione non consentita.');
      return publicProfile(state.users[uid]);
    },

    async findByCardCode(code) {
      const state = await load();
      requireStaff(state);
      const normalized = normalizeCardCode(code);
      return publicProfile(Object.values(state.users).find((u) => u.cardCode === normalized));
    },

    async searchCustomersByEmail(prefix) {
      const state = await load();
      requireStaff(state);
      const p = prefix.trim().toLowerCase();
      if (p.length < 2) return [];
      return Object.values(state.users)
        .filter((u) => u.email.startsWith(p))
        .slice(0, 10)
        .map((u) => publicProfile(u)!);
    },

    async listStaff() {
      const state = await load();
      requireStaff(state);
      return Object.values(state.users)
        .filter((u) => u.role === 'staff' || u.role === 'admin')
        .map((u) => publicProfile(u)!)
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async setRole(uid, role) {
      const state = await load();
      const me = state.session ? state.users[state.session] : undefined;
      if (me?.role !== 'admin') throw new AppError('Solo il titolare può gestire lo staff.');
      if (uid === me.id) throw new AppError('Non puoi cambiare il tuo stesso ruolo.');
      const user = state.users[uid];
      if (!user) throw new AppError('Utente non trovato.');
      if (user.role === 'admin') throw new AppError('Non puoi modificare un altro titolare.');
      user.role = role;
      await commit();
    },

    async applyPoints({ userId, delta, kind, amountEur, rewardId, rewardTitle, singleUse, note, staff }) {
      await delay();
      if (!Number.isInteger(delta) || delta === 0) throw new AppError('Numero di punti non valido.');
      const state = await load();
      requireStaff(state);
      const staffId = state.session!;
      const user = state.users[userId];
      if (!user) throw new AppError('Cliente non trovato.');
      if (user.points + delta < 0) throw new AppError(`Saldo insufficiente: il cliente ha ${user.points} punti.`);
      if (kind === 'redeem' && rewardId) {
        if (singleUse && (user.redeemed[rewardId] ?? 0) > 0) {
          throw new AppError('Questo premio si può riscattare una sola volta e il cliente lo ha già usato.');
        }
        user.redeemed[rewardId] = (user.redeemed[rewardId] ?? 0) + 1;
      }
      user.points += delta;
      if (delta > 0) user.totalEarned += delta;
      const list = state.transactions[userId] ?? [];
      list.unshift({
        id: newId(),
        delta,
        kind,
        amountEur,
        rewardId,
        rewardTitle,
        note: note?.trim() || undefined,
        staffId,
        staffName: state.users[staffId]?.name ?? staff.name,
        createdAt: Date.now(),
      });
      state.transactions[userId] = list;
      await commit();
      return publicProfile(user)!;
    },

    subscribeContent(key, cb) {
      return watch((state) => cb((state.content[key] as never) ?? null));
    },

    async saveContent(key, data) {
      const state = await load();
      requireStaff(state);
      (state.content as Record<string, unknown>)[key] = plain(data);
      await commit();
    },

    async setSoldOut(itemId, soldOut) {
      const state = await load();
      requireStaff(state);
      const current = state.content.availability ?? { soldOut: {} };
      state.content.availability = { soldOut: { ...current.soldOut, [itemId]: soldOut } };
      await commit();
    },

    subscribeEvents(includeDrafts, cb) {
      return watch((state) => {
        const staff = includeDrafts && isStaffSession(state);
        cb(
          state.events
            .filter((e) => staff || e.published)
            .slice()
            .sort((a, b) => a.startsAt - b.startsAt),
        );
      });
    },

    async saveEvent(input) {
      const state = await load();
      requireStaff(state);
      const event: EventItem = plain({
        id: input.id ?? newId(),
        title: input.title.trim(),
        description: input.description.trim(),
        details: input.details?.trim() || undefined,
        startsAt: input.startsAt,
        published: input.published,
        createdAt: input.createdAt ?? Date.now(),
      });
      state.events = [...state.events.filter((e) => e.id !== event.id), event];
      await commit();
      return event;
    },

    async deleteEvent(id) {
      const state = await load();
      requireStaff(state);
      state.events = state.events.filter((e) => e.id !== id);
      await commit();
    },

    async registerPushToken(token) {
      const state = await load();
      if (!state.pushTokens.includes(token)) state.pushTokens.push(token);
      await commit();
    },

    async listPushTokens() {
      const state = await load();
      requireStaff(state);
      return [...state.pushTokens];
    },

    async removePushTokens(tokens) {
      const state = await load();
      state.pushTokens = state.pushTokens.filter((t) => !tokens.includes(t));
      await commit();
    },
  };
}
