import { router } from 'expo-router';
import { View } from 'react-native';

import { MoveButtons, move } from '@/components/form';
import { AppText, Button, Card, Divider, ListRow, Screen, type IconName } from '@/components/ui';
import { useContent } from '@/hooks/use-content';
import { useSaveContent } from '@/hooks/use-save';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';

export default function ManageMenuScreen() {
  const theme = useTheme();
  const { menu } = useContent();
  const { save } = useSaveContent();

  const reorder = (index: number, delta: -1 | 1) => save('menu', { categories: move(menu, index, delta) });

  return (
    <Screen edges={[]}>
      <AppText variant="body" color={theme.textSecondary}>
        Le modifiche sono visibili subito a tutti i clienti, senza aggiornare l&apos;app.
      </AppText>
      <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
        {menu.map((c, i) => {
          const hidden = c.items.filter((it) => it.hidden).length;
          return (
            <View key={c.id}>
              {i > 0 && <Divider />}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <ListRow
                    icon={c.icon as IconName}
                    title={c.title}
                    subtitle={`${c.items.length} voci${hidden ? ` · ${hidden} non disponibili` : ''}`}
                    onPress={() => router.push(`/manage/category/${c.id}`)}
                  />
                </View>
                <MoveButtons
                  onUp={i > 0 ? () => reorder(i, -1) : undefined}
                  onDown={i < menu.length - 1 ? () => reorder(i, 1) : undefined}
                />
              </View>
            </View>
          );
        })}
      </Card>
      <Button title="Nuova categoria" icon="add" variant="outline" onPress={() => router.push('/manage/category/new')} />
    </Screen>
  );
}
