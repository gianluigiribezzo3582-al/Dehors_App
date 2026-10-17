import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components/ui';
import { useContent } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';
import { callNumber } from '@/utils/contacts';
import { formatEventDate } from '@/utils/format';

export default function EventScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, texts } = useContent();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Evento non più disponibile.</AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: 'Evento' }} />
      <View style={{ gap: Spacing.xs }}>
        <AppText variant="overline" color={theme.accent}>
          {formatEventDate(event.startsAt)}
        </AppText>
        <AppText variant="display">{event.title}</AppText>
      </View>
      {event.details ? (
        <Card>
          <AppText variant="label">{event.details}</AppText>
        </Card>
      ) : null}
      {event.description ? <AppText variant="body">{event.description}</AppText> : null}
      <Button title={`Prenota: ${texts.phone}`} icon="call" onPress={() => callNumber(texts.phone)} />
    </Screen>
  );
}
