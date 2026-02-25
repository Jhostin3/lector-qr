import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({ children, style, elevated = false, noPadding = false }: CardProps) {
  const { colors, borderRadius, spacing } = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderRadius: borderRadius.lg,
          padding: noPadding ? 0 : spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
