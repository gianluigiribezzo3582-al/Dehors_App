import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, Divider, ListRow, SectionHeader, Screen } from '@/components/ui';
import type { EventItem } from '@/content/types';
import { useTheme } from '@/hooks/use-theme';
import { backend } from '@/services/backend';
import { Spacing } from '@/theme/colors';
import { formatEventDate } from '@/utils/format';

export default function ManageEventsScreen() {
  const theme = useTheme();
  const [events, setEvents] = useState<EventItem[]>([]);
  useEffect(() => backend.subscribeEvents(true, setEvents), []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events.filter((e) => e.startsAt >= today.getTime());
  const past = events.filter((e) => e.startsAt < today.getTime()).reverse();

  const row = (e: EventItem, i: number) => (
    <View key={e.id}>
      {i > 0 && <Divider />}
      <ListRow
        icon={e.published ? 'calendar' : 'calendar-outline'}
        title={e.title}
        subtitle={`${formatEventDate(e.startsAt)}${e.published ? '' : ' · bozza'}`}
        onPress={() => router.push({ pathname: '/manage/event', params: { id: e.id } })}
      />
    </View>
  );

  return (
    <Screen edges={[]}>
      <AppText variant="body" color={theme.textSecondary}>
        Gli eventi pubblicati compaiono in Home fino al giorno dell&apos;evento compreso.
      </AppText>
      <Button title="Nuovo evento" icon="add" onPress={() => router.push({ pathname: '/manage/event', params: { id: 'new' } })} />
      <SectionHeader title="In programma" />
      <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
        {upcoming.length ? upcoming.map(row) : <AppText variant="body" color={theme.textSecondary}>Nessun evento in programma.</AppText>}
      </Card>
      {past.length > 0 && (
        <>
          <SectionHeader title="Passati" />
          <Card style={{ gap: 0, paddingVertical: Spacing.xs, opacity: 0.7 }}>{past.slice(0, 20).map(row)}</Card>
        </>
      )}
    </Screen>
  );
}
