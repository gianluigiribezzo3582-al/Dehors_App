import { router } from 'expo-router';
import { View } from 'react-native';

import { LoginPrompt } from '@/components/login-prompt';
import { RewardCard } from '@/components/reward-card';
import { AppText, Card, SectionHeader, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { rewardStatus, useActiveRewards, useContent } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';

export default function RewardsScreen() {
  const theme = useTheme();
  const { uid, profile } = useAuth();
  const { texts } = useContent();
  const rewards = useActiveRewards();
  const available = profile ? rewards.filter((r) => rewardStatus(r, profile).available) : [];
  const others = rewards.filter((r) => !available.includes(r));

  return (
    <Screen>
      <AppText variant="display">Premi</AppText>

      {profile ? (
        <Card>
          <AppText variant="overline">Saldo attuale</AppText>
          <AppText variant="title" color={theme.primary}>
            {profile.points} punti
          </AppText>
        </Card>
      ) : !uid ? (
        <LoginPrompt
          icon="gift-outline"
          title="Accumula e riscatta"
          message="Con la tessera Dehors ogni consumazione vale punti da trasformare in premi e sconti."
        />
      ) : null}

      {available.length > 0 && (
        <>
          <SectionHeader title="Puoi riscattarli ora" />
          {available.map((r) => (
            <RewardCard key={r.id} reward={r} profile={profile} onPress={() => router.push(`/reward/${r.id}`)} />
          ))}
        </>
      )}

      {others.length > 0 && (
        <>
          <SectionHeader title={profile ? 'Altri premi' : 'Catalogo premi'} />
          <View style={{ gap: Spacing.md }}>
            {others.map((r) => (
              <RewardCard key={r.id} reward={r} profile={profile} onPress={() => router.push(`/reward/${r.id}`)} />
            ))}
          </View>
        </>
      )}

      {rewards.length === 0 && (
        <AppText variant="body" color={theme.textSecondary}>
          Nessun premio disponibile al momento.
        </AppText>
      )}

      {texts.rewardsInfo ? (
        <AppText variant="caption" style={{ textAlign: 'center' }}>
          {texts.rewardsInfo}
        </AppText>
      ) : null}
    </Screen>
  );
}
