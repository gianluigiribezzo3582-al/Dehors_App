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
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import { firebaseConfig } from '@/config/firebase';
import { Loyalty } from '@/config/loyalty';
import {
  AppError,
  generateCardCode,
  normalizeCardCode,
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

    async applyPoints({ userId, delta, kind, amountEur, rewardId, note, staff }) {
      if (!Number.isInteger(delta) || delta === 0) throw new AppError('Numero di punti non valido.');
      return runTransaction(db, async (tx) => {
        const ref = userRef(userId);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new AppError('Cliente non trovato.');
        const current = toProfile(snap.id, snap.data());
        const points = current.points + delta;
        if (points < 0) throw new AppError(`Saldo insufficiente: il cliente ha ${current.points} punti.`);
        const totalEarned = current.totalEarned + (delta > 0 ? delta : 0);
        tx.update(ref, { points, totalEarned });
        tx.set(doc(txCollection(userId)), {
          delta,
          kind,
          amountEur: amountEur ?? null,
          rewardId: rewardId ?? null,
          note: note?.trim() || null,
          staffId: staff.id,
          staffName: staff.name,
          createdAt: serverTimestamp(),
        });
        return { ...current, points, totalEarned };
      });
    },
  };
}
