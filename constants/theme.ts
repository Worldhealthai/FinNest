// FinNest Theme System - Professional Glassmorphism Design

export const Colors = {
  // Primary Brand Colors
  deepNavy: '#0A2540',
  gold: '#FFD700',

  // Extended Palette
  darkNavy: '#051729',
  mediumNavy: '#0D2F52',
  lightNavy: '#1A3F63',
  paleGold: '#FFE55C',
  richGold: '#FFC700',

  // Glassmorphism Overlays
  glassLight: 'rgba(255, 255, 255, 0.1)',
  glassMedium: 'rgba(255, 255, 255, 0.15)',
  glassHeavy: 'rgba(255, 255, 255, 0.2)',
  glassDark: 'rgba(10, 37, 64, 0.7)',

  // Accent Colors
  success: '#5B9BD5',
  warning: '#FFB800',
  error: '#FF3B30',
  info: '#4A90E2',

  // Neutral Colors
  white: '#FFFFFF',
  lightGray: '#E5E5EA',
  mediumGray: '#8E8E93',
  darkGray: '#48484A',
  black: '#000000',

  // Gradients
  goldGradient: ['#FFD700', '#FFA500'],
  navyGradient: ['#0A2540', '#051729'],
  glassGradient: ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)'],
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
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const Shadows = {
  small: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gold: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const GlassmorphismStyles = {
  light: {
    backgroundColor: Colors.glassLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  medium: {
    backgroundColor: Colors.glassMedium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heavy: {
    backgroundColor: Colors.glassHeavy,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dark: {
    backgroundColor: Colors.glassDark,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
};

export const Animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

export default {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
  GlassmorphismStyles,
  Animations,
};
