import Ionicons from '@expo/vector-icons/Ionicons';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';

import type { IconName } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/theme/colors';

function icon(name: IconName, focusedName: IconName) {
  return function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? focusedName : name} color={color as string} size={size} />;
  };
}

export default function TabsLayout() {
  const theme = useTheme();
  const { isStaff } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: 11, fontFamily: Fonts.semibold },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="menu" options={{ title: 'Menù', tabBarIcon: icon('restaurant-outline', 'restaurant') }} />
      <Tabs.Screen name="card" options={{ title: 'Tessera', tabBarIcon: icon('qr-code-outline', 'qr-code') }} />
      <Tabs.Screen name="rewards" options={{ title: 'Premi', tabBarIcon: icon('gift-outline', 'gift') }} />
      <Tabs.Protected guard={isStaff}>
        <Tabs.Screen name="staff" options={{ title: 'Staff', tabBarIcon: icon('scan-outline', 'scan') }} />
      </Tabs.Protected>
      <Tabs.Screen
        name="info"
        options={{ title: 'Info', tabBarIcon: icon('information-circle-outline', 'information-circle') }}
      />
    </Tabs>
  );
}
