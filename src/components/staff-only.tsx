import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { Loading } from './ui';

/**
 * Mostra i contenuti solo a un account staff/admin già verificato.
 * Finché il ruolo non è noto mostra un caricamento; chi non è staff torna alla Home.
 */
export function StaffOnly({ children }: { children: ReactNode }) {
  const { ready, isStaff } = useAuth();
  if (isStaff) return <>{children}</>;
  if (!ready) return <Loading />;
  return <Redirect href="/" />;
}
