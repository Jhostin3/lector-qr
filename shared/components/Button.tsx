import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useHaptics } from '../hooks/useHaptics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, borderRadius, spacing, typography } = useAppTheme();
  const { lightImpact } = useHaptics();

  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (!isDisabled) {
      lightImpact();
      onPress();
    }
  };

  const containerStyle: ViewStyle = {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: isDisabled ? 0.5 : 1,
    alignSelf: fullWidth ? 'stretch' : 'auto',
    ...(size === 'sm' && { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }),
    ...(size === 'md' && { paddingVertical: 14, paddingHorizontal: spacing.lg }),
    ...(size === 'lg' && { paddingVertical: 18, paddingHorizontal: spacing.xl }),
    ...(variant === 'primary' && { backgroundColor: colors.primary }),
    ...(variant === 'secondary' && { backgroundColor: colors.surface }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    }),
    ...(variant === 'ghost' && { backgroundColor: 'transparent' }),
    ...(variant === 'danger' && { backgroundColor: colors.error }),
  };

  const labelStyle: TextStyle = {
    ...typography.labelLarge,
    ...(variant === 'primary' && { color: colors.textOnPrimary }),
    ...(variant === 'secondary' && { color: colors.textPrimary }),
    ...(variant === 'outline' && { color: colors.primary }),
    ...(variant === 'ghost' && { color: colors.primary }),
    ...(variant === 'danger' && { color: colors.white }),
    ...(size === 'sm' && { fontSize: 13 }),
    ...(size === 'lg' && { fontSize: 16 }),
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
        />
      ) : (
        <Text style={[labelStyle, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
