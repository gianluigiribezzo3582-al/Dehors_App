import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { dialog } from '@/components/dialog';
import { IconPicker, MoveButtons, move } from '@/components/form';
import { AppText, Button, Card, Divider, Field, ListRow, SectionHeader, Screen } from '@/components/ui';
import type { MenuCategory } from '@/data/menu';
import { useContent } from '@/hooks/use-content';
import { useSaveContent } from '@/hooks/use-save';
import { useTheme } from '@/hooks/use-theme';
import { newId } from '@/services/types';
import { Spacing } from '@/theme/colors';
import { formatEuro } from '@/utils/format';

const CATEGORY_ICONS = [
  'cafe-outline', 'sunny-outline', 'nutrition-outline', 'water-outline', 'wine-outline', 'beer-outline',
  'fast-food-outline', 'leaf-outline', 'pizza-outline', 'flask-outline', 'ice-cream-outline', 'restaurant-outline',
  'fish-outline', 'egg-outline', 'star-outline', 'gift-outline',
];

export default function ManageCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { menu } = useContent();
  const isNew = id === 'new';
  const category = menu.find((c) => c.id === id);
  if (!isNew && !category) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Categoria non trovata.</AppText>
      </Screen>
    );
  }
  return <CategoryForm key={id} menu={menu} category={category} />;
}

function CategoryForm({ menu, category }: { menu: MenuCategory[]; category?: MenuCategory }) {
  const theme = useTheme();
  const { save, saving } = useSaveContent();
  const [title, setTitle] = useState(category?.title ?? '');
  const [note, setNote] = useState(category?.note ?? '');
  const [icon, setIcon] = useState(category?.icon ?? 'restaurant-outline');

  const saveCategory = async () => {
    if (!title.trim()) return dialog.alert('Inserisci il nome della categoria.');
    const updated: MenuCategory = {
      id: category?.id ?? newId(),
      title: title.trim(),
      icon,
      note: note.trim() || undefined,
      items: category?.items ?? [],
    };
    const categories = category ? menu.map((c) => (c.id === category.id ? updated : c)) : [...menu, updated];
    if (await save('menu', { categories })) {
      if (!category) router.replace(`/manage/category/${updated.id}`);
      else dialog.alert('Categoria salvata');
    }
  };

  const remove = async () => {
    if (!category) return;
    const ok = await dialog.confirm({
      title: `Eliminare «${category.title}»?`,
      message: `Verranno eliminate anche le ${category.items.length} voci che contiene.`,
      confirmText: 'Elimina',
      destructive: true,
    });
    if (ok && (await save('menu', { categories: menu.filter((c) => c.id !== category.id) }))) router.back();
  };

  const reorderItem = (index: number, delta: -1 | 1) => {
    if (!category) return;
    const items = move(category.items, index, delta);
    save('menu', { categories: menu.map((c) => (c.id === category.id ? { ...c, items } : c)) });
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: category ? category.title : 'Nuova categoria' }} />
      <Card style={{ gap: Spacing.md }}>
        <Field label="Nome" value={title} onChangeText={setTitle} placeholder="Es. Caffetteria" />
        <Field
          label="Nota in fondo alla sezione (facoltativa)"
          value={note}
          onChangeText={setNote}
          placeholder="Es. Servizio al tavolo € 0,50"
          multiline
        />
        <AppText variant="caption">Icona</AppText>
        <IconPicker value={icon} options={CATEGORY_ICONS} onChange={setIcon} />
        <Button title={category ? 'Salva categoria' : 'Crea categoria'} onPress={saveCategory} loading={saving} />
      </Card>

      {category && (
        <>
          <SectionHeader title={`Voci (${category.items.length})`} />
          <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
            {category.items.length === 0 ? (
              <AppText variant="body" color={theme.textSecondary}>
                Nessuna voce. Aggiungi la prima.
              </AppText>
            ) : (
              category.items.map((it, i) => (
                <View key={it.id}>
                  {i > 0 && <Divider />}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, opacity: it.hidden ? 0.5 : 1 }}>
                      <ListRow
                        title={`${it.name}${it.frozen ? '*' : ''}`}
                        subtitle={[
                          it.priceLabel ?? (it.price !== undefined ? formatEuro(it.price) : 'senza prezzo'),
                          it.hidden ? 'non disponibile' : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                        onPress={() => router.push({ pathname: '/manage/item', params: { cat: category.id, id: it.id } })}
                      />
                    </View>
                    <MoveButtons
                      onUp={i > 0 ? () => reorderItem(i, -1) : undefined}
                      onDown={i < category.items.length - 1 ? () => reorderItem(i, 1) : undefined}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>
          <Button
            title="Aggiungi voce"
            icon="add"
            onPress={() => router.push({ pathname: '/manage/item', params: { cat: category.id, id: 'new' } })}
          />
          <Button title="Elimina categoria" icon="trash-outline" variant="danger" onPress={remove} />
        </>
      )}
    </Screen>
  );
}
