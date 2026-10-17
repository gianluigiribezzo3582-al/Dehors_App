import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { dialog } from '@/components/dialog';
import { AppText, Button, Card, Divider, Field, ListRow, SectionHeader, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';
import type { UserProfile } from '@/services/types';
import { Spacing } from '@/theme/colors';

const ROLE_LABEL: Record<UserProfile['role'], string> = { admin: 'Titolare', staff: 'Staff', customer: 'Cliente' };

/** Nomina e rimozione dei dipendenti: solo per il titolare (ruolo admin). */
export default function TeamScreen() {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Solo il titolare può gestire lo staff.</AppText>
      </Screen>
    );
  }
  return <Team />;
}

function Team() {
  const theme = useTheme();
  const { uid } = useAuth();
  const [staff, setStaff] = useState<UserProfile[] | null>(null);
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<UserProfile[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    let active = true;
    backend
      .listStaff()
      .then((list) => active && setStaff(list))
      .catch((e) => {
        if (!active) return;
        dialog.alert('Impossibile caricare lo staff', errorMessage(e));
        setStaff([]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const search = async () => {
    if (email.trim().length < 2) return dialog.alert('Scrivi almeno 2 lettere dell\'email.');
    setBusy('search');
    try {
      setResults(await backend.searchCustomersByEmail(email));
    } catch (e) {
      dialog.alert('Ricerca non riuscita', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const change = async (user: UserProfile, role: 'customer' | 'staff') => {
    const ok = await dialog.confirm(
      role === 'staff'
        ? {
            title: `Rendere staff ${user.name}?`,
            message: `${user.email} potrà gestire punti dei clienti, menù, eventi, premi e notifiche.`,
            confirmText: 'Rendi staff',
          }
        : {
            title: `Togliere ${user.name} dallo staff?`,
            message: 'Tornerà un normale cliente e perderà subito l\'accesso all\'area staff.',
            confirmText: 'Togli',
            destructive: true,
          },
    );
    if (!ok) return;
    setBusy(user.id);
    try {
      await backend.setRole(user.id, role);
      setResults((cur) => cur?.map((u) => (u.id === user.id ? { ...u, role } : u)) ?? null);
      reload();
    } catch (e) {
      dialog.alert('Operazione non riuscita', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const actionFor = (u: UserProfile) => {
    if (u.role === 'admin' || u.id === uid) {
      return <AppText variant="caption">{ROLE_LABEL[u.role]}</AppText>;
    }
    return u.role === 'staff' ? (
      <Button title="Togli" variant="danger" onPress={() => change(u, 'customer')} loading={busy === u.id} style={{ minHeight: 36, paddingHorizontal: 14 }} />
    ) : (
      <Button title="Rendi staff" variant="outline" onPress={() => change(u, 'staff')} loading={busy === u.id} style={{ minHeight: 36, paddingHorizontal: 14 }} />
    );
  };

  return (
    <Screen edges={[]}>
      <AppText variant="body" color={theme.textSecondary}>
        Il dipendente deve prima registrarsi dall&apos;app con la sua email. Poi cercalo qui e rendilo staff: la scheda Staff
        gli compare subito.
      </AppText>

      <SectionHeader title="Cerca per email" />
      <Card style={{ gap: Spacing.md }}>
        <Field
          label="Inizio dell'indirizzo email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onSubmitEditing={search}
        />
        <Button title="Cerca" icon="search-outline" variant="outline" onPress={search} loading={busy === 'search'} />
        {results &&
          (results.length === 0 ? (
            <AppText variant="caption">Nessun utente trovato. Controlla che si sia registrato.</AppText>
          ) : (
            results.map((u, i) => (
              <View key={u.id}>
                {i > 0 && <Divider />}
                <ListRow icon="person-outline" title={u.name} subtitle={`${u.email} · ${ROLE_LABEL[u.role]}`} right={actionFor(u)} />
              </View>
            ))
          ))}
      </Card>

      <SectionHeader title={`Staff attuale${staff ? ` (${staff.length})` : ''}`} />
      <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
        {staff === null ? (
          <AppText variant="caption">Caricamento…</AppText>
        ) : (
          staff.map((u, i) => (
            <View key={u.id}>
              {i > 0 && <Divider />}
              <ListRow
                icon={u.role === 'admin' ? 'key-outline' : 'person-circle-outline'}
                title={u.id === uid ? `${u.name} (tu)` : u.name}
                subtitle={`${u.email} · ${ROLE_LABEL[u.role]}`}
                right={actionFor(u)}
              />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
