import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { backend } from '@/services/backend';
import { Radius, Spacing } from '@/theme/colors';
import { AppText } from './ui';

/** Avvisa che i dati sono solo locali finché Firebase non è configurato. */
export function DemoBanner() {
  const theme = useTheme();
  if (backend.mode !== 'demo') return null;
  return (
    <View style={[styles.banner, { borderColor: theme.accent }]}>
      <Ionicons name="flask-outline" size={16} color={theme.accent} />
      <AppText variant="caption" color={theme.accent} style={{ flex: 1 }}>
        Modalità demo: i dati sono salvati solo su questo telefono. Staff di prova: staff@dehors.demo / staff123
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
});
