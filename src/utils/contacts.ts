import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { dialog } from '@/components/dialog';

import { Venue } from '@/config/venue';

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

export const callVenue = () => open(`tel:${Venue.phone}`);
export const emailVenue = () => open(`mailto:${Venue.email}`);
export const whatsappVenue = () => {
  const number = Venue.whatsapp.replace(/[^0-9]/g, '');
  return open(`whatsapp://send?phone=${number}`, `https://wa.me/${number}`);
};
export const instagramVenue = () =>
  open(`instagram://user?username=${Venue.instagram}`, `https://instagram.com/${Venue.instagram}`);
export const openWebsite = (url: string) => open(url);

export function directionsToVenue() {
  const c = Venue.coordinates;
  const q = encodeURIComponent(Venue.address);
  const label = encodeURIComponent(Venue.name);
  if (Platform.OS === 'ios') {
    return open(c ? `maps://?daddr=${c.lat},${c.lng}&q=${label}` : `maps://?daddr=${q}`);
  }
  const web = c
    ? `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  if (Platform.OS === 'android') {
    return open(c ? `geo:${c.lat},${c.lng}?q=${c.lat},${c.lng}(${label})` : `geo:0,0?q=${q}`, web);
  }
  return open(web);
}
