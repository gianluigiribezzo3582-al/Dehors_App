import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { LogoMarkRatio, LogoMarkSvg } from '@/config/logo';
import { Venue } from '@/config/venue';
import { useIsDark } from '@/hooks/use-theme';
import { Fonts, Palette } from '@/theme/colors';
import { AppText } from './ui';

type Props = {
  /**
   * stacked: pittogramma sopra la scritta (come sul biglietto)
   * inline: pittogramma piccolo accanto alla scritta (intestazioni)
   * mark: solo pittogramma
   */
  variant?: 'stacked' | 'inline' | 'mark';
  /** Altezza della scritta «dehors» in punti. */
  size?: number;
  /** Colore forzato (es. bianco sopra la tessera verde). Di default segue il tema. */
  color?: string;
};

export function LogoMark({ height, color }: { height: number; color?: string }) {
  const dark = useIsDark();
  return (
    <SvgXml
      xml={LogoMarkSvg}
      height={height}
      width={height * LogoMarkRatio}
      color={color ?? (dark ? Palette.cream : Palette.green)}
    />
  );
}

/** Marchio Dehors CAFÈ-BISTROT: si adatta al tema chiaro/scuro del telefono. */
export function Logo({ variant = 'inline', size = 34, color }: Props) {
  const dark = useIsDark();
  const tint = color ?? (dark ? Palette.cream : Palette.green);

  const wordmark = (
    <View style={{ alignItems: variant === 'stacked' ? 'center' : 'flex-start' }}>
      <AppText
        color={tint}
        style={{ fontFamily: Fonts.medium, fontSize: size, lineHeight: size * 1.05, letterSpacing: -size * 0.01 }}>
        {Venue.name.toLowerCase()}
      </AppText>
      <AppText
        color={tint}
        style={{ fontFamily: Fonts.medium, fontSize: size * 0.27, lineHeight: size * 0.34, letterSpacing: size * 0.09 }}>
        {Venue.subtitle}
      </AppText>
    </View>
  );

  if (variant === 'mark') return <LogoMark height={size * 1.6} color={tint} />;

  if (variant === 'stacked') {
    return (
      <View accessibilityLabel={Venue.fullName} style={{ alignItems: 'center', gap: size * 0.3 }}>
        <LogoMark height={size * 2.2} color={tint} />
        {wordmark}
      </View>
    );
  }

  return (
    <View accessibilityLabel={Venue.fullName} style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.3 }}>
      <LogoMark height={size * 1.2} color={tint} />
      {wordmark}
    </View>
  );
}
