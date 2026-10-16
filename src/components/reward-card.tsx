import Ionicons from '@expo/vector-icons/Ionicons';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';

import type { Reward } from '@/data/rewards';
import { Radius, Spacing } from '@/theme/colors';
import { AppText, ProgressBar, type IconName } from './ui';

/** Card premio con foto/sfondo (o colore pieno se manca l'immagine). */
export function RewardCard({
  reward,
  points,
  onPress,
  compact,
}: {
  reward: Reward;
  points: number | null;
  onPress?: () => void;
  compact?: boolean;
}) {
  const unlocked = points !== null && points >= reward.cost;
  const missing = points === null ? null : Math.max(0, reward.cost - points);
  const content = (
    <View style={[styles.overlay, reward.image ? styles.dim : null]}>
      <View style={styles.top}>
        <View style={styles.iconBadge}>
          <Ionicons name={reward.icon as IconName} size={18} color="#FFFFFF" />
        </View>
        <View style={[styles.costBadge, unlocked && styles.costUnlocked]}>
          <AppText variant="label" color={unlocked ? '#14271C' : '#FFFFFF'}>
            {reward.cost} pt
          </AppText>
        </View>
      </View>
      <View style={{ gap: Spacing.xs }}>
        <AppText variant={compact ? 'heading' : 'title'} color="#FFFFFF">
          {reward.title}
        </AppText>
        {!compact && (
          <AppText variant="body" color="rgba(255,255,255,0.85)">
            {reward.description}
          </AppText>
        )}
        {points !== null && (
          <View style={{ gap: Spacing.xs, marginTop: Spacing.xs }}>
            <ProgressBar value={points / reward.cost} color={unlocked ? '#E8D9B5' : 'rgba(255,255,255,0.7)'} />
            <AppText variant="caption" color="rgba(255,255,255,0.85)">
              {unlocked ? 'Disponibile · mostra la tessera al bancone' : `Ti mancano ${missing} punti`}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: reward.tint, minHeight: compact ? 150 : 200, opacity: pressed ? 0.9 : 1 },
      ]}>
      {reward.image ? (
        <ImageBackground source={reward.image} style={StyleSheet.absoluteFill} resizeMode="cover">
          {content}
        </ImageBackground>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, overflow: 'hidden' },
  overlay: { flex: 1, padding: Spacing.md, justifyContent: 'space-between', gap: Spacing.md },
  dim: { backgroundColor: 'rgba(0,0,0,0.42)' },
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
