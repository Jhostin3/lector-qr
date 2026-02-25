import { Platform } from 'react-native';

const fontFamily = {
  regular: Platform.select({ ios: 'SF Pro Text', android: 'Roboto', default: 'System' }),
  medium: Platform.select({ ios: 'SF Pro Text', android: 'Roboto-Medium', default: 'System' }),
  semibold: Platform.select({ ios: 'SF Pro Display', android: 'Roboto-Medium', default: 'System' }),
  bold: Platform.select({ ios: 'SF Pro Display', android: 'Roboto-Bold', default: 'System' }),
} as const;

export const typography = {
  displayLarge: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  headingLarge: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  headingMedium: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  headingSmall: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
    letterSpacing: -1,
  },
  amountLarge: {
    fontSize: 52,
    fontWeight: '700' as const,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
} as const;
