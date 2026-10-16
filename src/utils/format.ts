import { rewardById } from '@/data/rewards';
import type { PointsTransaction } from '@/services/types';

export function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(ms: number) {
  const d = new Date(ms);
  return `${formatDate(ms)} · ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatEuro(value: number) {
  return `€ ${value.toFixed(2).replace('.', ',')}`;
}

export function transactionTitle(tx: PointsTransaction) {
  switch (tx.kind) {
    case 'welcome':
      return 'Bonus di benvenuto';
    case 'earn':
      return tx.amountEur ? `Consumazione ${formatEuro(tx.amountEur)}` : 'Punti accumulati';
    case 'redeem':
      return `Premio: ${rewardById(tx.rewardId)?.title ?? 'riscattato'}`;
    default:
      return tx.note || (tx.delta > 0 ? 'Punti aggiunti' : 'Punti rimossi');
  }
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? '';
}
