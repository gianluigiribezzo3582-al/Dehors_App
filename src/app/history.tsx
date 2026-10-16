import { FlatList } from 'react-native';

import { TransactionRow } from '@/components/transaction-row';
import { AppText, Divider } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-transactions';
import { Spacing } from '@/theme/colors';

export default function HistoryScreen() {
  const theme = useTheme();
  const { uid } = useAuth();
  const items = useTransactions(uid, 200);
  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: Spacing.md }}
      data={items}
      keyExtractor={(tx) => tx.id}
      renderItem={({ item }) => <TransactionRow tx={item} />}
      ItemSeparatorComponent={Divider}
      ListEmptyComponent={
        <AppText variant="body" color={theme.textSecondary}>
          Nessun movimento.
        </AppText>
      }
    />
  );
}
