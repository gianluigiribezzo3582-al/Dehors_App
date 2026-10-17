import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StaffOnly } from '@/components/staff-only';
import { AppText, Button, Card, Divider, Field, ListRow, SectionHeader, Screen, type IconName } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useContent } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';
import { normalizeCardCode, type UserProfile } from '@/services/types';
import { Palette, Radius, Spacing } from '@/theme/colors';

/** Banco staff: scansione QR, ricerca tessera per codice o email. */
export default function StaffScreen() {
  return (
    <StaffOnly>
      <StaffDesk />
    </StaffOnly>
  );
}

function QuickTile({ icon, label, hint, onPress }: { icon: IconName; label: string; hint: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
      <Ionicons name={icon} size={24} color={theme.primary} />
      <AppText variant="label">{label}</AppText>
      <AppText variant="caption">{hint}</AppText>
    </Pressable>
  );
}

function StaffDesk() {
  const theme = useTheme();
  const { soldOut, lunch } = useContent();
  const { isAdmin } = useAuth();
  const outCount = Object.values(soldOut).filter(Boolean).length;
  const lunchCount = lunch.dishes.length;
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<UserProfile[] | null>(null);
  const [busy, setBusy] = useState<'code' | 'email' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchCode = async () => {
    setError(null);
    const normalized = normalizeCardCode(code);
    if (normalized.length < 4) return setError('Inserisci il codice tessera.');
    setBusy('code');
    try {
      const found = await backend.findByCardCode(normalized);
      if (!found) setError('Nessuna tessera con questo codice.');
      else router.push(`/customer/${found.id}`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const searchEmail = async () => {
    setError(null);
    if (email.trim().length < 2) return setError('Scrivi almeno 2 lettere dell\'email.');
    setBusy('email');
    try {
      setResults(await backend.searchCustomersByEmail(email));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <AppText variant="display">Banco</AppText>

      <Pressable onPress={() => router.push('/scan')} style={({ pressed }) => [styles.scan, { opacity: pressed ? 0.85 : 1 }]}>
        <Ionicons name="scan" size={48} color="#FFFFFF" />
        <AppText variant="title" color="#FFFFFF">
          Scansiona tessera
        </AppText>
        <AppText variant="caption" color={Palette.cream}>
          Inquadra il QR del cliente per aggiungere o scalare punti
        </AppText>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <QuickTile
          icon="close-circle-outline"
          label="Esauriti"
          hint={outCount ? `${outCount} segnati` : 'Tutto disponibile'}
          onPress={() => router.push('/manage/soldout')}
        />
        <QuickTile
          icon="restaurant-outline"
          label="Pranzo del giorno"
          hint={lunchCount ? `${lunchCount} piatti` : 'Da compilare'}
          onPress={() => router.push('/manage/lunch')}
        />
      </View>

      {error && (
        <AppText variant="caption" color={theme.danger}>
          {error}
        </AppText>
      )}

      <SectionHeader title="Codice tessera" />
      <Card style={{ gap: Spacing.md }}>
        <Field
          label="Se il QR non si legge, digita il codice sotto al QR"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="ABCD 2345"
          onSubmitEditing={searchCode}
        />
        <Button title="Cerca" variant="outline" icon="keypad-outline" onPress={searchCode} loading={busy === 'code'} />
      </Card>

      <SectionHeader title="Cerca per email" />
      <Card style={{ gap: Spacing.md }}>
        <Field
          label="Inizio dell'indirizzo email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          onSubmitEditing={searchEmail}
        />
        <Button title="Cerca" variant="outline" icon="search-outline" onPress={searchEmail} loading={busy === 'email'} />
        {results && (
          <View>
            {results.length === 0 ? (
              <AppText variant="caption">Nessun cliente trovato.</AppText>
            ) : (
              results.map((u, i) => (
                <View key={u.id}>
                  {i > 0 && <Divider />}
                  <ListRow
                    icon="person-outline"
                    title={u.name}
                    subtitle={`${u.email} · ${u.points} pt`}
                    onPress={() => router.push(`/customer/${u.id}`)}
                  />
                </View>
              ))
            )}
          </View>
        )}
      </Card>

      <SectionHeader title="Gestione app" />
      <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
        <ListRow icon="restaurant-outline" title="Menù" subtitle="Voci, prezzi, disponibilità" onPress={() => router.push('/manage/menu')} />
        <Divider />
        <ListRow icon="close-circle-outline" title="Esauriti" subtitle="Segna in tempo reale i prodotti finiti" onPress={() => router.push('/manage/soldout')} />
        <Divider />
        <ListRow icon="fast-food-outline" title="Pranzo del giorno" subtitle="Piatti di oggi, visibili in fascia oraria" onPress={() => router.push('/manage/lunch')} />
        <Divider />
        <ListRow icon="calendar-outline" title="Eventi" subtitle="Eventi in Home e notifica" onPress={() => router.push('/manage/events')} />
        <Divider />
        <ListRow icon="gift-outline" title="Premi" subtitle="Punti, una volta o più volte" onPress={() => router.push('/manage/rewards')} />
        <Divider />
        <ListRow icon="create-outline" title="Testi, contatti e orari" subtitle="Avviso in Home, punti per euro" onPress={() => router.push('/manage/texts')} />
        <Divider />
        <ListRow icon="notifications-outline" title="Invia notifica" subtitle="Messaggio a tutti i clienti" onPress={() => router.push('/manage/notify')} />
        {isAdmin && (
          <>
            <Divider />
            <ListRow icon="people-outline" title="Staff e permessi" subtitle="Aggiungi o togli i dipendenti" onPress={() => router.push('/manage/team')} />
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  scan: {
    backgroundColor: Palette.green,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
