import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { dialog } from '@/components/dialog';
import { ColorPicker, IconPicker, SwitchRow } from '@/components/form';
import { RewardCard } from '@/components/reward-card';
import { AppText, Button, Card, Field, SectionHeader, Screen } from '@/components/ui';
import type { RewardDef } from '@/content/types';
import { useContent } from '@/hooks/use-content';
import { useSaveContent } from '@/hooks/use-save';
import { newId } from '@/services/types';
import { Spacing } from '@/theme/colors';

const REWARD_ICONS = [
  'cafe', 'sunny', 'pricetag', 'wine', 'pizza', 'beer', 'ice-cream', 'fast-food', 'gift', 'star', 'heart', 'sparkles',
];
const REWARD_COLORS = ['#4A3222', '#6B4A2E', '#8A6240', '#2A3B31', '#3B4F42', '#1C2822', '#5A2E2E', '#2E3A4F'];

export default function ManageRewardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rewards } = useContent();
  const reward = rewards.find((r) => r.id === id);
  if (id !== 'new' && !reward) {
    return (
      <Screen edges={[]}>
        <AppText variant="body">Premio non trovato.</AppText>
      </Screen>
    );
  }
  return <RewardForm key={id} rewards={rewards} reward={reward} />;
}

function RewardForm({ rewards, reward }: { rewards: RewardDef[]; reward?: RewardDef }) {
  const { save, saving } = useSaveContent();
  const [title, setTitle] = useState(reward?.title ?? '');
  const [description, setDescription] = useState(reward?.description ?? '');
  const [cost, setCost] = useState(reward ? String(reward.cost) : '');
  const [icon, setIcon] = useState(reward?.icon ?? 'gift');
  const [tint, setTint] = useState(reward?.tint ?? REWARD_COLORS[0]);
  const [repeatable, setRepeatable] = useState(reward?.repeatable ?? true);
  const [active, setActive] = useState(reward?.active ?? true);

  const costValue = parseInt(cost, 10);
  const draft: RewardDef = {
    id: reward?.id ?? 'anteprima',
    title: title.trim() || 'Nome del premio',
    description: description.trim(),
    cost: Number.isFinite(costValue) ? costValue : 0,
    icon,
    tint,
    repeatable,
    active,
  };

  const submit = async () => {
    if (!title.trim()) return dialog.alert('Inserisci il nome del premio.');
    if (!Number.isInteger(costValue) || costValue <= 0) return dialog.alert('Inserisci i punti necessari (numero intero).');
    const updated = { ...draft, id: reward?.id ?? newId() };
    const items = reward ? rewards.map((r) => (r.id === reward.id ? updated : r)) : [...rewards, updated];
    if (await save('rewards', { items })) router.back();
  };

  const remove = async () => {
    if (!reward) return;
    const ok = await dialog.confirm({
      title: `Eliminare «${reward.title}»?`,
      message: 'Lo storico dei clienti resta invariato. Se vuoi solo nasconderlo, disattivalo.',
      confirmText: 'Elimina',
      destructive: true,
    });
    if (ok && (await save('rewards', { items: rewards.filter((r) => r.id !== reward.id) }))) router.back();
  };

  return (
    <Screen edges={[]}>
      <SectionHeader title="Anteprima" />
      <RewardCard reward={draft} profile={null} />
      <Card style={{ gap: Spacing.md }}>
        <Field label="Nome" value={title} onChangeText={setTitle} placeholder="Es. Caffè omaggio" />
        <Field label="Descrizione" value={description} onChangeText={setDescription} multiline />
        <Field label="Punti necessari" value={cost} onChangeText={setCost} keyboardType="number-pad" placeholder="20" />
      </Card>
      <Card>
        <SwitchRow
          label="Riscattabile più volte"
          hint={repeatable ? 'Il cliente può riscattarlo ogni volta che ha i punti' : 'Ogni cliente può riscattarlo una sola volta'}
          value={repeatable}
          onChange={setRepeatable}
        />
        <SwitchRow label="Attivo" hint="Se spento, i clienti non lo vedono" value={active} onChange={setActive} />
      </Card>
      <Card style={{ gap: Spacing.md }}>
        <AppText variant="caption">Icona</AppText>
        <IconPicker value={icon} options={REWARD_ICONS} onChange={setIcon} />
        <AppText variant="caption">Colore</AppText>
        <ColorPicker value={tint} options={REWARD_COLORS} onChange={setTint} />
      </Card>
      <Button title={reward ? 'Salva premio' : 'Crea premio'} onPress={submit} loading={saving} />
      {reward && <Button title="Elimina premio" icon="trash-outline" variant="danger" onPress={remove} />}
    </Screen>
  );
}
