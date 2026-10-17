import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { LunchMenu } from '@/content/types';
import { useContent } from '@/hooks/use-content';
import { Palette, Radius, Spacing } from '@/theme/colors';
import { formatEuro } from '@/utils/format';
import { AppText } from './ui';

/** Riquadro «Pranzo del giorno» per la Home (mostrato solo nella fascia oraria del pranzo). */
export function LunchCard({ lunch }: { lunch: LunchMenu }) {
  const { soldOut } = useContent();
  const open = () => router.push({ pathname: '/menu', params: { cat: 'pranzo', t: String(Date.now()) } });

  return (
    <Pressable onPress={open} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <Ionicons name="restaurant" size={18} color={Palette.cream} />
          <AppText variant="overline" color={Palette.cream}>
            Pranzo del giorno
          </AppText>
        </View>
        <AppText variant="caption" color={Palette.cream}>
          fino alle {lunch.to}
        </AppText>
      </View>
      <View style={{ gap: Spacing.sm }}>
        {lunch.dishes.map((d) => {
          const out = !!soldOut[d.id];
          return (
            <View key={d.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" color={out ? 'rgba(255,255,255,0.55)' : '#FFFFFF'} style={out ? styles.strike : undefined}>
                  {d.name}
                </AppText>
                {d.description ? (
                  <AppText variant="caption" color="rgba(255,255,255,0.75)">
                    {d.description}
                  </AppText>
                ) : null}
              </View>
              {out ? (
                <View style={styles.badge}>
                  <AppText variant="overline" color={Palette.brown}>
                    Esaurito
                  </AppText>
                </View>
              ) : (
                <AppText variant="label" color="#E8D9B5">
                  {d.price !== undefined ? formatEuro(d.price) : ''}
                </AppText>
              )}
            </View>
          );
        })}
      </View>
      {lunch.note ? (
        <AppText variant="caption" color="rgba(255,255,255,0.75)">
          {lunch.note}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Palette.brown, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  strike: { textDecorationLine: 'line-through' },
  badge: { backgroundColor: Palette.cream, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
});
