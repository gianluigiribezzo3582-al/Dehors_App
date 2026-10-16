import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/colors';
import { AppText, Button, Card, type IconName } from './ui';

export function LoginPrompt({ icon, title, message }: { icon: IconName; title: string; message: string }) {
  const theme = useTheme();
  return (
    <Card style={{ alignItems: 'center', padding: Spacing.lg, gap: Spacing.md }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: theme.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name={icon} size={30} color={theme.primary} />
      </View>
      <AppText variant="title" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText variant="body" color={theme.textSecondary} style={{ textAlign: 'center' }}>
        {message}
      </AppText>
      <View style={{ alignSelf: 'stretch', gap: Spacing.sm }}>
        <Button title="Registrati" icon="person-add-outline" onPress={() => router.push('/register')} />
        <Button title="Ho già un account" variant="outline" onPress={() => router.push('/login')} />
      </View>
    </Card>
  );
}
