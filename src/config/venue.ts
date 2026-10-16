/**
 * Informazioni del locale.
 * Sostituisci i valori segnaposto con i contatti ufficiali.
 */
export const Venue = {
  name: 'Dehors',
  tagline: 'Caffetteria · Cocktail bar',
  /** Numero in formato internazionale, senza spazi: usato per "Chiama" e WhatsApp. */
  phone: '+390000000000',
  /** Numero mostrato a schermo. */
  phoneDisplay: '+39 000 000 0000',
  whatsapp: '+390000000000',
  email: 'info@dehors.example',
  instagram: 'dehors',
  facebook: '',
  website: '',
  address: 'Via Esempio 1, 00000 Città',
  /** Coordinate per "Indicazioni" (lascia null per cercare per indirizzo). */
  coordinates: null as { lat: number; lng: number } | null,
  /**
   * Orari di apertura. Giorni: 0 = domenica … 6 = sabato.
   * Ogni giorno può avere più fasce; usa [] per i giorni di chiusura.
   * Orari oltre la mezzanotte: es. { open: '18:00', close: '02:00' }.
   */
  hours: {
    0: [{ open: '08:00', close: '01:00' }],
    1: [],
    2: [{ open: '07:00', close: '01:00' }],
    3: [{ open: '07:00', close: '01:00' }],
    4: [{ open: '07:00', close: '01:00' }],
    5: [{ open: '07:00', close: '02:00' }],
    6: [{ open: '08:00', close: '02:00' }],
  } as Record<number, { open: string; close: string }[]>,
};

/**
 * Logo ufficiale: quando lo hai, salvalo in assets/images/logo.png e sostituisci
 * `null` con `require('@/assets/images/logo.png')`.
 */
export const VenueLogo: number | null = null;
