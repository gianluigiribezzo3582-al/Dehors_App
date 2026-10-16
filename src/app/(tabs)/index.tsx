import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { DemoBanner } from '@/components/demo-banner';
import { Logo } from '@/components/logo';
import { RewardCard } from '@/components/reward-card';
import { AppText, Button, Card, ProgressBar, SectionHeader, Screen, type IconName } from '@/components/ui';
import { tierFor } from '@/config/loyalty';
import { Venue } from '@/config/venue';
import { Rewards } from '@/data/rewards';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/colors';
import { callVenue, directionsToVenue, whatsappVenue } from '@/utils/contacts';
import { firstName } from '@/utils/format';
import { openStatus } from '@/utils/hours';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}>
      <Ionicons name={icon} size={22} color={theme.primary} />
      <AppText variant="caption" color={theme.text} style={{ fontWeight: '600' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { profile, uid } = useAuth();
  const status = openStatus();

  const nextReward = profile ? Rewards.find((r) => r.cost > profile.points) : undefined;
  const available = profile ? Rewards.filter((r) => r.cost <= profile.points) : [];
  const tier = profile ? tierFor(profile.totalEarned) : null;

  return (
    <Screen>
      <View style={styles.header}>
        <Logo />
        <View style={[styles.status, { backgroundColor: theme.surface }]}>
          <View style={[styles.dot, { backgroundColor: status.open ? theme.success : theme.danger }]} />
          <AppText variant="caption" color={theme.text}>
            {status.label}
          </AppText>
        </View>
      </View>

      <View style={{ gap: 2 }}>
        <AppText variant="caption">{Venue.tagline}</AppText>
        <AppText variant="display">
          {greeting()}
          {profile ? `, ${firstName(profile.name)}` : ''}
        </AppText>
      </View>

      <DemoBanner />

      {profile ? (
        <Pressable onPress={() => router.push('/card')}>
          <View style={styles.pointsCard}>
            <View style={styles.pointsTop}>
              <View>
                <AppText variant="overline" color={Palette.cream}>
                  I tuoi punti
                </AppText>
                <AppText variant="display" color="#FFFFFF" style={{ fontSize: 44, lineHeight: 50 }}>
                  {profile.points}
                </AppText>
              </View>
              <View style={styles.qrHint}>
                <Ionicons name="qr-code" size={26} color="#FFFFFF" />
                <AppText variant="caption" color={Palette.cream}>
                  Mostra tessera
                </AppText>
              </View>
            </View>
            {nextReward ? (
              <View style={{ gap: Spacing.xs }}>
                <ProgressBar value={profile.points / nextReward.cost} color="#E8D9B5" />
                <AppText variant="caption" color={Palette.cream}>
                  {nextReward.cost - profile.points} punti a «{nextReward.title}»
                </AppText>
              </View>
            ) : (
              <AppText variant="caption" color={Palette.cream}>
                Hai punti sufficienti per tutti i premi!
              </AppText>
            )}
            {tier && (
              <AppText variant="overline" color={tier.current.color}>
                Livello {tier.current.name}
              </AppText>
            )}
          </View>
        </Pressable>
      ) : uid ? null : (
        <Card style={{ gap: Spacing.md }}>
          <AppText variant="heading">Unisciti al programma fedeltà</AppText>
          <AppText variant="body" color={theme.textSecondary}>
            Registrati per ricevere la tua tessera digitale con QR: accumuli punti a ogni consumazione e li trasformi
            in premi e sconti.
          </AppText>
          <Button title="Crea la tua tessera" icon="sparkles-outline" onPress={() => router.push('/register')} />
          <Button title="Accedi" variant="ghost" onPress={() => router.push('/login')} />
        </Card>
      )}

      <View style={styles.actions}>
        <QuickAction icon="call-outline" label="Chiama" onPress={callVenue} />
        <QuickAction icon="restaurant-outline" label="Menù" onPress={() => router.push('/menu')} />
        <QuickAction icon="navigate-outline" label="Indicazioni" onPress={directionsToVenue} />
        <QuickAction icon="logo-whatsapp" label="WhatsApp" onPress={whatsappVenue} />
      </View>

      {available.length > 0 && (
        <>
          <SectionHeader title="Premi disponibili" />
          {available.slice(0, 2).map((r) => (
            <RewardCard key={r.id} reward={r} points={profile?.points ?? null} compact onPress={() => router.push(`/reward/${r.id}`)} />
          ))}
        </>
      )}

      <SectionHeader
        title="Premi del programma"
        action={<Button title="Vedi tutti" variant="ghost" onPress={() => router.push('/rewards')} style={{ minHeight: 32, paddingHorizontal: 0 }} />}
      />
      {Rewards.filter((r) => !available.includes(r))
        .slice(0, 2)
        .map((r) => (
          <RewardCard key={r.id} reward={r} points={profile?.points ?? null} compact onPress={() => router.push(`/reward/${r.id}`)} />
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pointsCard: { backgroundColor: Palette.green, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  pointsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  qrHint: { alignItems: 'center', gap: 4 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
