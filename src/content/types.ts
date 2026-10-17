import type { MenuCategory } from '@/data/menu';

/** Premio del programma fedeltà, modificabile dallo staff. */
export type RewardDef = {
  id: string;
  title: string;
  description: string;
  cost: number;
  /** Nome icona Ionicons. */
  icon: string;
  /** Colore di sfondo della card. */
  tint: string;
  /** true = riscattabile più volte; false = una sola volta per cliente. */
  repeatable: boolean;
  /** false = nascosto ai clienti. */
  active: boolean;
};

/** Evento mostrato in Home. */
export type EventItem = {
  id: string;
  title: string;
  description: string;
  /** Inizio, in millisecondi. */
  startsAt: number;
  /** Testo libero facoltativo, es. «dalle 19 alle 23» o «ingresso libero». */
  details?: string;
  published: boolean;
  createdAt: number;
};

/** Giorni: '0' = domenica … '6' = sabato. Valore: «07:00-13:00, 17:00-23:00», «Chiuso» o vuoto. */
export type WeeklyHours = Record<'0' | '1' | '2' | '3' | '4' | '5' | '6', string>;

/** Testi, contatti e regole modificabili dallo staff. */
export type SiteTexts = {
  welcomeTitle: string;
  welcomeBody: string;
  /** Avviso in evidenza in Home (vuoto = nascosto). */
  announcement: string;
  rewardsInfo: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  website: string;
  address: string;
  hours: WeeklyHours;
  pointsPerEuro: number;
};

/** Piatto del pranzo del giorno (senza quantità). */
export type LunchDish = {
  id: string;
  name: string;
  description?: string;
  price?: number;
};

/** Pranzo del giorno: visibile ai clienti solo nella fascia oraria indicata. */
export type LunchMenu = {
  dishes: LunchDish[];
  /** Nota sotto i piatti, es. «Acqua e coperto inclusi». */
  note: string;
  /** Inizio e fine visibilità, «HH:MM». */
  from: string;
  to: string;
};

/** Prodotti esauriti in tempo reale: id voce (menù o pranzo) → true. */
export type Availability = { soldOut: Record<string, boolean> };

export type ContentMap = {
  menu: { categories: MenuCategory[] };
  rewards: { items: RewardDef[] };
  texts: SiteTexts;
  lunch: LunchMenu;
  availability: Availability;
};

export type ContentKey = keyof ContentMap;
