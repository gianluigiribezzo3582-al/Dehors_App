import type { WeeklyHours } from '@/content/types';

const DAY_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

type Slot = { open: string; close: string };

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function pad(time: string) {
  const [h, m = '00'] = time.split(/[:.]/);
  return `${h.padStart(2, '0')}:${m.padEnd(2, '0').slice(0, 2)}`;
}

/** «07:00-13:00, 17:00-23:00» → fasce. «Chiuso» o vuoto → nessuna fascia. */
export function parseDay(value: string): Slot[] {
  const slots: Slot[] = [];
  const re = /(\d{1,2}(?:[:.]\d{2})?)\s*[-–]\s*(\d{1,2}(?:[:.]\d{2})?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value))) slots.push({ open: pad(m[1]), close: pad(m[2]) });
  return slots;
}

/** Verifica il formato di un giorno: vuoto, «Chiuso» o fasce valide. */
export function isValidDay(value: string) {
  const v = value.trim();
  if (!v || /^chiuso$/i.test(v)) return true;
  const slots = parseDay(v);
  const valid = slots.every(
    (s) => [s.open, s.close].every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t) || t === '24:00'),
  );
  return slots.length > 0 && valid;
}

function table(hours: WeeklyHours): Record<number, Slot[]> | null {
  const days = (['0', '1', '2', '3', '4', '5', '6'] as const).map((d) => parseDay(hours[d] ?? ''));
  return days.some((d) => d.length > 0) ? Object.fromEntries(days.map((d, i) => [i, d])) : null;
}

export type OpenStatus = { open: boolean; label: string };

/** Aperto/chiuso adesso (gestisce le fasce oltre la mezzanotte). null se gli orari non sono inseriti. */
export function openStatus(hoursText: WeeklyHours, now = new Date()): OpenStatus | null {
  const hours = table(hoursText);
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

/** Righe orari da lunedì a domenica (vuoto se gli orari non sono inseriti). */
export function weeklyHours(hoursText: WeeklyHours): { day: string; value: string; today: boolean }[] {
  const hours = table(hoursText);
  if (!hours) return [];
  const today = new Date().getDay();
  return [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    day: DAY_NAMES[d],
    value: hours[d].length ? hours[d].map((s) => `${s.open} – ${s.close}`).join(', ') : 'Chiuso',
    today: d === today,
  }));
}

export const DAY_ORDER = ['1', '2', '3', '4', '5', '6', '0'] as const;
export const dayName = (d: string) => DAY_NAMES[Number(d)];
