import { Stack } from 'expo-router';

import { StaffOnly } from '@/components/staff-only';
import { useTheme } from '@/hooks/use-theme';

/** Gestione contenuti: solo staff (protetta anche dal layout principale). */
export default function ManageLayout() {
  const theme = useTheme();
  return (
    <StaffOnly>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="menu" options={{ title: 'Menù' }} />
        <Stack.Screen name="category/[id]" options={{ title: 'Categoria' }} />
        <Stack.Screen name="item" options={{ title: 'Voce del menù' }} />
        <Stack.Screen name="rewards" options={{ title: 'Premi' }} />
        <Stack.Screen name="reward" options={{ title: 'Premio' }} />
        <Stack.Screen name="events" options={{ title: 'Eventi' }} />
        <Stack.Screen name="event" options={{ title: 'Evento' }} />
        <Stack.Screen name="texts" options={{ title: 'Testi, contatti e orari' }} />
        <Stack.Screen name="notify" options={{ title: 'Invia notifica' }} />
      </Stack>
    </StaffOnly>
  );
}
