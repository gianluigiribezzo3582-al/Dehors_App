import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { View } from 'react-native';

import { dialog } from '@/components/dialog';
import { Logo } from '@/components/logo';
import { AppText, Button, Card, Divider, ListRow, SectionHeader, Screen, type IconName } from '@/components/ui';
import { Venue } from '@/config/venue';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';
import { Spacing } from '@/theme/colors';
import {
  callMobile,
  callVenue,
  directionsToVenue,
  emailVenue,
  instagramVenue,
  openWebsite,
  pecVenue,
  whatsappVenue,
} from '@/utils/contacts';
import { openStatus, weeklyHours } from '@/utils/hours';

export default function InfoScreen() {
  const theme = useTheme();
  const { uid, profile, isStaff } = useAuth();
  const status = openStatus();
  const hours = weeklyHours();

  const logout = async () => {
    if (!(await dialog.confirm({ title: 'Vuoi uscire?', confirmText: 'Esci', destructive: true }))) return;
    backend.signOut().catch((e) => dialog.alert(errorMessage(e)));
  };

  const contacts = [
    { icon: 'call-outline', title: 'Telefono', subtitle: Venue.phoneDisplay, onPress: callVenue },
    { icon: 'phone-portrait-outline', title: 'Cellulare', subtitle: Venue.mobileDisplay, onPress: callMobile },
    { icon: 'logo-whatsapp', title: 'WhatsApp', subtitle: Venue.mobileDisplay, onPress: whatsappVenue },
    { icon: 'location-outline', title: 'Indicazioni', subtitle: Venue.address, onPress: directionsToVenue },
    { icon: 'mail-outline', title: 'Email', subtitle: Venue.email, onPress: emailVenue },
    Venue.instagram && { icon: 'logo-instagram', title: 'Instagram', subtitle: `@${Venue.instagram}`, onPress: instagramVenue },
    Venue.facebook && { icon: 'logo-facebook', title: 'Facebook', subtitle: undefined, onPress: () => openWebsite(Venue.facebook) },
    Venue.website && { icon: 'globe-outline', title: 'Sito web', subtitle: Venue.website, onPress: () => openWebsite(Venue.website) },
  ].filter(Boolean) as { icon: IconName; title: string; subtitle?: string; onPress: () => void }[];

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg }}>
        <Logo variant="stacked" size={52} />
      </View>

      <Button title={`Chiama ${Venue.phoneDisplay}`} icon="call" onPress={callVenue} />

      <SectionHeader title="Contatti" />
      <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
        {contacts.map((c, i) => (
          <View key={c.title}>
            {i > 0 && <Divider />}
            <ListRow icon={c.icon} title={c.title} subtitle={c.subtitle} onPress={c.onPress} />
          </View>
        ))}
      </Card>

      {hours.length > 0 && (
        <>
          <SectionHeader
            title="Orari"
            action={
              status ? (
                <AppText variant="caption" color={status.open ? theme.success : theme.danger}>
                  {status.label}
                </AppText>
              ) : null
            }
          />
          <Card>
            {hours.map((row) => (
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
        </>
      )}

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

      <View style={{ alignItems: 'center', gap: 2, marginTop: Spacing.md }}>
        <AppText variant="caption">{Venue.company.name}</AppText>
        <AppText variant="caption">P.IVA {Venue.company.vatNumber}</AppText>
        <AppText variant="caption" onPress={pecVenue}>
          PEC {Venue.pec}
        </AppText>
        <AppText variant="caption" style={{ marginTop: Spacing.sm }}>
          {Venue.fullName} · v{Constants.expoConfig?.version ?? '1.0.0'}
        </AppText>
      </View>
    </Screen>
  );
}
