import { Urbanist_400Regular } from '@expo-google-fonts/urbanist/400Regular';
import { Urbanist_500Medium } from '@expo-google-fonts/urbanist/500Medium';
import { Urbanist_600SemiBold } from '@expo-google-fonts/urbanist/600SemiBold';
import { Urbanist_700Bold } from '@expo-google-fonts/urbanist/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { DialogHost } from '@/components/dialog';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { ContentProvider } from '@/hooks/use-content';
import { configureNotifications, onNotificationOpened, registerForPush } from '@/services/notifications';
import { Colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync();
configureNotifications();

function RootStack() {
  const { ready: authReady, isStaff, uid } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });
  // Se il carattere non si carica si prosegue comunque con quello di sistema.
  const ready = authReady && (fontsLoaded || fontError !== null);
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Registra il telefono per le notifiche (anche gli ospiti) e aggiorna il legame con l'utente.
  useEffect(() => {
    if (ready) registerForPush(uid);
  }, [ready, uid]);

  // Tocco su una notifica di un evento: apre il dettaglio.
  useEffect(() => {
    if (!ready) return;
    return onNotificationOpened((data) => {
      if (data?.eventId) router.push(`/event/${data.eventId}`);
    });
  }, [ready]);

  // Finché non conosciamo l'utente e il suo ruolo resta la schermata di avvio:
  // così le rotte staff non vengono mai valutate (né mostrate) con dati incompleti.
  if (!ready) return null;

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
      <Stack.Screen name="event/[id]" options={{ title: 'Evento' }} />
      <Stack.Screen name="legal/[doc]" options={{ title: 'Informazioni legali' }} />
      {/* Area staff: rotte inesistenti per chi non ha ruolo staff/admin. */}
      <Stack.Protected guard={isStaff}>
        <Stack.Screen name="scan" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="customer/[id]" options={{ title: 'Cliente' }} />
        <Stack.Screen name="manage" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Sfondo della finestra nativa in tinta con il tema (evita lampi bianchi in modalità scura).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.background },
      }}>
      <AuthProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <ContentProvider>
          <RootStack />
        </ContentProvider>
        <DialogHost />
      </AuthProvider>
    </ThemeProvider>
  );
}
