import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText, Button, Field, Screen } from '@/components/ui';
import { Loyalty } from '@/config/loyalty';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';
import { Spacing } from '@/theme/colors';

export default function RegisterScreen() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (name.trim().length < 2) return setError('Inserisci il tuo nome.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Inserisci un indirizzo email valido.');
    if (password.length < 6) return setError('La password deve avere almeno 6 caratteri.');
    if (!privacy) return setError('Per continuare accetta il trattamento dei dati.');
    setLoading(true);
    try {
      await backend.signUp({ name, email, password, phone });
      router.dismissAll();
      router.replace('/card');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen edges={[]}>
        <AppText variant="title">Crea la tua tessera</AppText>
        {Loyalty.welcomeBonus > 0 && (
          <AppText variant="body" color={theme.accent}>
            In regalo {Loyalty.welcomeBonus} punti di benvenuto.
          </AppText>
        )}
        <Field label="Nome e cognome" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
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
          label="Telefono (facoltativo)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
        <Field
          label="Password (min. 6 caratteri)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Pressable
          onPress={() => setPrivacy((v) => !v)}
          style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
          <Ionicons name={privacy ? 'checkbox' : 'square-outline'} size={22} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <AppText variant="caption">
              Acconsento al trattamento dei miei dati per la gestione della tessera fedeltà.
            </AppText>
          </View>
        </Pressable>
        {error && (
          <AppText variant="caption" color={theme.danger}>
            {error}
          </AppText>
        )}
        <Button title="Registrati" onPress={submit} loading={loading} />
        <Button title="Hai già un account? Accedi" variant="ghost" onPress={() => router.replace('/login')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
