import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { backend } from '@/services/backend';
import { isStaff, type UserProfile } from '@/services/types';

type AuthState = {
  /** true quando sappiamo se c'è un utente collegato. */
  ready: boolean;
  uid: string | null;
  profile: UserProfile | null;
  isStaff: boolean;
};

const AuthContext = createContext<AuthState>({ ready: false, uid: null, profile: null, isStaff: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(
    () =>
      backend.onAuthChange((next) => {
        setUid(next);
        if (!next) setProfile(null);
        setReady(true);
      }),
    [],
  );

  useEffect(() => {
    if (!uid) return;
    return backend.subscribeProfile(uid, setProfile);
  }, [uid]);

  return (
    <AuthContext.Provider value={{ ready, uid, profile, isStaff: isStaff(profile) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
