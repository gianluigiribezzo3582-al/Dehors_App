import { Venue } from '@/config/venue';

const DAY_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export type OpenStatus = { open: boolean; label: string };

/** Calcola se il locale è aperto ora, gestendo le fasce che passano la mezzanotte. */
export function openStatus(now = new Date()): OpenStatus {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const yesterday = (day + 6) % 7;

  for (const slot of Venue.hours[yesterday] ?? []) {
    const open = toMinutes(slot.open);
    const close = toMinutes(slot.close);
    if (close <= open && minutes < close) return { open: true, label: `Aperto fino alle ${slot.close}` };
  }
  for (const slot of Venue.hours[day] ?? []) {
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
    const first = Venue.hours[d]?.[0];
    if (first) {
      return { open: false, label: i === 1 ? `Apre domani alle ${first.open}` : `Apre ${DAY_NAMES[d].toLowerCase()} alle ${first.open}` };
    }
  }
  return { open: false, label: 'Chiuso' };
}

/** Righe orari da lunedì a domenica. */
export function weeklyHours(): { day: string; value: string; today: boolean }[] {
  const today = new Date().getDay();
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const slots = Venue.hours[d] ?? [];
    return {
      day: DAY_NAMES[d],
      value: slots.length ? slots.map((s) => `${s.open} – ${s.close}`).join(', ') : 'Chiuso',
      today: d === today,
    };
  });
}
