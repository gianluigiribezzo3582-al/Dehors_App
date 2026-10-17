import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { dialog } from '@/components/dialog';
import { SwitchRow, parsePrice, priceToText } from '@/components/form';
import { AppText, Button, Card, Field, Screen } from '@/components/ui';
import type { MenuCategory, MenuItem, MenuTag } from '@/data/menu';
import { useContent } from '@/hooks/use-content';
import { useSaveContent } from '@/hooks/use-save';
import { newId } from '@/services/types';
import { Spacing } from '@/theme/colors';

export default function ManageItemScreen() {
  const { cat, id } = useLocalSearchParams<{ cat: string; id: string }>();
  const { menu } = useContent();
  const category = menu.find((c) => c.id === cat);
  const item = category?.items.find((i) => i.id === id);
  if (!category || (id !== 'new' && !item)) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Voce non trovata.</AppText>
      </Screen>
    );
  }
  return <ItemForm key={`${cat}/${id}`} menu={menu} category={category} item={item} />;
}

function ItemForm({ menu, category, item }: { menu: MenuCategory[]; category: MenuCategory; item?: MenuItem }) {
  const { save, saving } = useSaveContent();
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(priceToText(item?.price));
  const [priceLabel, setPriceLabel] = useState(item?.priceLabel ?? '');
  const [frozen, setFrozen] = useState(item?.frozen ?? false);
  const [hidden, setHidden] = useState(item?.hidden ?? false);
  const [tags, setTags] = useState<MenuTag[]>(item?.tags ?? []);

  const toggleTag = (t: MenuTag) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const writeItems = (items: MenuItem[]) =>
    save('menu', { categories: menu.map((c) => (c.id === category.id ? { ...c, items } : c)) });

  const submit = async () => {
    if (!name.trim()) return dialog.alert('Inserisci il nome della voce.');
    const value = parsePrice(price);
    if (price.trim() && value === undefined) return dialog.alert('Prezzo non valido', 'Scrivilo come 4,50.');
    if (value === undefined && !priceLabel.trim()) {
      const ok = await dialog.confirm({ title: 'Salvare senza prezzo?', confirmText: 'Salva' });
      if (!ok) return;
    }
    const updated: MenuItem = {
      id: item?.id ?? newId(),
      name: name.trim(),
      description: description.trim() || undefined,
      price: value,
      priceLabel: priceLabel.trim() || undefined,
      frozen: frozen || undefined,
      hidden: hidden || undefined,
      tags: tags.length ? tags : undefined,
    };
    const items = item ? category.items.map((i) => (i.id === item.id ? updated : i)) : [...category.items, updated];
    if (await writeItems(items)) router.back();
  };

  const remove = async () => {
    if (!item) return;
    const ok = await dialog.confirm({ title: `Eliminare «${item.name}»?`, confirmText: 'Elimina', destructive: true });
    if (ok && (await writeItems(category.items.filter((i) => i.id !== item.id)))) router.back();
  };

  return (
    <Screen edges={[]}>
      <AppText variant="overline">{category.title}</AppText>
      <Card style={{ gap: Spacing.md }}>
        <Field label="Nome" value={name} onChangeText={setName} placeholder="Es. Cappuccino" />
        <Field
          label="Descrizione / ingredienti (facoltativa)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Field label="Prezzo (€)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="1,60" />
          </View>
          <View style={{ flex: 1.4 }}>
            <Field
              label="Oppure testo prezzo"
              value={priceLabel}
              onChangeText={setPriceLabel}
              placeholder="da € 3,50 a € 6,00"
            />
          </View>
        </View>
      </Card>
      <Card>
        <SwitchRow
          label="Non disponibile"
          hint="Nasconde la voce ai clienti senza cancellarla"
          value={hidden}
          onChange={setHidden}
        />
        <SwitchRow label="Prodotto surgelato (*)" value={frozen} onChange={setFrozen} />
        <SwitchRow label="Vegano" value={tags.includes('vegan')} onChange={() => toggleTag('vegan')} />
        <SwitchRow label="Senza glutine" value={tags.includes('gf')} onChange={() => toggleTag('gf')} />
        <SwitchRow label="Proposta della settimana" value={tags.includes('week')} onChange={() => toggleTag('week')} />
      </Card>
      <Button title={item ? 'Salva voce' : 'Aggiungi voce'} onPress={submit} loading={saving} />
      {item && <Button title="Elimina voce" icon="trash-outline" variant="danger" onPress={remove} />}
    </Screen>
  );
}
