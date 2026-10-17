import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StaffOnly } from '@/components/staff-only';
import { AppText, Button, Card, Divider, Field, ListRow, SectionHeader, Screen } from '@/components/ui';
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

function StaffDesk() {
  const theme = useTheme();
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
        <ListRow icon="calendar-outline" title="Eventi" subtitle="Eventi in Home e notifica" onPress={() => router.push('/manage/events')} />
        <Divider />
        <ListRow icon="gift-outline" title="Premi" subtitle="Punti, una volta o più volte" onPress={() => router.push('/manage/rewards')} />
        <Divider />
        <ListRow icon="create-outline" title="Testi, contatti e orari" subtitle="Avviso in Home, punti per euro" onPress={() => router.push('/manage/texts')} />
        <Divider />
        <ListRow icon="notifications-outline" title="Invia notifica" subtitle="Messaggio a tutti i clienti" onPress={() => router.push('/manage/notify')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scan: {
    backgroundColor: Palette.green,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
