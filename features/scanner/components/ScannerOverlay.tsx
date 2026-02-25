import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.72;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

// Posición del frame centrado en pantalla (con offset vertical de -40)
const FRAME_LEFT = (SCREEN_WIDTH - FRAME_SIZE) / 2;
const FRAME_TOP = SCREEN_HEIGHT / 2 - FRAME_SIZE / 2 - 40;

interface ScannerOverlayProps {
  isDetected: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

export function ScannerOverlay({ isDetected, hasError, errorMessage }: ScannerOverlayProps) {
  const { colors, typography, spacing } = useAppTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const OVERLAY_COLOR = 'rgba(0,0,0,0.62)';

  // Animación de pulso del marco
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
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

      {/* ── 4 paneles oscuros que rodean el frame, sin tapar el centro ── */}
      {/* Panel superior */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: FRAME_TOP,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      {/* Panel inferior */}
      <View
        style={{
          position: 'absolute',
          top: FRAME_TOP + FRAME_SIZE,
          left: 0, right: 0, bottom: 0,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      {/* Panel izquierdo */}
      <View
        style={{
          position: 'absolute',
          top: FRAME_TOP,
          left: 0,
          width: FRAME_LEFT,
          height: FRAME_SIZE,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      {/* Panel derecho */}
      <View
        style={{
          position: 'absolute',
          top: FRAME_TOP,
          left: FRAME_LEFT + FRAME_SIZE,
          right: 0,
          height: FRAME_SIZE,
          backgroundColor: OVERLAY_COLOR,
        }}
      />

      {/* ── Frame del escáner (sobre la zona limpia de la cámara) ── */}
      <View
        style={{
          position: 'absolute',
          top: FRAME_TOP,
          left: FRAME_LEFT,
          width: FRAME_SIZE,
          height: FRAME_SIZE,
        }}
      >
        {/* Línea de escaneo */}
        {!isDetected && !hasError && (
          <Animated.View
            style={{
              position: 'absolute',
              height: 2,
              left: 4,
              width: FRAME_SIZE - 8,
              backgroundColor: colors.primary,
              opacity: 0.85,
              borderRadius: 1,
              transform: [{ translateY: scanLineTranslate }],
            }}
          />
        )}

        {/* Flash verde al detectar */}
        {isDetected && (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: colors.success,
              opacity: 0.18,
              borderRadius: 12,
            }}
          />
        )}

        {/* Esquinas animadas */}
        <Animated.View
          style={[StyleSheet.absoluteFillObject, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={[styles.cornerTL, { borderColor: cornerColor }]} />
          <View style={[styles.cornerTR, { borderColor: cornerColor }]} />
          <View style={[styles.cornerBL, { borderColor: cornerColor }]} />
          <View style={[styles.cornerBR, { borderColor: cornerColor }]} />
        </Animated.View>
      </View>

      {/* ── Texto de estado debajo del frame ── */}
      <View
        style={{
          position: 'absolute',
          top: FRAME_TOP + FRAME_SIZE + spacing.lg,
          left: 0,
          right: 0,
          alignItems: 'center',
          paddingHorizontal: 32,
        }}
      >
        <Text
          style={[
            typography.bodyMedium,
            {
              color: isDetected
                ? colors.success
                : hasError
                ? colors.error
                : 'rgba(255,255,255,0.85)',
              textAlign: 'center',
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
};

const styles = StyleSheet.create({
  cornerTL: {
    ...cornerStyle,
    top: 0, left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    ...cornerStyle,
    top: 0, right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    ...cornerStyle,
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    ...cornerStyle,
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 8,
  },
});
