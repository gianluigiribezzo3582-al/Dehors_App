import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/colors';
import { AppText, Button } from './ui';

/**
 * Finestre di dialogo in stile app (al posto di Alert.alert, che sul web non viene mostrato).
 * Uso: `await dialog.confirm({ title, message })` oppure `dialog.alert(title, message)`.
 */
type DialogRequest = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string | null;
  destructive?: boolean;
  resolve: (ok: boolean) => void;
};

let current: DialogRequest | null = null;
const listeners = new Set<(d: DialogRequest | null) => void>();

function show(request: Omit<DialogRequest, 'resolve'>) {
  return new Promise<boolean>((resolve) => {
    current?.resolve(false);
    current = { ...request, resolve };
    listeners.forEach((l) => l(current));
  });
}

function close(ok: boolean) {
  const d = current;
  current = null;
  listeners.forEach((l) => l(null));
  d?.resolve(ok);
}

export const dialog = {
  confirm: (options: { title: string; message?: string; confirmText?: string; destructive?: boolean }) =>
    show({ cancelText: 'Annulla', confirmText: 'Conferma', ...options }),
  alert: (title: string, message?: string) =>
    show({ title, message, confirmText: 'OK', cancelText: null }).then(() => undefined),
};

/** Da montare una volta nel layout principale. */
export function DialogHost() {
  const theme = useTheme();
  const [request, setRequest] = useState<DialogRequest | null>(current);

  useEffect(() => {
    listeners.add(setRequest);
    return () => {
      listeners.delete(setRequest);
    };
  }, []);

  return (
    <Modal visible={request !== null} transparent animationType="fade" onRequestClose={() => close(false)}>
      <Pressable style={styles.backdrop} onPress={() => close(false)}>
        <Pressable style={[styles.box, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <AppText variant="heading">{request?.title}</AppText>
          {request?.message ? (
            <AppText variant="body" color={theme.textSecondary}>
              {request.message}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            {request?.cancelText ? (
              <Button title={request.cancelText} variant="outline" onPress={() => close(false)} style={styles.button} />
            ) : null}
            <Button
              title={request?.confirmText ?? 'OK'}
              variant={request?.destructive ? 'danger' : 'primary'}
              onPress={() => close(true)}
              style={styles.button}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  box: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.md,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  button: { flex: 1, paddingHorizontal: Spacing.md },
});
