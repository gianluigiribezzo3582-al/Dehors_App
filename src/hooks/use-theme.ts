import { useColorScheme } from 'react-native';

import { Colors } from '@/theme/colors';

export function useTheme() {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}

export function useIsDark() {
  return useColorScheme() === 'dark';
}
