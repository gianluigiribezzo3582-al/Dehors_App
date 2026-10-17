import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { dialog } from '@/components/dialog';
import type { SiteTexts } from '@/content/types';

async function open(url: string, fallback?: string) {
  try {
    await Linking.openURL(url);
  } catch {
    if (fallback) {
      try {
        await Linking.openURL(fallback);
        return;
      } catch {}
    }
    dialog.alert('Impossibile aprire il collegamento');
  }
}

/** «080 975 3266» → «+390809753266» (aggiunge il prefisso italiano se manca). */
export function toDialable(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, '').replace(/^00/, '+');
  return cleaned.startsWith('+') ? cleaned : `+39${cleaned}`;
}

export const callNumber = (phone: string) => open(`tel:${toDialable(phone)}`);
export const sendEmail = (email: string) => open(`mailto:${email}`);
export const openWebsite = (url: string) => open(/^https?:\/\//.test(url) ? url : `https://${url}`);

export function openWhatsapp(phone: string) {
  const number = toDialable(phone).replace('+', '');
  return open(`whatsapp://send?phone=${number}`, `https://wa.me/${number}`);
}

export function openInstagram(handle: string) {
  const user = handle.replace(/^@/, '').trim();
  return open(`instagram://user?username=${user}`, `https://instagram.com/${user}`);
}

/** Indicazioni: Apple Maps su iPhone, Google Maps altrove (link impostabili dallo staff). */
export function directionsTo(t: SiteTexts) {
  const q = encodeURIComponent(t.address);
  if (Platform.OS === 'ios') {
    return open(t.appleMapsUrl || `https://maps.apple.com/?daddr=${q}`);
  }
  const fallback = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  return open(t.googleMapsUrl || fallback, fallback);
}
