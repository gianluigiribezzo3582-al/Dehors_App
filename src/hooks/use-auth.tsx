import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { backend } from '@/services/backend';
import { isStaff, type UserProfile } from '@/services/types';

type AuthState = {
  /** true quando sappiamo se c'è un utente collegato e, se sì, abbiamo letto il suo profilo (e quindi il ruolo). */
  ready: boolean;
  uid: string | null;
  profile: UserProfile | null;
  isStaff: boolean;
};

const AuthContext = createContext<AuthState>({ ready: false, uid: null, profile: null, isStaff: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authKnown, setAuthKnown] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ uid: string; profile: UserProfile | null } | null>(null);

  useEffect(
    () =>
      backend.onAuthChange((next) => {
        setUid(next);
        setAuthKnown(true);
      }),
    [],
  );

  useEffect(() => {
    if (!uid) return;
    return backend.subscribeProfile(uid, (p) => setLoaded({ uid, profile: p }));
  }, [uid]);

  // Il profilo vale solo se appartiene all'utente collegato in questo momento.
  const profile = uid && loaded?.uid === uid ? loaded.profile : null;
  const ready = authKnown && (!uid || loaded?.uid === uid);

  return (
    <AuthContext.Provider value={{ ready, uid, profile, isStaff: isStaff(profile) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
