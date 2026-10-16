import { useEffect, useState } from 'react';

import { backend } from '@/services/backend';
import type { PointsTransaction } from '@/services/types';

export function useTransactions(uid: string | null | undefined, max = 50) {
  const [state, setState] = useState<{ uid: string; items: PointsTransaction[] } | null>(null);
  useEffect(() => {
    if (!uid) return;
    return backend.subscribeTransactions(uid, (items) => setState({ uid, items }), max);
  }, [uid, max]);
  return state && state.uid === uid ? state.items : [];
}
