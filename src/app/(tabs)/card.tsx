import { router } from 'expo-router';
import { View } from 'react-native';

import { LoginPrompt } from '@/components/login-prompt';
import { LoyaltyCard } from '@/components/loyalty-card';
import { TransactionRow } from '@/components/transaction-row';
import { AppText, Button, Card, Divider, Loading, ProgressBar, SectionHeader, Screen } from '@/components/ui';
import { tierFor } from '@/config/loyalty';
import { useContent } from '@/hooks/use-content';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-transactions';
import { Spacing } from '@/theme/colors';

export default function CardScreen() {
  const theme = useTheme();
  const { uid, profile } = useAuth();
  const transactions = useTransactions(uid, 5);
  const { texts } = useContent();

  if (!uid) {
    return (
      <Screen>
        <AppText variant="display">Tessera</AppText>
        <LoginPrompt
          icon="qr-code-outline"
          title="La tua tessera digitale"
          message="Registrati per ottenere il tuo QR personale: mostralo al bancone e accumula punti a ogni consumazione."
        />
      </Screen>
    );
  }
  if (!profile) return <Loading />;

  const { current, next } = tierFor(profile.totalEarned);

  return (
    <Screen>
      <AppText variant="display">Tessera</AppText>
      <LoyaltyCard profile={profile} />
      <AppText variant="caption" style={{ textAlign: 'center' }}>
        Mostra il QR al personale quando paghi: riceverai {texts.pointsPerEuro} {texts.pointsPerEuro === 1 ? 'punto' : 'punti'} per ogni euro speso.
      </AppText>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="label">Livello {current.name}</AppText>
          <AppText variant="caption">{profile.totalEarned} punti totali</AppText>
        </View>
        {next ? (
          <>
            <ProgressBar
              value={(profile.totalEarned - current.minTotal) / (next.minTotal - current.minTotal)}
              color={next.color}
            />
            <AppText variant="caption">
              Ancora {next.minTotal - profile.totalEarned} punti per diventare {next.name}
            </AppText>
          </>
        ) : (
          <AppText variant="caption">Hai raggiunto il livello massimo. Grazie!</AppText>
        )}
      </Card>

      <SectionHeader
        title="Ultimi movimenti"
        action={
          <Button
            title="Vedi tutti"
            variant="ghost"
            onPress={() => router.push('/history')}
            style={{ minHeight: 32, paddingHorizontal: 0 }}
          />
        }
      />
      <Card style={{ paddingVertical: Spacing.sm, gap: 0 }}>
        {transactions.length === 0 ? (
          <AppText variant="body" color={theme.textSecondary}>
            Nessun movimento ancora.
          </AppText>
        ) : (
          transactions.map((tx, i) => (
            <View key={tx.id}>
              {i > 0 && <Divider />}
              <TransactionRow tx={tx} />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
