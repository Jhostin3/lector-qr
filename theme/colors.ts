export const palette = {
  // Brand
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B85FF',

  // Semantic
  success: '#22C55E',
  successLight: '#DCFCE7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const;

export const lightColors = {
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  border: palette.gray200,
  borderSubtle: palette.gray100,

  textPrimary: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  textOnPrimary: palette.white,
  textOnDark: palette.white,

  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryLight: palette.primaryLight,

  success: palette.success,
  successBackground: palette.successLight,
  error: palette.error,
  errorBackground: palette.errorLight,
  warning: palette.warning,
  warningBackground: palette.warningLight,

  scannerOverlay: 'rgba(0, 0, 0, 0.6)',
  scannerBorder: palette.primary,
  scannerCorner: palette.primaryLight,
} as const;

export const darkColors: typeof lightColors = {
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceElevated: '#1C1C27',
  border: '#2A2A3D',
  borderSubtle: '#1E1E2D',

  textPrimary: '#F1F1F8',
  textSecondary: '#9090A8',
  textTertiary: '#5C5C72',
  textOnPrimary: palette.white,
  textOnDark: palette.white,

  primary: palette.primaryLight,
  primaryDark: palette.primary,
  primaryLight: '#A89BFF',

  success: '#34D399',
  successBackground: '#064E3B',
  error: '#F87171',
  errorBackground: '#450A0A',
  warning: '#FBBF24',
  warningBackground: '#451A03',

  scannerOverlay: 'rgba(0, 0, 0, 0.75)',
  scannerBorder: '#8B85FF',
  scannerCorner: '#A89BFF',
} as const;

export type AppColors = typeof lightColors;
