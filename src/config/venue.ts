/**
 * Informazioni del locale (dal biglietto da visita).
 */
export const Venue = {
  name: 'Dehors',
  /** Seconda riga del marchio. */
  subtitle: 'CAFÈ-BISTROT',
  /** Nome completo, usato per indicazioni e testi. */
  fullName: 'Dehors Cafè-Bistrot',
  /** Numero fisso, in formato internazionale senza spazi: usato dal pulsante "Chiama". */
  phone: '+390809753266',
  phoneDisplay: '080 975 3266',
  /** Cellulare (chiamate e WhatsApp). */
  mobile: '+393883282021',
  mobileDisplay: '388 328 2021',
  whatsapp: '+393883282021',
  email: 'ges.drinkfood@gmail.com',
  pec: 'ges.drinkfood@pec.it',
  /** Nome utente Instagram senza @ (vuoto = voce nascosta). */
  instagram: '',
  /** Link completo alla pagina Facebook (vuoto = voce nascosta). */
  facebook: '',
  website: '',
  address: 'Via Giuseppe Re David 197, 70125 Bari',
  /** Coordinate per "Indicazioni" (lascia null per cercare per indirizzo). */
  coordinates: null as { lat: number; lng: number } | null,
  /** Dati societari mostrati in fondo alla pagina Info. */
  company: {
    name: 'G.E.S. Drink&Food srls',
    vatNumber: '08572000720',
  },
  /**
   * Orari di apertura (null = sezione nascosta finché non vengono inseriti).
   * Giorni: 0 = domenica … 6 = sabato. Ogni giorno può avere più fasce; [] = chiuso.
   * Orari oltre la mezzanotte: es. { open: '18:00', close: '02:00' }.
   * Esempio:
   *   hours: {
   *     0: [{ open: '08:00', close: '13:00' }, { open: '17:00', close: '23:00' }],
   *     1: [],
   *     2: [{ open: '07:00', close: '22:00' }],
   *     ...
   *   },
   */
  hours: null as Record<number, { open: string; close: string }[]> | null,
};
