import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Card, Divider, ListRow, Screen, type IconName } from '@/components/ui';
import { useContent } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';

export default function ManageRewardsScreen() {
  const theme = useTheme();
  const { rewards } = useContent();
  const sorted = rewards.slice().sort((a, b) => a.cost - b.cost);

  return (
    <Screen edges={[]}>
      <AppText variant="body" color={theme.textSecondary}>
        I clienti vedono i premi attivi, ordinati per punti. Le modifiche valgono subito.
      </AppText>
      <Card style={{ gap: 0, paddingVertical: Spacing.xs }}>
        {sorted.length === 0 ? (
          <AppText variant="body" color={theme.textSecondary}>
            Nessun premio.
          </AppText>
        ) : (
          sorted.map((r, i) => (
            <View key={r.id} style={{ opacity: r.active ? 1 : 0.5 }}>
              {i > 0 && <Divider />}
              <ListRow
                icon={r.icon as IconName}
                title={r.title}
                subtitle={`${r.cost} punti · ${r.repeatable ? 'più volte' : 'una volta'}${r.active ? '' : ' · disattivato'}`}
                onPress={() => router.push({ pathname: '/manage/reward', params: { id: r.id } })}
                right={<Ionicons name="ellipse" size={14} color={r.tint} />}
              />
            </View>
          ))
        )}
      </Card>
      <Button title="Nuovo premio" icon="add" onPress={() => router.push({ pathname: '/manage/reward', params: { id: 'new' } })} />
    </Screen>
  );
}
