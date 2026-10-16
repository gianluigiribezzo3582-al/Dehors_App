import { router } from 'expo-router';
import { useState } from 'react';

import { dialog } from '@/components/dialog';
import { AppText, Button, Field, Loading, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { backend, errorMessage } from '@/services/backend';
import type { UserProfile } from '@/services/types';
import { formatDate } from '@/utils/format';

export default function ProfileScreen() {
  const { profile } = useAuth();
  if (!profile) return <Loading />;
  return <ProfileForm key={profile.id} profile={profile} />;
}

function ProfileForm({ profile }: { profile: UserProfile }) {
  const theme = useTheme();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (name.trim().length < 2) return dialog.alert('Inserisci il tuo nome.');
    setSaving(true);
    try {
      await backend.updateOwnProfile(profile.id, { name, phone });
      router.back();
    } catch (e) {
      dialog.alert(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const ok = await dialog.confirm({
      title: 'Eliminare l\'account?',
      message: 'La tessera e tutti i punti accumulati verranno cancellati definitivamente.',
      confirmText: 'Elimina',
      destructive: true,
    });
    if (!ok) return;
    try {
      await backend.deleteAccount();
      router.dismissAll();
    } catch (e) {
      dialog.alert(errorMessage(e));
    }
  };

  return (
    <Screen edges={[]}>
      <AppText variant="caption">
        {profile.email} · cliente dal {formatDate(profile.createdAt)}
      </AppText>
      <Field label="Nome e cognome" value={name} onChangeText={setName} />
      <Field label="Telefono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button title="Salva" onPress={save} loading={saving} />
      <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 24 }}>
        Puoi eliminare il tuo account in qualsiasi momento.
      </AppText>
      <Button title="Elimina account" variant="danger" icon="trash-outline" onPress={remove} />
    </Screen>
  );
}
