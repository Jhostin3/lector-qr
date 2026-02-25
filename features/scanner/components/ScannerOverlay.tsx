import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.72;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

interface ScannerOverlayProps {
  isDetected: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

export function ScannerOverlay({ isDetected, hasError, errorMessage }: ScannerOverlayProps) {
  const { colors, typography, spacing } = useAppTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const frameColorAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Animación de pulso del marco
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Animación de línea de escaneo
  useEffect(() => {
    const scanLine = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    scanLine.start();
    return () => scanLine.stop();
  }, []);

  // Color del marco según estado
  useEffect(() => {
    Animated.timing(frameColorAnim, {
      toValue: isDetected ? 1 : hasError ? 2 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isDetected, hasError]);

  const cornerColor = isDetected
    ? colors.success
    : hasError
    ? colors.error
    : colors.scannerCorner;

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 4],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Overlay oscuro con recorte */}
      <View style={[styles.overlay, { backgroundColor: colors.scannerOverlay }]} />

      {/* Frame central */}
      <View style={[styles.frameContainer, { width: FRAME_SIZE, height: FRAME_SIZE }]}>
        {/* Recorte transparente */}
        <View style={[styles.clearZone, { width: FRAME_SIZE, height: FRAME_SIZE }]}>

          {/* Línea de escaneo */}
          {!isDetected && !hasError && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  backgroundColor: colors.primary,
                  width: FRAME_SIZE - 8,
                  transform: [{ translateY: scanLineTranslate }],
                },
              ]}
            />
          )}

          {/* Flash de éxito */}
          {isDetected && (
            <Animated.View
              style={[
                styles.successFlash,
                { backgroundColor: colors.success, borderRadius: 12 },
              ]}
            />
          )}
        </View>

        {/* Esquinas del frame */}
        <Animated.View style={[styles.corners, { transform: [{ scale: pulseAnim }] }]}>
          {/* Esquina superior izquierda */}
          <View style={[styles.cornerTL, { borderColor: cornerColor }]} />
          {/* Esquina superior derecha */}
          <View style={[styles.cornerTR, { borderColor: cornerColor }]} />
          {/* Esquina inferior izquierda */}
          <View style={[styles.cornerBL, { borderColor: cornerColor }]} />
          {/* Esquina inferior derecha */}
          <View style={[styles.cornerBR, { borderColor: cornerColor }]} />
        </Animated.View>
      </View>

      {/* Texto de estado */}
      <View style={styles.labelContainer}>
        <Text
          style={[
            typography.bodyMedium,
            {
              color: isDetected ? colors.success : hasError ? colors.error : 'rgba(255,255,255,0.85)',
              textAlign: 'center',
              marginTop: spacing.lg,
              fontWeight: isDetected || hasError ? '600' : '400',
            },
          ]}
        >
          {isDetected
            ? '✓ QR detectado'
            : hasError
            ? errorMessage ?? 'QR no válido'
            : 'Apunta al código QR de pago'}
        </Text>
      </View>
    </View>
  );
}

const cornerStyle = {
  position: 'absolute' as const,
  width: CORNER_SIZE,
  height: CORNER_SIZE,
  borderColor: 'white',
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  frameContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -(FRAME_SIZE / 2),
    marginTop: -(FRAME_SIZE / 2) - 40,
  },
  clearZone: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    height: 2,
    left: 4,
    opacity: 0.85,
    borderRadius: 1,
  },
  successFlash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
  },
  corners: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerTL: {
    ...cornerStyle,
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    ...cornerStyle,
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    ...cornerStyle,
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    ...cornerStyle,
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 8,
  },
  labelContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: FRAME_SIZE / 2 - 40,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
