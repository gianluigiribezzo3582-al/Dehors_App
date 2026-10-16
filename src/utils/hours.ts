import { Venue } from '@/config/venue';

const DAY_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export type OpenStatus = { open: boolean; label: string };

/** Calcola se il locale è aperto ora (gestisce le fasce oltre la mezzanotte). null se gli orari non sono configurati. */
export function openStatus(now = new Date()): OpenStatus | null {
  const hours = Venue.hours;
  if (!hours) return null;
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const yesterday = (day + 6) % 7;

  for (const slot of hours[yesterday] ?? []) {
    const open = toMinutes(slot.open);
    const close = toMinutes(slot.close);
    if (close <= open && minutes < close) return { open: true, label: `Aperto fino alle ${slot.close}` };
  }
  for (const slot of hours[day] ?? []) {
    const open = toMinutes(slot.open);
    const close = toMinutes(slot.close);
    const overnight = close <= open;
    if (minutes >= open && (overnight || minutes < close)) {
      return { open: true, label: `Aperto fino alle ${slot.close}` };
    }
    if (minutes < open) return { open: false, label: `Apre alle ${slot.open}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const first = hours[d]?.[0];
    if (first) {
      return { open: false, label: i === 1 ? `Apre domani alle ${first.open}` : `Apre ${DAY_NAMES[d].toLowerCase()} alle ${first.open}` };
    }
  }
  return { open: false, label: 'Chiuso' };
}

/** Righe orari da lunedì a domenica (vuoto se gli orari non sono configurati). */
export function weeklyHours(): { day: string; value: string; today: boolean }[] {
  const hours = Venue.hours;
  if (!hours) return [];
  const today = new Date().getDay();
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const slots = hours[d] ?? [];
    return {
      day: DAY_NAMES[d],
      value: slots.length ? slots.map((s) => `${s.open} – ${s.close}`).join(', ') : 'Chiuso',
      today: d === today,
    };
  });
}
