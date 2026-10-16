import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Chip, Divider, type IconName } from '@/components/ui';
import { Menu, type MenuItem, type MenuTag } from '@/data/menu';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/colors';
import { formatEuro } from '@/utils/format';

const TAG_LABELS: Record<MenuTag, string> = {
  veg: 'Vegetariano',
  vegan: 'Vegano',
  gf: 'Senza glutine',
  new: 'Novità',
  spicy: 'Piccante',
};

function ItemRow({ item }: { item: MenuItem }) {
  const theme = useTheme();
  return (
    <View style={styles.item}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label">{item.name}</AppText>
        {item.description ? <AppText variant="caption">{item.description}</AppText> : null}
        {item.tags?.length ? (
          <View style={styles.tags}>
            {item.tags.map((t) => (
              <View key={t} style={[styles.tag, { borderColor: t === 'new' ? theme.accent : theme.border }]}>
                <AppText variant="caption" color={t === 'new' ? theme.accent : theme.textSecondary} style={{ fontSize: 11 }}>
                  {TAG_LABELS[t]}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <AppText variant="label" color={theme.primary}>
        {formatEuro(item.price)}
      </AppText>
    </View>
  );
}

export default function MenuScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<SectionList<MenuItem>>(null);

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    return Menu.map((c) => ({
      key: c.id,
      title: c.title,
      icon: c.icon as IconName,
      data: q
        ? c.items.filter((i) => `${i.name} ${i.description ?? ''}`.toLowerCase().includes(q))
        : c.items,
    })).filter((s) => s.data.length > 0);
  }, [search]);

  const jumpTo = (id: string) => {
    setActive(id);
    const index = sections.findIndex((s) => s.key === id);
    if (index >= 0) listRef.current?.scrollToLocation({ sectionIndex: index, itemIndex: 0, viewOffset: 48 });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.top}>
        <AppText variant="display">Menù</AppText>
        <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cerca nel menù"
            placeholderTextColor={theme.textSecondary}
            style={{ flex: 1, color: theme.text, fontSize: 16, paddingVertical: 10 }}
          />
          {search ? <Ionicons name="close-circle" size={18} color={theme.textSecondary} onPress={() => setSearch('')} /> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
          {sections.map((s) => (
            <Chip key={s.key} label={s.title} active={active === s.key} onPress={() => jumpTo(s.key)} />
          ))}
        </ScrollView>
      </View>

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl * 2 }}
        onScrollToIndexFailed={() => {}}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
            <Ionicons name={section.icon} size={18} color={theme.accent} />
            <AppText variant="title" style={{ fontSize: 22 }}>
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => <ItemRow item={item} />}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={
          <AppText variant="body" color={theme.textSecondary} style={{ textAlign: 'center', marginTop: Spacing.xl }}>
            Nessun risultato per «{search}»
          </AppText>
        }
        ListFooterComponent={
          <AppText variant="caption" style={{ textAlign: 'center', marginTop: Spacing.lg }}>
            Per allergie e intolleranze chiedi al personale.
          </AppText>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  item: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, alignItems: 'flex-start' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 1 },
});
