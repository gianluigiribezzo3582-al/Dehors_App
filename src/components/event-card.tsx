import { Pressable, StyleSheet, View } from 'react-native';

import type { EventItem } from '@/content/types';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/colors';
import { formatEventDate, relativeDay } from '@/utils/format';
import { AppText } from './ui';

/** Card evento con «francobollo» della data. */
export function EventCard({ event, onPress }: { event: EventItem; onPress?: () => void }) {
  const theme = useTheme();
  const d = new Date(event.startsAt);
  const badge = relativeDay(event.startsAt);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}>
      <View style={styles.date}>
        <AppText variant="overline" color={Palette.cream}>
          {d.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '')}
        </AppText>
        <AppText variant="title" color="#FFFFFF">
          {d.getDate()}
        </AppText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        {badge && (
          <AppText variant="overline" color={theme.accent}>
            {badge}
          </AppText>
        )}
        <AppText variant="heading" numberOfLines={2}>
          {event.title}
        </AppText>
        <AppText variant="caption">{formatEventDate(event.startsAt)}</AppText>
        {event.description ? (
          <AppText variant="body" color={theme.textSecondary} numberOfLines={2}>
            {event.description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
  },
  date: {
    width: 58,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Palette.green,
    alignItems: 'center',
  },
});
