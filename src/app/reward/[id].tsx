import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { RewardCard } from '@/components/reward-card';
import { AppText, Button, Card, Screen } from '@/components/ui';
import { rewardById } from '@/data/rewards';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';

export default function RewardScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const reward = rewardById(id);

  if (!reward) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Premio non trovato.</AppText>
      </Screen>
    );
  }

  const points = profile?.points ?? null;
  const unlocked = points !== null && points >= reward.cost;

  return (
    <Screen edges={[]}>
      <RewardCard reward={reward} points={points} />
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
        </View>
      </Card>
      {profile ? (
        <Button
          title={unlocked ? 'Mostra la tessera' : `Ti mancano ${reward.cost - profile.points} punti`}
          icon="qr-code-outline"
          disabled={!unlocked}
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
