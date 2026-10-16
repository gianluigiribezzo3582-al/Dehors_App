import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { dialog } from '@/components/dialog';
import { AppText, Button, Field, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';

export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Inserisci email e password.');
      return;
    }
    setLoading(true);
    try {
      await backend.signIn(email, password);
      router.dismissAll();
      router.replace('/card');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setError('Scrivi la tua email qui sopra, poi tocca «Password dimenticata».');
      return;
    }
    try {
      await backend.resetPassword(email);
      dialog.alert('Email inviata', 'Controlla la posta per reimpostare la password.');
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen edges={[]}>
        <AppText variant="title">Bentornato</AppText>
        <AppText variant="body" color={theme.textSecondary}>
          Accedi per vedere la tua tessera e i tuoi punti.
        </AppText>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={submit}
        />
        {error && (
          <AppText variant="caption" color={theme.danger}>
            {error}
          </AppText>
        )}
        <Button title="Accedi" onPress={submit} loading={loading} />
        <Button title="Password dimenticata" variant="ghost" onPress={forgot} />
        <Button title="Non hai un account? Registrati" variant="outline" onPress={() => router.replace('/register')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
