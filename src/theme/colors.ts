import { Platform } from 'react-native';

/** Palette: verde scuro e marrone su fondo bianco (chiaro) o nero (scuro). */
export const Palette = {
  green: '#1F3D2B',
  greenDeep: '#14271C',
  greenLight: '#4F8A63',
  brown: '#6B4A2E',
  brownLight: '#A47A55',
  cream: '#F3EEE6',
};

export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F3EF',
    surfaceAlt: '#ECE7DF',
    border: '#E2DDD4',
    text: '#141414',
    textSecondary: '#6B6660',
    primary: Palette.green,
    onPrimary: '#FFFFFF',
    accent: Palette.brown,
    onAccent: '#FFFFFF',
    success: '#2F7A4A',
    danger: '#B3261E',
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#000000',
    surface: '#111311',
    surfaceAlt: '#1B1E1B',
    border: '#262A26',
    text: '#F5F3EF',
    textSecondary: '#A39E96',
    primary: Palette.greenLight,
    onPrimary: '#FFFFFF',
    accent: Palette.brownLight,
    onAccent: '#000000',
    success: '#5DBB7E',
    danger: '#F2B8B5',
    tabBar: '#000000',
  },
};

export type ThemeColors = typeof Colors.light;

export const Fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const Radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
