import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';

interface LoadingOverlayProps {
  message: string;
  submessage?: string;
}

export function LoadingOverlay({ message, submessage }: LoadingOverlayProps) {
  const { colors, typography, borderRadius } = useAppTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    const dots = Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 2, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 3, duration: 400, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    dots.start();

    return () => dots.stop();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        styles.container,
        { backgroundColor: 'rgba(0,0,0,0.55)', opacity: fadeAnim },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Spinner personalizado */}
        <View style={[styles.spinnerContainer, { backgroundColor: colors.primary + '15', borderRadius: 40 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

        <Text style={[typography.headingSmall, { color: colors.textPrimary, marginTop: 20 }]}>
          {message}
        </Text>

        {submessage && (
          <Text
            style={[
              typography.bodySmall,
              { color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
            ]}
          >
            {submessage}
          </Text>
        )}

        {/* Indicador de progreso visual */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <AnimatedDot key={i} index={i} color={colors.primary} dotsAnim={dotsAnim} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function AnimatedDot({
  index,
  color,
  dotsAnim,
}: {
  index: number;
  color: string;
  dotsAnim: Animated.Value;
}) {
  const scale = dotsAnim.interpolate({
    inputRange: [index, index + 0.5, index + 1],
    outputRange: [1, 1.6, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: color,
        marginHorizontal: 4,
        opacity: 0.7,
        transform: [{ scale }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    padding: 32,
    alignItems: 'center',
    width: 280,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  spinnerContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
});
