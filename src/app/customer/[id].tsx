import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { TransactionRow } from '@/components/transaction-row';
import { AppText, Button, Card, Chip, Divider, Field, Loading, SectionHeader, Screen } from '@/components/ui';
import { Loyalty, pointsForAmount, tierFor } from '@/config/loyalty';
import { Rewards, type Reward } from '@/data/rewards';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-transactions';
import { backend, errorMessage } from '@/services/backend';
import type { ApplyPointsInput, UserProfile } from '@/services/types';
import { Palette, Radius, Spacing } from '@/theme/colors';
import { formatEuro } from '@/utils/format';

function parseEuro(text: string) {
  const value = Number(text.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

export default function CustomerScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile: staff, isStaff } = useAuth();
  const [customer, setCustomer] = useState<UserProfile | null | undefined>(undefined);
  const transactions = useTransactions(isStaff ? id : null, 10);

  const [amount, setAmount] = useState('');
  const [sign, setSign] = useState<1 | -1>(1);
  const [manual, setManual] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !isStaff) return;
    return backend.subscribeProfile(id, setCustomer);
  }, [id, isStaff]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(t);
  }, [feedback]);

  if (!isStaff) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Questa sezione è riservata allo staff.</AppText>
      </Screen>
    );
  }
  if (customer === undefined) return <Loading />;
  if (customer === null || !staff) {
    return (
      <Screen edges={[]}>
        <AppText variant="title">Tessera non trovata</AppText>
        <AppText variant="body" color={theme.textSecondary}>
          Il QR non corrisponde a nessun cliente registrato.
        </AppText>
      </Screen>
    );
  }

  const earnPoints = pointsForAmount(parseEuro(amount));
  const manualPoints = Math.abs(parseInt(manual, 10) || 0);
  const tier = tierFor(customer.totalEarned).current;

  const apply = async (key: string, input: Omit<ApplyPointsInput, 'userId' | 'staff'>, done: string) => {
    setBusy(key);
    try {
      await backend.applyPoints({ ...input, userId: customer.id, staff: { id: staff.id, name: staff.name } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setFeedback(done);
      return true;
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Operazione non riuscita', errorMessage(e));
      return false;
    } finally {
      setBusy(null);
    }
  };

  const addFromAmount = async () => {
    const euro = parseEuro(amount);
    if (earnPoints <= 0) return Alert.alert('Importo troppo basso', 'Inserisci l\'importo speso in euro.');
    const ok = await apply('earn', { delta: earnPoints, kind: 'earn', amountEur: euro }, `+${earnPoints} punti aggiunti`);
    if (ok) setAmount('');
  };

  const applyManual = async (points = manualPoints) => {
    if (points <= 0) return Alert.alert('Inserisci un numero di punti.');
    const delta = sign * points;
    const ok = await apply(
      'manual',
      { delta, kind: 'adjust', note: note || undefined },
      `${delta > 0 ? '+' : ''}${delta} punti`,
    );
    if (ok) {
      setManual('');
      setNote('');
    }
  };

  const redeem = (reward: Reward) =>
    Alert.alert(
      `Riscattare «${reward.title}»?`,
      `Verranno scalati ${reward.cost} punti. Saldo dopo: ${customer.points - reward.cost} punti.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Riscatta',
          onPress: () =>
            apply(`r-${reward.id}`, { delta: -reward.cost, kind: 'redeem', rewardId: reward.id }, `Premio «${reward.title}» riscattato`),
        },
      ],
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: customer.name }} />
      <Screen edges={[]}>
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="overline" color={tier.color}>
              {tier.name} · {customer.cardCode}
            </AppText>
            <AppText variant="title" color="#FFFFFF">
              {customer.name}
            </AppText>
            <AppText variant="caption" color={Palette.cream}>
              {customer.email}
              {customer.phone ? ` · ${customer.phone}` : ''}
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="overline" color={Palette.cream}>
              Saldo
            </AppText>
            <AppText variant="display" color="#FFFFFF">
              {customer.points}
            </AppText>
          </View>
        </View>

        {feedback && (
          <View style={[styles.feedback, { backgroundColor: theme.success }]}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <AppText variant="label" color="#FFFFFF">
              {feedback}
            </AppText>
          </View>
        )}

        <SectionHeader title="Aggiungi da consumazione" />
        <Card style={{ gap: Spacing.md }}>
          <Field
            label={`Importo speso (${Loyalty.pointsPerEuro} pt per ogni €)`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0,00"
            style={{ fontSize: 24, fontWeight: '600' }}
          />
          <Button
            title={earnPoints > 0 ? `Aggiungi ${earnPoints} punti · ${formatEuro(parseEuro(amount))}` : 'Aggiungi punti'}
            icon="add-circle-outline"
            onPress={addFromAmount}
            loading={busy === 'earn'}
            disabled={earnPoints <= 0}
          />
        </Card>

        <SectionHeader title="Riscatta premio" />
        <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
          {Rewards.map((r, i) => {
            const ok = customer.points >= r.cost;
            return (
              <View key={r.id}>
                {i > 0 && <Divider />}
                <Pressable
                  disabled={!ok || busy !== null}
                  onPress={() => redeem(r)}
                  style={({ pressed }) => [styles.reward, { opacity: !ok ? 0.45 : pressed ? 0.6 : 1 }]}>
                  <View style={[styles.rewardDot, { backgroundColor: r.tint }]} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="label">{r.title}</AppText>
                    <AppText variant="caption">{r.cost} punti</AppText>
                  </View>
                  <AppText variant="label" color={ok ? theme.primary : theme.textSecondary}>
                    {busy === `r-${r.id}` ? '…' : ok ? 'Riscatta' : `mancano ${r.cost - customer.points}`}
                  </AppText>
                </Pressable>
              </View>
            );
          })}
        </Card>

        <SectionHeader title="Correzione manuale" />
        <Card style={{ gap: Spacing.md }}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Chip label="+ Aggiungi" active={sign === 1} onPress={() => setSign(1)} />
            <Chip label="− Togli" active={sign === -1} onPress={() => setSign(-1)} />
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
            {Loyalty.quickAdjustments.map((q) => (
              <Chip key={q} label={`${sign > 0 ? '+' : '−'}${q}`} onPress={() => applyManual(q)} />
            ))}
          </View>
          <Field label="Punti" value={manual} onChangeText={setManual} keyboardType="number-pad" placeholder="0" />
          <Field label="Nota (facoltativa)" value={note} onChangeText={setNote} placeholder="Es. correzione errore" />
          <Button
            title={sign > 0 ? 'Aggiungi punti' : 'Togli punti'}
            variant={sign > 0 ? 'outline' : 'danger'}
            onPress={() => applyManual()}
            loading={busy === 'manual'}
          />
        </Card>

        <SectionHeader title="Ultimi movimenti" />
        <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
          {transactions.length === 0 ? (
            <AppText variant="caption">Nessun movimento.</AppText>
          ) : (
            transactions.map((tx, i) => (
              <View key={tx.id}>
                {i > 0 && <Divider />}
                <TransactionRow tx={tx} showStaff />
              </View>
            ))
          )}
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Palette.green,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  reward: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  rewardDot: { width: 14, height: 14, borderRadius: 7 },
});
