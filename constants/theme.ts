// FinNest design system
//
// Calm, minimal dark theme: flat navy surfaces separated by hairline borders,
// a single restrained gold accent for primary actions and key figures, and a
// clear type scale. Legacy token names (deepNavy, glassMedium, lightGray, …)
// are kept and mapped onto the new palette so older components inherit it.

const palette = {
  navy950: '#060E1A',
  navy900: '#0A1628',
  navy850: '#0E1C31',
  navy800: '#111F35',
  navy700: '#172A45',
  navy600: '#1F3556',
  gold400: '#F5CD5F',
  gold500: '#F2C14E',
  gold600: '#E0AB30',
  slate50: '#F5F7FA',
  slate300: '#C3CDDA',
  slate400: '#9AA8BC',
  slate500: '#6B7A90',
  slate600: '#4A5870',
  green400: '#34D399',
  amber400: '#FBBF24',
  red400: '#F87171',
  blue400: '#60A5FA',
};

export const Colors = {
  // ─── Semantic tokens (use these in new code) ───
  background: palette.navy900,
  surface: palette.navy800,
  surfaceRaised: palette.navy700,
  surfacePressed: palette.navy600,
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  text: palette.slate50,
  textSecondary: palette.slate400,
  textTertiary: palette.slate500,
  accent: palette.gold500,
  accentPressed: palette.gold600,
  // Container for gold content (selected states, accent icon tiles). A navy
  // tone, not translucent gold — gold at low alpha over navy reads olive.
  accentMuted: '#1B2E4B',
  accentBorder: 'rgba(242, 193, 78, 0.35)',
  onAccent: palette.navy950,
  positive: palette.green400,
  positiveMuted: 'rgba(52, 211, 153, 0.12)',
  negative: palette.red400,
  negativeMuted: 'rgba(248, 113, 113, 0.12)',
  caution: palette.amber400,
  cautionMuted: 'rgba(251, 191, 36, 0.12)',
  overlay: 'rgba(3, 8, 16, 0.72)',

  // ─── Legacy names, remapped to the new palette ───
  deepNavy: palette.navy900,
  gold: palette.gold500,
  darkNavy: palette.navy950,
  mediumNavy: palette.navy800,
  lightNavy: palette.navy700,
  paleGold: palette.gold400,
  richGold: palette.gold600,

  glassLight: 'rgba(255, 255, 255, 0.04)',
  glassMedium: 'rgba(255, 255, 255, 0.06)',
  glassHeavy: 'rgba(255, 255, 255, 0.08)',
  glassDark: palette.navy800,

  success: palette.green400,
  warning: palette.amber400,
  error: palette.red400,
  info: palette.blue400,

  white: '#FFFFFF',
  lightGray: palette.slate400,
  mediumGray: palette.slate500,
  darkGray: palette.slate600,
  black: '#000000',

  // Gradients — const tuples so they satisfy LinearGradient's readonly
  // [ColorValue, ColorValue, ...] colors prop without a cast at every use.
  // Deliberately subtle: the design is flat, these only soften legacy buttons.
  goldGradient: [palette.gold400, palette.gold500] as const,
  navyGradient: [palette.navy900, palette.navy950] as const,
  glassGradient: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// Ready-made text styles — spread into StyleSheet entries.
export const Type = {
  display: { fontSize: 40, lineHeight: 46, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.8 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.4 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const, color: Colors.text, letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const, color: Colors.text },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const, color: Colors.text },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const, color: Colors.text },
  callout: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, color: Colors.textSecondary },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, color: Colors.textSecondary },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  number: { fontVariant: ['tabular-nums' as const] },
};

export const Shadows = {
  small: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },
  large: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 8,
  },
  gold: {
    shadowColor: palette.gold500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
};

export const GlassmorphismStyles = {
  light: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  medium: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heavy: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  dark: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
};

export const Animations = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// Height of the docked tab bar (excluding the bottom safe-area inset); screens
// pad their scroll content by this much so nothing hides behind it.
export const TAB_BAR_HEIGHT = 60;

export default {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Type,
  Shadows,
  GlassmorphismStyles,
  Animations,
};
