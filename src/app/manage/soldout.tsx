import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Switch, TextInput, View } from 'react-native';

import { dialog } from '@/components/dialog';
import { AppText, Button, Chip, Divider } from '@/components/ui';
import { useContent } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';
import { Fonts, Radius, Spacing } from '@/theme/colors';

type Row = { id: string; name: string; hint?: string };

/** Interruttori «Esaurito» per tutte le voci: ogni tocco aggiorna subito il menù dei clienti. */
export default function SoldOutScreen() {
  const theme = useTheme();
  const { menu, lunch, soldOut } = useContent();
  const [search, setSearch] = useState('');
  const [onlyOut, setOnlyOut] = useState(false);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const outCount = Object.values(soldOut).filter(Boolean).length;

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const groups: { key: string; title: string; data: Row[] }[] = [];
    if (lunch.dishes.length) {
      groups.push({ key: 'pranzo', title: 'Pranzo del giorno', data: lunch.dishes.map((d) => ({ id: d.id, name: d.name })) });
    }
    menu.forEach((c) =>
      groups.push({
        key: c.id,
        title: c.title,
        data: c.items.filter((i) => !i.hidden).map((i) => ({ id: i.id, name: i.name, hint: i.description })),
      }),
    );
    return groups
      .map((g) => ({
        ...g,
        data: g.data.filter(
          (r) => (!q || r.name.toLowerCase().includes(q)) && (!onlyOut || soldOut[r.id]),
        ),
      }))
      .filter((g) => g.data.length > 0);
  }, [menu, lunch, soldOut, search, onlyOut]);

  const toggle = async (id: string, value: boolean) => {
    setPending((p) => ({ ...p, [id]: value }));
    try {
      await backend.setSoldOut(id, value);
    } catch (e) {
      dialog.alert('Aggiornamento non riuscito', errorMessage(e));
    } finally {
      setPending(({ [id]: _done, ...rest }) => rest);
    }
  };

  const resetAll = async () => {
    const ok = await dialog.confirm({
      title: 'Rendere tutto disponibile?',
      message: `Toglie «Esaurito» da ${outCount} voci (ad esempio a inizio giornata).`,
      confirmText: 'Ripristina',
    });
    if (!ok) return;
    try {
      await backend.saveContent('availability', { soldOut: {} });
    } catch (e) {
      dialog.alert('Aggiornamento non riuscito', errorMessage(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.top}>
        <AppText variant="body" color={theme.textSecondary}>
          Ogni interruttore aggiorna subito il menù dei clienti con la scritta «Esaurito».
        </AppText>
        <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cerca un prodotto"
            placeholderTextColor={theme.textSecondary}
            style={{ flex: 1, color: theme.text, fontSize: 16, fontFamily: Fonts.regular, paddingVertical: 10 }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
          <Chip label="Tutti" active={!onlyOut} onPress={() => setOnlyOut(false)} />
          <Chip label={`Esauriti (${outCount})`} active={onlyOut} onPress={() => setOnlyOut(true)} />
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(r) => r.id}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl * 2 }}
        renderSectionHeader={({ section }) => (
          <View style={{ backgroundColor: theme.background, paddingTop: Spacing.md, paddingBottom: Spacing.xs }}>
            <AppText variant="overline">{section.title}</AppText>
          </View>
        )}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => {
          const value = pending[item.id] ?? !!soldOut[item.id];
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" color={value ? theme.danger : theme.text}>
                  {item.name}
                </AppText>
                {value ? (
                  <AppText variant="caption" color={theme.danger}>
                    Esaurito
                  </AppText>
                ) : null}
              </View>
              <Switch
                accessibilityLabel={`Esaurito: ${item.name}`}
                value={value}
                onValueChange={(v) => toggle(item.id, v)}
                trackColor={{ true: theme.danger, false: theme.surfaceAlt }}
                thumbColor="#FFFFFF"
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <AppText variant="body" color={theme.textSecondary} style={{ marginTop: Spacing.lg }}>
            {onlyOut ? 'Nessun prodotto esaurito.' : 'Nessun prodotto trovato.'}
          </AppText>
        }
        ListFooterComponent={
          outCount > 0 ? (
            <Button
              title="Rendi tutto disponibile"
              variant="outline"
              icon="refresh"
              onPress={resetAll}
              style={{ marginTop: Spacing.lg }}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { padding: Spacing.md, gap: Spacing.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
});
