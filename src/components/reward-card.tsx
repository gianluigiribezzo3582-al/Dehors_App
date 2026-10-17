import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { RewardDef } from '@/content/types';
import { rewardStatus } from '@/hooks/use-content';
import type { UserProfile } from '@/services/types';
import { Radius, Spacing } from '@/theme/colors';
import { AppText, ProgressBar, type IconName } from './ui';

/** Card premio. Con `profile` mostra avanzamento e disponibilità per quel cliente. */
export function RewardCard({
  reward,
  profile,
  onPress,
  compact,
}: {
  reward: RewardDef;
  profile: Pick<UserProfile, 'points' | 'redeemed'> | null;
  onPress?: () => void;
  compact?: boolean;
}) {
  const status = rewardStatus(reward, profile);

  let caption: string | null = null;
  if (profile) {
    if (status.alreadyUsed) caption = 'Già riscattato';
    else if (status.available) caption = 'Disponibile · mostra la tessera al bancone';
    else caption = `Ti mancano ${status.missing} punti`;
  }

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: reward.tint, minHeight: compact ? 150 : 200, opacity: pressed ? 0.9 : status.alreadyUsed ? 0.6 : 1 },
      ]}>
      <View style={styles.top}>
        <View style={styles.iconBadge}>
          <Ionicons name={reward.icon as IconName} size={18} color="#FFFFFF" />
        </View>
        <View style={[styles.costBadge, status.available && styles.costUnlocked]}>
          <AppText variant="label" color={status.available ? '#14271C' : '#FFFFFF'}>
            {reward.cost} pt
          </AppText>
        </View>
      </View>
      <View style={{ gap: Spacing.xs }}>
        <AppText variant={compact ? 'heading' : 'title'} color="#FFFFFF">
          {reward.title}
        </AppText>
        {!compact && reward.description ? (
          <AppText variant="body" color="rgba(255,255,255,0.85)">
            {reward.description}
          </AppText>
        ) : null}
        <AppText variant="overline" color="rgba(255,255,255,0.7)">
          {reward.repeatable ? 'Riscattabile più volte' : 'Riscattabile una sola volta'}
        </AppText>
        {caption && (
          <View style={{ gap: Spacing.xs, marginTop: Spacing.xs }}>
            {!status.alreadyUsed && (
              <ProgressBar
                value={profile!.points / Math.max(1, reward.cost)}
                color={status.available ? '#E8D9B5' : 'rgba(255,255,255,0.7)'}
              />
            )}
            <AppText variant="caption" color="rgba(255,255,255,0.85)">
              {caption}
            </AppText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, overflow: 'hidden', padding: Spacing.md, justifyContent: 'space-between', gap: Spacing.md },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  costBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  costUnlocked: { backgroundColor: '#E8D9B5', borderColor: '#E8D9B5' },
});
