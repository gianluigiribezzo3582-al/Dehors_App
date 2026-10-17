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
      return `Premio: ${tx.rewardTitle ?? 'riscattato'}`;
    default:
      return tx.note || (tx.delta > 0 ? 'Punti aggiunti' : 'Punti rimossi');
  }
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? '';
}

/** «sabato 25 ottobre · 21:00» */
export function formatEventDate(ms: number) {
  const d = new Date(ms);
  const day = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
}

/** «oggi», «domani» o null. */
export function relativeDay(ms: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((ms - start.getTime()) / 86400000);
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Domani';
  return null;
}
