import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

type StatusType = 'success' | 'error' | 'warning' | 'loading';

interface StatusIconProps {
  type: StatusType;
  size?: number;
}

export function StatusIcon({ type, size = 80 }: StatusIconProps) {
  const { colors } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bgColor = {
    success: colors.successBackground,
    error: colors.errorBackground,
    warning: colors.warningBackground,
    loading: colors.surface,
  }[type];

  const iconColor = {
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    loading: colors.primary,
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '!',
    loading: '⟳',
  }[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Animated.Text
        style={{
          fontSize: size * 0.42,
          color: iconColor,
          fontWeight: '700',
          lineHeight: size * 0.54,
        }}
      >
        {icon}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
