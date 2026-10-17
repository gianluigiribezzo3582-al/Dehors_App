import { useState } from 'react';
import { View } from 'react-native';

import { dialog } from '@/components/dialog';
import { AppText, Button, Card, Chip, Field, Screen } from '@/components/ui';
import { useUpcomingEvents } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';
import { errorMessage } from '@/services/backend';
import { pushAvailable, sendToEveryone } from '@/services/notifications';
import { Spacing } from '@/theme/colors';

export default function NotifyScreen() {
  const theme = useTheme();
  const events = useUpcomingEvents();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!title.trim() || !body.trim()) return dialog.alert('Scrivi titolo e messaggio.');
    const ok = await dialog.confirm({
      title: 'Inviare a tutti?',
      message: `«${title.trim()}» arriverà su tutti i telefoni con l'app e le notifiche attive.`,
      confirmText: 'Invia',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const r = await sendToEveryone(title.trim(), body.trim(), eventId ? { eventId } : {});
      await dialog.alert(
        r.preview ? 'Anteprima' : 'Notifica inviata',
        r.preview
          ? 'Mostrata solo su questo telefono: l\'invio a tutti si attiva dopo la configurazione (vedi README).'
          : `Inviata a ${r.sent} telefoni${r.failed ? ` (${r.failed} non raggiunti)` : ''}.`,
      );
      if (!r.preview) {
        setTitle('');
        setBody('');
        setEventId(null);
      }
    } catch (e) {
      dialog.alert('Invio non riuscito', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]}>
      {!pushAvailable() && (
        <Card>
          <AppText variant="caption" color={theme.accent}>
            Invio a tutti non ancora configurato: per ora la notifica compare solo su questo telefono come anteprima.
          </AppText>
        </Card>
      )}
      <Card style={{ gap: Spacing.md }}>
        <Field label="Titolo" value={title} onChangeText={setTitle} maxLength={60} placeholder="Es. Stasera musica live!" />
        <Field label="Messaggio" value={body} onChangeText={setBody} maxLength={180} multiline placeholder="Es. Dalle 21, aperitivo Dehors a € 11" />
        {events.length > 0 && (
          <View style={{ gap: Spacing.sm }}>
            <AppText variant="caption">Apri un evento al tocco (facoltativo)</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
              <Chip label="Nessuno" active={!eventId} onPress={() => setEventId(null)} />
              {events.map((e) => (
                <Chip key={e.id} label={e.title} active={eventId === e.id} onPress={() => setEventId(e.id)} />
              ))}
            </View>
          </View>
        )}
      </Card>
      <Button title="Invia a tutti" icon="notifications-outline" onPress={send} loading={busy} />
    </Screen>
  );
}
