import { router } from 'expo-router';
import { View } from 'react-native';

import { LoginPrompt } from '@/components/login-prompt';
import { RewardCard } from '@/components/reward-card';
import { AppText, Card, SectionHeader, Screen } from '@/components/ui';
import { Rewards } from '@/data/rewards';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';

export default function RewardsScreen() {
  const theme = useTheme();
  const { uid, profile } = useAuth();
  const points = profile?.points ?? null;
  const unlocked = points === null ? [] : Rewards.filter((r) => r.cost <= points);
  const locked = points === null ? Rewards : Rewards.filter((r) => r.cost > points);

  return (
    <Screen>
      <AppText variant="display">Premi</AppText>

      {profile ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <AppText variant="overline">Saldo attuale</AppText>
            <AppText variant="title" color={theme.primary}>
              {profile.points} punti
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="overline">Sbloccati</AppText>
            <AppText variant="title">
              {unlocked.length}/{Rewards.length}
            </AppText>
          </View>
        </Card>
      ) : !uid ? (
        <LoginPrompt
          icon="gift-outline"
          title="Accumula e riscatta"
          message="Con la tessera Dehors ogni consumazione vale punti da trasformare in premi e sconti."
        />
      ) : null}

      {unlocked.length > 0 && (
        <>
          <SectionHeader title="Puoi riscattarli ora" />
          {unlocked.map((r) => (
            <RewardCard key={r.id} reward={r} points={points} onPress={() => router.push(`/reward/${r.id}`)} />
          ))}
        </>
      )}

      {locked.length > 0 && (
        <>
          <SectionHeader title={points === null ? 'Catalogo premi' : 'Prossimi traguardi'} />
          <View style={{ gap: Spacing.md }}>
            {locked.map((r) => (
              <RewardCard key={r.id} reward={r} points={points} onPress={() => router.push(`/reward/${r.id}`)} />
            ))}
          </View>
        </>
      )}

      <AppText variant="caption" style={{ textAlign: 'center' }}>
        Per riscattare un premio mostra la tessera al personale: i punti verranno scalati dal tuo saldo.
      </AppText>
    </Screen>
  );
}
