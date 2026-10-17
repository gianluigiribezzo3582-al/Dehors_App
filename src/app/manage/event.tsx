import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { dialog } from '@/components/dialog';
import { DateTimeField, SwitchRow } from '@/components/form';
import { AppText, Button, Card, Field, Loading, Screen } from '@/components/ui';
import type { EventItem } from '@/content/types';
import { backend, errorMessage } from '@/services/backend';
import { sendToEveryone } from '@/services/notifications';
import { Spacing } from '@/theme/colors';
import { formatEventDate } from '@/utils/format';

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null | undefined>(id === 'new' ? null : undefined);

  useEffect(() => {
    if (id === 'new') return;
    return backend.subscribeEvents(true, (items) => setEvent((cur) => cur ?? items.find((e) => e.id === id) ?? null));
  }, [id]);

  if (event === undefined) return <Loading />;
  if (id !== 'new' && !event) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Evento non trovato.</AppText>
      </Screen>
    );
  }
  return <EventForm key={id} event={event ?? undefined} />;
}

function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(19, 0, 0, 0);
  return d;
}

function EventForm({ event }: { event?: EventItem }) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [details, setDetails] = useState(event?.details ?? '');
  const [date, setDate] = useState(event ? new Date(event.startsAt) : defaultDate());
  const [published, setPublished] = useState(event?.published ?? true);
  const [notify, setNotify] = useState(!event);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return dialog.alert('Inserisci il titolo dell\'evento.');
    setBusy(true);
    try {
      const saved = await backend.saveEvent({
        id: event?.id,
        createdAt: event?.createdAt,
        title,
        description,
        details,
        startsAt: date.getTime(),
        published,
      });
      if (published && notify) {
        try {
          const result = await sendToEveryone(saved.title, `${formatEventDate(saved.startsAt)} · tocca per i dettagli`, {
            eventId: saved.id,
          });
          await dialog.alert(
            'Evento pubblicato',
            result.preview
              ? 'Anteprima della notifica mostrata su questo telefono (invio a tutti non ancora configurato).'
              : `Notifica inviata a ${result.sent} telefoni${result.failed ? ` (${result.failed} non raggiunti)` : ''}.`,
          );
        } catch (e) {
          await dialog.alert('Evento salvato, notifica non inviata', errorMessage(e));
        }
      }
      router.back();
    } catch (e) {
      dialog.alert('Salvataggio non riuscito', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!event) return;
    const ok = await dialog.confirm({ title: `Eliminare «${event.title}»?`, confirmText: 'Elimina', destructive: true });
    if (!ok) return;
    try {
      await backend.deleteEvent(event.id);
      router.back();
    } catch (e) {
      dialog.alert('Eliminazione non riuscita', errorMessage(e));
    }
  };

  return (
    <Screen edges={[]}>
      <Card style={{ gap: Spacing.md }}>
        <Field label="Titolo" value={title} onChangeText={setTitle} placeholder="Es. Aperitivo con musica live" />
        <DateTimeField label="Data e ora di inizio" value={date} onChange={setDate} />
        <Field
          label="In breve (facoltativo)"
          value={details}
          onChangeText={setDetails}
          placeholder="Es. dalle 19 alle 23 · ingresso libero"
        />
        <Field label="Descrizione" value={description} onChangeText={setDescription} multiline style={{ minHeight: 110, textAlignVertical: 'top', paddingTop: 12 }} />
      </Card>
      <Card>
        <SwitchRow
          label="Pubblicato"
          hint={published ? 'Visibile in Home a tutti' : 'Bozza: lo vede solo lo staff'}
          value={published}
          onChange={setPublished}
        />
        {published && (
          <SwitchRow
            label="Invia notifica a tutti"
            hint="Avvisa chi ha l'app al momento del salvataggio"
            value={notify}
            onChange={setNotify}
          />
        )}
      </Card>
      <Button title={event ? 'Salva evento' : 'Crea evento'} onPress={submit} loading={busy} />
      {event && <Button title="Elimina evento" icon="trash-outline" variant="danger" onPress={remove} />}
    </Screen>
  );
}
