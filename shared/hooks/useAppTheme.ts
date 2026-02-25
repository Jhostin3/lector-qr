import { useColorScheme } from 'react-native';
import { lightColors, darkColors, spacing, borderRadius, typography, iconSize } from '../../theme';
import type { AppColors } from '../../theme';

export interface AppTheme {
  colors: AppColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  iconSize: typeof iconSize;
  isDark: boolean;
}

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    colors: isDark ? darkColors : lightColors,
    spacing,
    borderRadius,
    typography,
    iconSize,
    isDark,
  };
}
