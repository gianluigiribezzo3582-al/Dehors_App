import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StaffOnly } from '@/components/staff-only';
import { AppText, Button, Loading, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { parseQrPayload } from '@/services/types';
import { Radius, Spacing } from '@/theme/colors';

export default function ScanScreen() {
  return (
    <StaffOnly>
      <Scanner />
    </StaffOnly>
  );
}

function Scanner() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const handled = useRef(false);

  if (!permission) return <Loading />;

  if (!permission.granted) {
    return (
      <Screen edges={[]} contentStyle={{ flex: 1, justifyContent: 'center' }}>
        <Ionicons name="camera-outline" size={48} color={theme.primary} style={{ alignSelf: 'center' }} />
        <AppText variant="title" style={{ textAlign: 'center' }}>
          Serve la fotocamera
        </AppText>
        <AppText variant="body" color={theme.textSecondary} style={{ textAlign: 'center' }}>
          Per leggere il QR della tessera consenti l&apos;accesso alla fotocamera.
        </AppText>
        <Button title="Consenti" onPress={requestPermission} />
        <Button title="Annulla" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  const onScanned = ({ data }: BarcodeScanningResult) => {
    if (handled.current) return;
    const uid = parseQrPayload(data);
    if (!uid) {
      setMessage('QR non riconosciuto: non è una tessera Dehors.');
      return;
    }
    handled.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace(`/customer/${uid}`);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onScanned}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.frame} />
        <AppText variant="label" color="#FFFFFF" style={styles.hint}>
          {message ?? 'Inquadra il QR della tessera'}
        </AppText>
        <View style={styles.controls}>
          <Pressable style={styles.round} onPress={() => setTorch((t) => !t)}>
            <Ionicons name={torch ? 'flash' : 'flash-outline'} size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.round} onPress={() => router.back()}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  frame: { width: 250, height: 250, borderRadius: Radius.lg, borderWidth: 3, borderColor: '#FFFFFF' },
  hint: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  controls: { position: 'absolute', bottom: 60, flexDirection: 'row', gap: Spacing.xl },
  round: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
