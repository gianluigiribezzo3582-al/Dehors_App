import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { RewardCard } from '@/components/reward-card';
import { AppText, Button, Card, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { rewardStatus, useContent } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';

export default function RewardScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { rewards } = useContent();
  const reward = rewards.find((r) => r.id === id && r.active);

  if (!reward) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Premio non più disponibile.</AppText>
      </Screen>
    );
  }

  const status = rewardStatus(reward, profile);

  return (
    <Screen edges={[]}>
      <RewardCard reward={reward} profile={profile} />
      <Card>
        <AppText variant="heading">Come si riscatta</AppText>
        <View style={{ gap: Spacing.xs }}>
          <AppText variant="body" color={theme.textSecondary}>
            1. Al bancone chiedi il premio «{reward.title}».
          </AppText>
          <AppText variant="body" color={theme.textSecondary}>
            2. Mostra il QR della tua tessera.
          </AppText>
          <AppText variant="body" color={theme.textSecondary}>
            3. Il personale scalerà {reward.cost} punti dal tuo saldo.
          </AppText>
          <AppText variant="body" color={theme.textSecondary}>
            {reward.repeatable
              ? 'Questo premio puoi riscattarlo tutte le volte che vuoi.'
              : 'Questo premio si può riscattare una sola volta.'}
          </AppText>
        </View>
      </Card>
      {profile ? (
        <Button
          title={
            status.alreadyUsed
              ? 'Già riscattato'
              : status.available
                ? 'Mostra la tessera'
                : `Ti mancano ${status.missing} punti`
          }
          icon="qr-code-outline"
          disabled={!status.available}
          onPress={() => {
            router.back();
            router.push('/card');
          }}
        />
      ) : (
        <Button title="Registrati per accumulare punti" onPress={() => router.replace('/register')} />
      )}
    </Screen>
  );
}
