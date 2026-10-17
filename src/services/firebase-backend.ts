import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import type { ContentKey, ContentMap, EventItem } from '@/content/types';

import { firebaseConfig } from '@/config/firebase';
import { Loyalty } from '@/config/loyalty';
import {
  AppError,
  generateCardCode,
  normalizeCardCode,
  plain,
  type Backend,
  type PointsTransaction,
  type UserProfile,
} from './types';

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}

function toProfile(id: string, data: DocumentData): UserProfile {
  return {
    id,
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone || undefined,
    role: data.role ?? 'customer',
    points: data.points ?? 0,
    totalEarned: data.totalEarned ?? 0,
    cardCode: data.cardCode ?? '',
    redeemed: (data.redeemed as Record<string, number>) ?? {},
    createdAt: toMillis(data.createdAt),
  };
}

function toTransaction(id: string, data: DocumentData): PointsTransaction {
  return {
    id,
    delta: data.delta ?? 0,
    kind: data.kind ?? 'adjust',
    amountEur: data.amountEur ?? undefined,
    rewardId: data.rewardId ?? undefined,
    rewardTitle: data.rewardTitle ?? undefined,
    note: data.note ?? undefined,
    staffId: data.staffId ?? undefined,
    staffName: data.staffName ?? undefined,
    createdAt: toMillis(data.createdAt),
  };
}

function createAuth(): Auth {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (Platform.OS === 'web') return getAuth(app);
  try {
    // getReactNativePersistence è esportato solo dalla build React Native di firebase/auth.
    const { getReactNativePersistence } = FirebaseAuth as unknown as {
      getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
    };
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}

export function createFirebaseBackend(): Backend {
  const auth = createAuth();
  const db: Firestore = initializeFirestore(getApp(), { experimentalAutoDetectLongPolling: true });

  const userRef = (uid: string) => doc(db, 'users', uid);
  const txCollection = (uid: string) => collection(db, 'users', uid, 'transactions');

  return {
    mode: 'firebase',

    onAuthChange(cb) {
      return onAuthStateChanged(auth, (user) => cb(user?.uid ?? null));
    },

    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    },

    async signUp({ name, email, password, phone }) {
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const uid = cred.user.uid;
      const batch = writeBatch(db);
      batch.set(userRef(uid), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        role: 'customer',
        points: Loyalty.welcomeBonus,
        totalEarned: Loyalty.welcomeBonus,
        cardCode: generateCardCode(),
        redeemed: {},
        createdAt: serverTimestamp(),
      });
      if (Loyalty.welcomeBonus > 0) {
        batch.set(doc(txCollection(uid), 'welcome'), {
          delta: Loyalty.welcomeBonus,
          kind: 'welcome',
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
    },

    async signOut() {
      await signOut(auth);
    },

    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    },

    async deleteAccount() {
      const user = auth.currentUser;
      if (!user) throw new AppError('Nessun utente collegato.');
      // Firebase richiede un accesso recente: controlliamo prima di cancellare i dati.
      const lastSignIn = Date.parse(user.metadata.lastSignInTime ?? '');
      if (!lastSignIn || Date.now() - lastSignIn > 5 * 60 * 1000) {
        throw new AppError('Per sicurezza esci, rientra e riprova subito a eliminare l\'account.');
      }
      await deleteDoc(userRef(user.uid));
      await deleteUser(user);
    },

    subscribeProfile(uid, cb) {
      return onSnapshot(
        userRef(uid),
        (snap) => cb(snap.exists() ? toProfile(snap.id, snap.data()) : null),
        () => cb(null),
      );
    },

    subscribeTransactions(uid, cb, max = 50) {
      const q = query(txCollection(uid), orderBy('createdAt', 'desc'), limit(max));
      return onSnapshot(
        q,
        (snap) => cb(snap.docs.map((d) => toTransaction(d.id, d.data({ serverTimestamps: 'estimate' })))),
        () => cb([]),
      );
    },

    async updateOwnProfile(uid, patch) {
      const data: Record<string, string | null> = {};
      if (patch.name !== undefined) data.name = patch.name.trim();
      if (patch.phone !== undefined) data.phone = patch.phone.trim() || null;
      await updateDoc(userRef(uid), data);
    },

    async getProfile(uid) {
      const snap = await getDoc(userRef(uid));
      return snap.exists() ? toProfile(snap.id, snap.data()) : null;
    },

    async findByCardCode(code) {
      const q = query(collection(db, 'users'), where('cardCode', '==', normalizeCardCode(code)), limit(1));
      const snap = await getDocs(q);
      const first = snap.docs[0];
      return first ? toProfile(first.id, first.data()) : null;
    },

    async searchCustomersByEmail(prefix) {
      const p = prefix.trim().toLowerCase();
      if (p.length < 2) return [];
      const q = query(
        collection(db, 'users'),
        where('email', '>=', p),
        where('email', '<=', `${p}`),
        limit(10),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => toProfile(d.id, d.data()));
    },

    async applyPoints({ userId, delta, kind, amountEur, rewardId, rewardTitle, singleUse, note, staff }) {
      if (!Number.isInteger(delta) || delta === 0) throw new AppError('Numero di punti non valido.');
      return runTransaction(db, async (tx) => {
        const ref = userRef(userId);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new AppError('Cliente non trovato.');
        const current = toProfile(snap.id, snap.data());
        const points = current.points + delta;
        if (points < 0) throw new AppError(`Saldo insufficiente: il cliente ha ${current.points} punti.`);
        const totalEarned = current.totalEarned + (delta > 0 ? delta : 0);
        const redeemed = { ...current.redeemed };
        if (kind === 'redeem' && rewardId) {
          if (singleUse && (redeemed[rewardId] ?? 0) > 0) {
            throw new AppError('Questo premio si può riscattare una sola volta e il cliente lo ha già usato.');
          }
          redeemed[rewardId] = (redeemed[rewardId] ?? 0) + 1;
        }
        tx.update(ref, { points, totalEarned, redeemed });
        tx.set(doc(txCollection(userId)), {
          delta,
          kind,
          amountEur: amountEur ?? null,
          rewardId: rewardId ?? null,
          rewardTitle: rewardTitle ?? null,
          note: note?.trim() || null,
          staffId: staff.id,
          staffName: staff.name,
          createdAt: serverTimestamp(),
        });
        return { ...current, points, totalEarned, redeemed };
      });
    },

    subscribeContent<K extends ContentKey>(key: K, cb: (data: ContentMap[K] | null) => void) {
      return onSnapshot(
        doc(db, 'content', key),
        (snap) => {
          if (!snap.exists()) return cb(null);
          const { updatedAt: _updatedAt, ...data } = snap.data();
          cb(data as ContentMap[K]);
        },
        () => {},
      );
    },

    async saveContent(key, data) {
      await setDoc(doc(db, 'content', key), { ...plain(data), updatedAt: serverTimestamp() });
    },

    subscribeEvents(includeDrafts, cb) {
      const col = collection(db, 'events');
      const q = includeDrafts ? query(col) : query(col, where('published', '==', true));
      return onSnapshot(
        q,
        (snap) =>
          cb(
            snap.docs
              .map((d) => ({ ...(d.data() as Omit<EventItem, 'id'>), id: d.id }))
              .sort((a, b) => a.startsAt - b.startsAt),
          ),
        () => cb([]),
      );
    },

    async saveEvent(input) {
      const ref = input.id ? doc(db, 'events', input.id) : doc(collection(db, 'events'));
      const event: EventItem = {
        id: ref.id,
        title: input.title.trim(),
        description: input.description.trim(),
        details: input.details?.trim() || undefined,
        startsAt: input.startsAt,
        published: input.published,
        createdAt: input.createdAt ?? Date.now(),
      };
      const { id: _id, ...data } = event;
      await setDoc(ref, plain(data));
      return event;
    },

    async deleteEvent(id) {
      await deleteDoc(doc(db, 'events', id));
    },

    async registerPushToken(token, uid) {
      await setDoc(doc(db, 'pushTokens', token), {
        token,
        uid: uid ?? null,
        platform: Platform.OS,
        updatedAt: serverTimestamp(),
      });
    },

    async listPushTokens() {
      const snap = await getDocs(collection(db, 'pushTokens'));
      return snap.docs.map((d) => d.id);
    },

    async removePushTokens(tokens) {
      await Promise.all(tokens.map((t) => deleteDoc(doc(db, 'pushTokens', t)).catch(() => {})));
    },
  };
}
