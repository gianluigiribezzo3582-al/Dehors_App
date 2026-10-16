import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Venue } from '@/config/venue';
import { tierFor } from '@/config/loyalty';
import { qrPayloadFor, type UserProfile } from '@/services/types';
import { Palette, Radius, Spacing } from '@/theme/colors';
import { AppText } from './ui';

/** Tessera digitale con QR da mostrare al bancone. */
export function LoyaltyCard({ profile }: { profile: UserProfile }) {
  const { current } = tierFor(profile.totalEarned);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <AppText variant="overline" color={Palette.cream}>
            {Venue.name} · Fidelity
          </AppText>
          <AppText variant="title" color="#FFFFFF" numberOfLines={1}>
            {profile.name}
          </AppText>
        </View>
        <View style={[styles.tier, { borderColor: current.color }]}>
          <AppText variant="overline" color={current.color}>
            {current.name}
          </AppText>
        </View>
      </View>

      <View style={styles.qrWrap}>
        <QRCode value={qrPayloadFor(profile.id)} size={200} color={Palette.greenDeep} backgroundColor="#FFFFFF" />
      </View>

      <View style={styles.footer}>
        <View>
          <AppText variant="overline" color={Palette.cream}>
            Codice tessera
          </AppText>
          <AppText variant="heading" color="#FFFFFF" style={{ letterSpacing: 3 }}>
            {profile.cardCode.replace(/(.{4})/, '$1 ')}
          </AppText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <AppText variant="overline" color={Palette.cream}>
            Saldo
          </AppText>
          <AppText variant="title" color="#FFFFFF">
            {profile.points} pt
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.green,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
  tier: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  qrWrap: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
});
