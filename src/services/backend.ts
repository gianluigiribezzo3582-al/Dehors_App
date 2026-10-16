import { isFirebaseConfigured } from '@/config/firebase';
import { createDemoBackend } from './demo-backend';
import { createFirebaseBackend } from './firebase-backend';
import { AppError, type Backend } from './types';

export const backend: Backend = isFirebaseConfigured ? createFirebaseBackend() : createDemoBackend();

const FIREBASE_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Indirizzo email non valido.',
  'auth/invalid-credential': 'Email o password non corretti.',
  'auth/wrong-password': 'Email o password non corretti.',
  'auth/user-not-found': 'Nessun account con questa email.',
  'auth/email-already-in-use': 'Esiste già un account con questa email.',
  'auth/weak-password': 'La password deve avere almeno 6 caratteri.',
  'auth/too-many-requests': 'Troppi tentativi. Riprova tra qualche minuto.',
  'auth/network-request-failed': 'Connessione assente. Controlla la rete e riprova.',
  'auth/requires-recent-login': 'Per sicurezza esci, rientra e riprova.',
  'permission-denied': 'Operazione non consentita per questo account.',
  unavailable: 'Servizio non raggiungibile. Controlla la connessione.',
};

export function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  const code = (error as { code?: string })?.code;
  if (code && FIREBASE_MESSAGES[code]) return FIREBASE_MESSAGES[code];
  return 'Si è verificato un errore. Riprova.';
}
