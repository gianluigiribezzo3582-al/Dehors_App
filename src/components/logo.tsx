import { Image } from 'expo-image';
import { View } from 'react-native';

import { Venue, VenueLogo } from '@/config/venue';
import { useTheme } from '@/hooks/use-theme';
import { AppText } from './ui';

/** Mostra il logo ufficiale se configurato, altrimenti il nome del locale. */
export function Logo({ size = 'md', color }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const theme = useTheme();
  const height = { sm: 28, md: 44, lg: 88 }[size];
  if (VenueLogo) {
    return <Image source={VenueLogo} style={{ height, width: height * 3 }} contentFit="contain" />;
  }
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <AppText
        variant={size === 'lg' ? 'display' : 'title'}
        color={color ?? theme.primary}
        style={{ letterSpacing: 4, fontSize: height * 0.7, lineHeight: height }}>
        {Venue.name.toUpperCase()}
      </AppText>
    </View>
  );
}
