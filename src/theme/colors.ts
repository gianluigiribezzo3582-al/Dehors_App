/** Palette ricavata dal biglietto da visita: verde bosco e marrone su fondo bianco (chiaro) o nero (scuro). */
export const Palette = {
  green: '#2A3B31',
  greenDeep: '#1C2822',
  greenLight: '#9CBFA7',
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
    onPrimary: '#14201A',
    accent: Palette.brownLight,
    onAccent: '#000000',
    success: '#5DBB7E',
    danger: '#F2B8B5',
    tabBar: '#000000',
  },
};

export type ThemeColors = typeof Colors.light;

/** Urbanist: carattere geometrico simile a quello del logo. Caricato in src/app/_layout.tsx. */
export const Fonts = {
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const Radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
