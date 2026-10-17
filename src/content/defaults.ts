import { Loyalty } from '@/config/loyalty';
import { Venue } from '@/config/venue';
import { Menu } from '@/data/menu';
import { Rewards } from '@/data/rewards';
import type { ContentMap, LunchMenu, SiteTexts } from './types';

/**
 * Contenuti iniziali: usati al primo avvio e finché lo staff non salva
 * una versione nel database. Dopo, fanno fede i dati online.
 */
export const DefaultTexts: SiteTexts = {
  welcomeTitle: 'Unisciti al programma fedeltà',
  welcomeBody:
    'Registrati per ricevere la tua tessera digitale con QR: accumuli punti a ogni consumazione e li trasformi in premi e sconti.',
  announcement: '',
  rewardsInfo: 'Per riscattare un premio mostra la tessera al personale: i punti verranno scalati dal tuo saldo.',
  phone: Venue.phoneDisplay,
  mobile: Venue.mobileDisplay,
  whatsapp: Venue.mobileDisplay,
  email: Venue.email,
  instagram: Venue.instagram,
  facebook: Venue.facebook,
  website: Venue.website,
  address: Venue.address,
  hours: { '0': '', '1': '', '2': '', '3': '', '4': '', '5': '', '6': '' },
  pointsPerEuro: Loyalty.pointsPerEuro,
};

export const DefaultLunch: LunchMenu = { dishes: [], note: '', from: '10:00', to: '15:00' };

export const DefaultContent: ContentMap = {
  menu: { categories: Menu },
  rewards: {
    items: Rewards.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      cost: r.cost,
      icon: r.icon,
      tint: r.tint,
      repeatable: true,
      active: true,
    })),
  },
  texts: DefaultTexts,
  lunch: DefaultLunch,
  availability: { soldOut: {} },
};

/** Unisce i testi salvati con i valori predefiniti (campi aggiunti in versioni successive). */
export function withTextDefaults(texts: Partial<SiteTexts> | null | undefined): SiteTexts {
  return { ...DefaultTexts, ...(texts ?? {}), hours: { ...DefaultTexts.hours, ...(texts?.hours ?? {}) } };
}
