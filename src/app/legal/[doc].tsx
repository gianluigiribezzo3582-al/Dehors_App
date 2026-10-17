import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { Legal, type LegalKey } from '@/legal';
import { Spacing } from '@/theme/colors';

/** Informativa privacy e regolamento, leggibili dentro l'app (anche senza account). */
export default function LegalScreen() {
  const theme = useTheme();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const content = Legal[(doc in Legal ? doc : 'privacy') as LegalKey];

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: doc === 'terms' ? 'Regolamento' : 'Privacy' }} />
      <View style={{ gap: Spacing.xs }}>
        <AppText variant="title">{content.title}</AppText>
        <AppText variant="caption">Ultimo aggiornamento: {content.updated}</AppText>
      </View>
      <AppText variant="body" color={theme.textSecondary}>
        {content.intro}
      </AppText>
      {content.sections.map((s) => (
        <View key={s.h} style={{ gap: Spacing.sm }}>
          <AppText variant="heading">{s.h}</AppText>
          {s.p.map((p) => (
            <AppText key={p.slice(0, 40)} variant="body" selectable>
              {p}
            </AppText>
          ))}
        </View>
      ))}
    </Screen>
  );
}
