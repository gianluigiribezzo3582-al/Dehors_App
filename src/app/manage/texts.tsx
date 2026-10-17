import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { dialog } from '@/components/dialog';
import { AppText, Button, Card, Field, SectionHeader, Screen } from '@/components/ui';
import type { SiteTexts } from '@/content/types';
import { useContent } from '@/hooks/use-content';
import { useSaveContent } from '@/hooks/use-save';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';
import { DAY_ORDER, dayName, isValidDay } from '@/utils/hours';

export default function ManageTextsScreen() {
  const { texts } = useContent();
  return <TextsForm initial={texts} />;
}

function TextsForm({ initial }: { initial: SiteTexts }) {
  const theme = useTheme();
  const { save, saving } = useSaveContent();
  const [t, setT] = useState<SiteTexts>(initial);
  const [rate, setRate] = useState(String(initial.pointsPerEuro).replace('.', ','));

  const set = <K extends keyof SiteTexts>(key: K) => (value: SiteTexts[K]) => setT((cur) => ({ ...cur, [key]: value }));
  const setDay = (d: (typeof DAY_ORDER)[number]) => (value: string) =>
    setT((cur) => ({ ...cur, hours: { ...cur.hours, [d]: value } }));

  const submit = async () => {
    const wrong = DAY_ORDER.filter((d) => !isValidDay(t.hours[d]));
    if (wrong.length) {
      return dialog.alert(
        'Orari non validi',
        `Controlla: ${wrong.map(dayName).join(', ')}. Scrivi ad esempio «07:00-13:00, 17:00-23:00» oppure «Chiuso».`,
      );
    }
    const pointsPerEuro = Number(rate.replace(',', '.'));
    if (!Number.isFinite(pointsPerEuro) || pointsPerEuro <= 0 || pointsPerEuro > 100) {
      return dialog.alert('Punti per euro non validi', 'Inserisci un numero maggiore di zero, es. 1.');
    }
    if (await save('texts', { ...t, pointsPerEuro })) {
      await dialog.alert('Salvato', 'I clienti vedono subito le modifiche.');
      router.back();
    }
  };

  return (
    <Screen edges={[]}>
      <SectionHeader title="Home" />
      <Card style={{ gap: Spacing.md }}>
        <Field
          label="Avviso in evidenza (vuoto = nascosto)"
          value={t.announcement}
          onChangeText={set('announcement')}
          multiline
          placeholder="Es. Domenica 2 novembre chiusi per inventario"
        />
        <Field label="Titolo invito per chi non è registrato" value={t.welcomeTitle} onChangeText={set('welcomeTitle')} />
        <Field label="Testo invito" value={t.welcomeBody} onChangeText={set('welcomeBody')} multiline />
      </Card>

      <SectionHeader title="Premi e punti" />
      <Card style={{ gap: Spacing.md }}>
        <Field label="Punti per ogni euro speso" value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
        <Field label="Testo sotto i premi" value={t.rewardsInfo} onChangeText={set('rewardsInfo')} multiline />
      </Card>

      <SectionHeader title="Contatti (vuoto = voce nascosta)" />
      <Card style={{ gap: Spacing.md }}>
        <Field label="Telefono fisso" value={t.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
        <Field label="Cellulare" value={t.mobile} onChangeText={set('mobile')} keyboardType="phone-pad" />
        <Field label="Numero WhatsApp" value={t.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" />
        <Field label="Email" value={t.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Indirizzo" value={t.address} onChangeText={set('address')} />
        <Field
          label="Link Google Maps (Android)"
          value={t.googleMapsUrl}
          onChangeText={set('googleMapsUrl')}
          autoCapitalize="none"
          placeholder="https://maps.app.goo.gl/..."
        />
        <Field
          label="Link Apple Maps (iPhone)"
          value={t.appleMapsUrl}
          onChangeText={set('appleMapsUrl')}
          autoCapitalize="none"
          placeholder="https://maps.apple.com/..."
        />
        <Field label="Instagram (nome utente)" value={t.instagram} onChangeText={set('instagram')} autoCapitalize="none" placeholder="dehors.bari" />
        <Field label="Facebook (link pagina)" value={t.facebook} onChangeText={set('facebook')} autoCapitalize="none" placeholder="https://facebook.com/..." />
        <Field label="Sito web" value={t.website} onChangeText={set('website')} autoCapitalize="none" />
      </Card>

      <SectionHeader title="Orari" />
      <Card style={{ gap: Spacing.md }}>
        <AppText variant="caption" color={theme.textSecondary}>
          Formato: «07:00-13:00, 17:00-23:00» oppure «Chiuso». Oltre la mezzanotte: «18:00-02:00». Se lasci tutto vuoto la
          sezione orari non compare.
        </AppText>
        {DAY_ORDER.map((d) => (
          <View key={d}>
            <Field label={dayName(d)} value={t.hours[d]} onChangeText={setDay(d)} placeholder="Chiuso" autoCapitalize="none" />
          </View>
        ))}
      </Card>

      <Button title="Salva tutto" onPress={submit} loading={saving} />
    </Screen>
  );
}
