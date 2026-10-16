import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { PointsTransaction } from '@/services/types';
import { formatDateTime, transactionTitle } from '@/utils/format';
import { AppText, ListRow, type IconName } from './ui';

const ICONS: Record<PointsTransaction['kind'], IconName> = {
  welcome: 'gift-outline',
  earn: 'add-circle-outline',
  redeem: 'ribbon-outline',
  adjust: 'swap-vertical-outline',
};

export function TransactionRow({ tx, showStaff }: { tx: PointsTransaction; showStaff?: boolean }) {
  const theme = useTheme();
  const positive = tx.delta > 0;
  const subtitle = [formatDateTime(tx.createdAt), showStaff && tx.staffName ? tx.staffName : null]
    .filter(Boolean)
    .join(' · ');
  return (
    <ListRow
      icon={ICONS[tx.kind]}
      title={transactionTitle(tx)}
      subtitle={subtitle}
      right={
        <View>
          <AppText variant="label" color={positive ? theme.success : theme.accent}>
            {positive ? '+' : ''}
            {tx.delta}
          </AppText>
        </View>
      }
    />
  );
}
