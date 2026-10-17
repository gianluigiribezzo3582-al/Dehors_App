import { useState } from 'react';
import { View } from 'react-native';

import { dialog } from '@/components/dialog';
import { SwitchRow, parsePrice, priceToText } from '@/components/form';
import { AppText, Button, Card, Field, SectionHeader, Screen } from '@/components/ui';
import type { LunchDish, LunchMenu } from '@/content/types';
import { isWithin, useContent, useNow } from '@/hooks/use-content';
import { useSaveContent } from '@/hooks/use-save';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';
import { newId } from '@/services/types';
import { Spacing } from '@/theme/colors';

type Draft = { id: string; name: string; description: string; price: string };

const toDraft = (d: LunchDish): Draft => ({
  id: d.id,
  name: d.name,
  description: d.description ?? '',
  price: priceToText(d.price),
});

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function ManageLunchScreen() {
  const { lunch } = useContent();
  return <LunchForm initial={lunch} />;
}

function LunchForm({ initial }: { initial: LunchMenu }) {
  const theme = useTheme();
  const now = useNow();
  const { soldOut } = useContent();
  const { save, saving } = useSaveContent();
  const [dishes, setDishes] = useState<Draft[]>(initial.dishes.map(toDraft));
  const [note, setNote] = useState(initial.note);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const update = (id: string, patch: Partial<Draft>) =>
    setDishes((cur) => cur.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const add = () => setDishes((cur) => [...cur, { id: newId(), name: '', description: '', price: '' }]);
  const removeDish = (id: string) => setDishes((cur) => cur.filter((d) => d.id !== id));

  const toggleSoldOut = async (id: string, value: boolean) => {
    try {
      await backend.setSoldOut(id, value);
    } catch (e) {
      dialog.alert('Aggiornamento non riuscito', errorMessage(e));
    }
  };

  const submit = async () => {
    if (!TIME.test(from) || !TIME.test(to)) return dialog.alert('Orario non valido', 'Scrivi gli orari come 10:00 e 15:00.');
    const filled = dishes.filter((d) => d.name.trim());
    const badPrice = filled.find((d) => d.price.trim() && parsePrice(d.price) === undefined);
    if (badPrice) return dialog.alert('Prezzo non valido', `Controlla «${badPrice.name}»: scrivilo come 8,50.`);
    const ok = await save('lunch', {
      from,
      to,
      note: note.trim(),
      dishes: filled.map((d) => ({
        id: d.id,
        name: d.name.trim(),
        description: d.description.trim() || undefined,
        price: parsePrice(d.price),
      })),
    });
    if (ok) {
      setDishes(filled);
      dialog.alert('Pranzo salvato', 'I clienti lo vedono subito, nella fascia oraria indicata.');
    }
  };

  const clearAll = async () => {
    const ok = await dialog.confirm({
      title: 'Svuotare il pranzo?',
      message: 'Toglie tutti i piatti (ad esempio per preparare quello di domani). Ricordati di salvare.',
      confirmText: 'Svuota',
      destructive: true,
    });
    if (ok) setDishes([]);
  };

  const live = initial.dishes.length > 0 && isWithin(now, initial.from, initial.to);

  return (
    <Screen edges={[]}>
      <Card>
        <AppText variant="label" color={live ? theme.success : theme.textSecondary}>
          {live ? '● Visibile ora ai clienti' : '○ Non visibile ora ai clienti'}
        </AppText>
        <AppText variant="caption">
          Il pranzo compare in Home e in cima al Menù dalle {initial.from} alle {initial.to}, se c&apos;è almeno un piatto.
        </AppText>
      </Card>

      <SectionHeader title={`Piatti (${dishes.length})`} />
      {dishes.length === 0 && (
        <AppText variant="body" color={theme.textSecondary}>
          Nessun piatto. Aggiungi quelli di oggi.
        </AppText>
      )}
      {dishes.map((d, i) => (
        <Card key={d.id} style={{ gap: Spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="overline">Piatto {i + 1}</AppText>
            <Button title="Rimuovi" variant="ghost" onPress={() => removeDish(d.id)} style={{ minHeight: 32, paddingHorizontal: 0 }} />
          </View>
          <Field label="Nome" value={d.name} onChangeText={(v) => update(d.id, { name: v })} placeholder="Es. Orecchiette al pomodoro" />
          <Field
            label="Descrizione (facoltativa)"
            value={d.description}
            onChangeText={(v) => update(d.id, { description: v })}
            placeholder="Es. con cacioricotta"
          />
          <Field
            label="Prezzo (facoltativo)"
            value={d.price}
            onChangeText={(v) => update(d.id, { price: v })}
            keyboardType="decimal-pad"
            placeholder="8,50"
          />
          {initial.dishes.some((x) => x.id === d.id) && (
            <SwitchRow
              label="Esaurito"
              hint="Si aggiorna subito, senza salvare"
              value={!!soldOut[d.id]}
              onChange={(v) => toggleSoldOut(d.id, v)}
            />
          )}
        </Card>
      ))}
      <Button title="Aggiungi piatto" icon="add" variant="outline" onPress={add} />

      <SectionHeader title="Impostazioni" />
      <Card style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Field label="Visibile dalle" value={from} onChangeText={setFrom} placeholder="10:00" keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Fino alle" value={to} onChangeText={setTo} placeholder="15:00" keyboardType="numbers-and-punctuation" />
          </View>
        </View>
        <Field
          label="Nota (facoltativa)"
          value={note}
          onChangeText={setNote}
          placeholder="Es. Primo + acqua € 10"
          multiline
        />
      </Card>

      <Button title="Salva pranzo" onPress={submit} loading={saving} />
      {dishes.length > 0 && <Button title="Svuota piatti" icon="trash-outline" variant="danger" onPress={clearAll} />}
    </Screen>
  );
}
