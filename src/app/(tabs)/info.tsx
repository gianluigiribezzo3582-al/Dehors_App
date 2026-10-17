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
import { useContent } from '@/hooks/use-content';
import { callNumber, directionsTo, openInstagram, openWebsite, openWhatsapp, sendEmail } from '@/utils/contacts';
import { openStatus, weeklyHours } from '@/utils/hours';

export default function InfoScreen() {
  const theme = useTheme();
  const { uid, profile, isStaff } = useAuth();
  const { texts: t } = useContent();
  const status = openStatus(t.hours);
  const hours = weeklyHours(t.hours);

  const logout = async () => {
    if (!(await dialog.confirm({ title: 'Vuoi uscire?', confirmText: 'Esci', destructive: true }))) return;
    backend.signOut().catch((e) => dialog.alert(errorMessage(e)));
  };

  const contacts = [
    t.phone && { icon: 'call-outline', title: 'Telefono', subtitle: t.phone, onPress: () => callNumber(t.phone) },
    t.mobile && { icon: 'phone-portrait-outline', title: 'Cellulare', subtitle: t.mobile, onPress: () => callNumber(t.mobile) },
    t.whatsapp && { icon: 'logo-whatsapp', title: 'WhatsApp', subtitle: t.whatsapp, onPress: () => openWhatsapp(t.whatsapp) },
    t.address && { icon: 'location-outline', title: 'Indicazioni', subtitle: t.address, onPress: () => directionsTo(t) },
    t.email && { icon: 'mail-outline', title: 'Email', subtitle: t.email, onPress: () => sendEmail(t.email) },
    t.instagram && { icon: 'logo-instagram', title: 'Instagram', subtitle: `@${t.instagram.replace(/^@/, '')}`, onPress: () => openInstagram(t.instagram) },
    t.facebook && { icon: 'logo-facebook', title: 'Facebook', subtitle: undefined, onPress: () => openWebsite(t.facebook) },
    t.website && { icon: 'globe-outline', title: 'Sito web', subtitle: t.website, onPress: () => openWebsite(t.website) },
  ].filter(Boolean) as { icon: IconName; title: string; subtitle?: string; onPress: () => void }[];

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg }}>
        <Logo variant="stacked" size={52} />
      </View>

      {t.phone ? <Button title={`Chiama ${t.phone}`} icon="call" onPress={() => callNumber(t.phone)} /> : null}

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
        <AppText variant="caption" onPress={() => sendEmail(Venue.pec)}>
          PEC {Venue.pec}
        </AppText>
        <AppText variant="caption" style={{ marginTop: Spacing.sm }}>
          {Venue.fullName} · v{Constants.expoConfig?.version ?? '1.0.0'}
        </AppText>
      </View>
    </Screen>
  );
}
