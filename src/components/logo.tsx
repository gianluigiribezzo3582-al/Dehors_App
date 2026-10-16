import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { LogoSvg, LogoSvgDark } from '@/config/logo';
import { Venue } from '@/config/venue';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { Fonts, Palette } from '@/theme/colors';
import { AppText } from './ui';

type Size = 'sm' | 'md' | 'lg';

const HEIGHTS: Record<Size, number> = { sm: 32, md: 48, lg: 96 };

/** Marchio del locale: SVG ufficiale se presente, altrimenti logotipo testuale. Si adatta al tema. */
export function Logo({ size = 'md', align = 'left' }: { size?: Size; align?: 'left' | 'center' }) {
  const theme = useTheme();
  const dark = useIsDark();
  const color = dark ? Palette.cream : Palette.green;
  const height = HEIGHTS[size];

  const svg = (dark && LogoSvgDark) || LogoSvg;
  if (svg) {
    return <SvgXml xml={svg} height={height} width={height * 3} color={color} />;
  }

  const nameSize = height * 0.62;
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      <AppText
        style={{ fontFamily: Fonts.serif, fontSize: nameSize, lineHeight: nameSize * 1.1, letterSpacing: nameSize * 0.14, fontWeight: '600' }}
        color={color}>
        {Venue.name.toUpperCase()}
      </AppText>
      <AppText
        style={{ fontSize: Math.max(9, nameSize * 0.26), fontWeight: '700', letterSpacing: nameSize * 0.12 }}
        color={theme.accent}>
        {Venue.subtitle}
      </AppText>
    </View>
  );
}
