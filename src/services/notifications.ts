import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { backend } from './backend';
import { AppError } from './types';

/**
 * Notifiche push tramite il servizio gratuito di Expo (https://exp.host).
 *
 * Per funzionare su Android servono, una volta sola (vedi README):
 *  - un progetto EAS (`npx eas-cli init`), il cui ID finisce in app.json → extra.eas.projectId;
 *  - il file google-services.json di Firebase (app.json → android.googleServicesFile);
 *  - le credenziali FCM caricate su expo.dev.
 * Finché manca il projectId la registrazione viene saltata senza errori.
 */

const CHANNEL_ID = 'eventi';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export type PushData = { eventId?: string };

function projectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;
}

export function pushAvailable() {
  return Platform.OS !== 'web' && backend.mode === 'firebase' && !!projectId();
}

/** Da chiamare all'avvio: come mostrare le notifiche ad app aperta e canale Android. */
export function configureNotifications() {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Eventi e novità',
      importance: AndroidImportance.HIGH,
      lightColor: '#2A3B31',
    }).catch(() => {});
  }
}

/** Chiede il permesso e salva il token del telefono. Non lancia mai errori. */
export async function registerForPush(uid: string | null) {
  try {
    if (Platform.OS === 'web' || !Device.isDevice) return;
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted && current.canAskAgain) granted = (await Notifications.requestPermissionsAsync()).granted;
    if (!granted || !pushAvailable()) return;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: projectId() });
    await backend.registerPushToken(token, uid);
  } catch {
    // Registrazione facoltativa: in caso di errore l'app funziona comunque.
  }
}

/**
 * Invia una notifica a tutti i telefoni registrati (solo staff).
 * In modalità demo, o senza progetto EAS, mostra la notifica solo su questo telefono come anteprima.
 */
export async function sendToEveryone(title: string, body: string, data: PushData = {}) {
  if (Platform.OS === 'web') throw new AppError('Le notifiche si inviano dall\'app sul telefono.');

  if (!pushAvailable()) {
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) throw new AppError('Consenti le notifiche per vedere l\'anteprima.');
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
    return { sent: 1, failed: 0, preview: true };
  }

  const tokens = await backend.listPushTokens();
  if (tokens.length === 0) return { sent: 0, failed: 0, preview: false };

  let sent = 0;
  let failed = 0;
  const invalid: string[] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    const chunk = tokens.slice(i, i + 100);
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(
        chunk.map((to) => ({ to, title, body, data, sound: 'default', channelId: CHANNEL_ID, priority: 'high' })),
      ),
    });
    if (!res.ok) {
      failed += chunk.length;
      continue;
    }
    const json = (await res.json()) as { data?: { status: string; details?: { error?: string } }[] };
    (json.data ?? []).forEach((ticket, idx) => {
      if (ticket.status === 'ok') sent++;
      else {
        failed++;
        if (ticket.details?.error === 'DeviceNotRegistered') invalid.push(chunk[idx]);
      }
    });
  }
  if (invalid.length) await backend.removePushTokens(invalid).catch(() => {});
  return { sent, failed, preview: false };
}

/** Collega il tocco su una notifica all'apertura dell'evento. */
export function onNotificationOpened(handler: (data: PushData) => void) {
  if (Platform.OS === 'web') return () => {};
  const last = Notifications.getLastNotificationResponse();
  if (last) handler(last.notification.request.content.data as PushData);
  const sub = Notifications.addNotificationResponseReceivedListener((r) =>
    handler(r.notification.request.content.data as PushData),
  );
  return () => sub.remove();
}
