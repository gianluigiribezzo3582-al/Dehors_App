import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { ready } = useAuth();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Accedi', presentation: 'modal' }} />
      <Stack.Screen name="register" options={{ title: 'Registrati', presentation: 'modal' }} />
      <Stack.Screen name="profile" options={{ title: 'Il mio profilo' }} />
      <Stack.Screen name="history" options={{ title: 'Movimenti punti' }} />
      <Stack.Screen name="reward/[id]" options={{ title: 'Premio', presentation: 'modal' }} />
      <Stack.Screen name="scan" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="customer/[id]" options={{ title: 'Cliente' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.background },
      }}>
      <AuthProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
