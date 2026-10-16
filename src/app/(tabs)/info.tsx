import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';

import { Logo } from '@/components/logo';
import { AppText, Button, Card, Divider, ListRow, SectionHeader, Screen } from '@/components/ui';
import { Venue } from '@/config/venue';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';
import { Spacing } from '@/theme/colors';
import {
  callVenue,
  directionsToVenue,
  emailVenue,
  instagramVenue,
  openWebsite,
  whatsappVenue,
} from '@/utils/contacts';
import { openStatus, weeklyHours } from '@/utils/hours';

export default function InfoScreen() {
  const theme = useTheme();
  const { uid, profile, isStaff } = useAuth();
  const status = openStatus();

  const logout = () =>
    Alert.alert('Vuoi uscire?', undefined, [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: () => backend.signOut().catch((e) => Alert.alert(errorMessage(e))),
      },
    ]);

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md }}>
        <Logo size="lg" />
        <AppText variant="caption">{Venue.tagline}</AppText>
      </View>

      <Button title={`Chiama ${Venue.phoneDisplay}`} icon="call" onPress={callVenue} />

      <SectionHeader title="Contatti" />
      <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
        <ListRow icon="location-outline" title="Indicazioni" subtitle={Venue.address} onPress={directionsToVenue} />
        <Divider />
        <ListRow icon="logo-whatsapp" title="WhatsApp" subtitle="Scrivici per prenotare" onPress={whatsappVenue} />
        <Divider />
        <ListRow icon="logo-instagram" title="Instagram" subtitle={`@${Venue.instagram}`} onPress={instagramVenue} />
        <Divider />
        <ListRow icon="mail-outline" title="Email" subtitle={Venue.email} onPress={emailVenue} />
        {Venue.website ? (
          <>
            <Divider />
            <ListRow icon="globe-outline" title="Sito web" subtitle={Venue.website} onPress={() => openWebsite(Venue.website)} />
          </>
        ) : null}
        {Venue.facebook ? (
          <>
            <Divider />
            <ListRow icon="logo-facebook" title="Facebook" onPress={() => openWebsite(Venue.facebook)} />
          </>
        ) : null}
      </Card>

      <SectionHeader
        title="Orari"
        action={
          <AppText variant="caption" color={status.open ? theme.success : theme.danger}>
            {status.label}
          </AppText>
        }
      />
      <Card>
        {weeklyHours().map((row) => (
          <View key={row.day} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant={row.today ? 'label' : 'body'} color={row.today ? theme.primary : theme.text}>
              {row.day}
            </AppText>
            <AppText variant={row.today ? 'label' : 'body'} color={row.today ? theme.primary : theme.textSecondary}>
              {row.value}
            </AppText>
          </View>
        ))}
      </Card>

      <SectionHeader title="Account" />
      <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
        {uid ? (
          <>
            <ListRow
              icon="person-outline"
              title={profile?.name ?? 'Profilo'}
              subtitle={profile ? `${profile.email}${isStaff ? ' · Staff' : ''}` : undefined}
              onPress={() => router.push('/profile')}
            />
            <Divider />
            <ListRow icon="time-outline" title="Movimenti punti" onPress={() => router.push('/history')} />
            <Divider />
            <ListRow
              icon="log-out-outline"
              title="Esci"
              onPress={logout}
              right={<Ionicons name="exit-outline" size={18} color={theme.danger} />}
            />
          </>
        ) : (
          <>
            <ListRow icon="log-in-outline" title="Accedi" onPress={() => router.push('/login')} />
            <Divider />
            <ListRow icon="person-add-outline" title="Registrati" onPress={() => router.push('/register')} />
          </>
        )}
      </Card>

      <AppText variant="caption" style={{ textAlign: 'center' }}>
        {Venue.name} · v{Constants.expoConfig?.version ?? '1.0.0'}
        {backend.mode === 'demo' ? ' · demo' : ''}
      </AppText>
    </Screen>
  );
}
