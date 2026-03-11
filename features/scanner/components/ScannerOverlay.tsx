import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';

interface ScannerOverlayProps {
  isDetected: boolean;
  hasError: boolean;
  errorMessage?: string | null;
}

export function ScannerOverlay({ isDetected, hasError, errorMessage }: ScannerOverlayProps) {
  const { colors, typography, spacing } = useAppTheme();

  const getBorderColor = () => {
    if (hasError) return colors.error;
    if (isDetected) return colors.success;
    return 'rgba(255, 255, 255, 0.5)';
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Scan box */}
      <View style={styles.scanBoxContainer}>
        <View style={[styles.scanBox, { borderColor: getBorderColor() }]} />
      </View>

      {/* Bottom message */}
      <View style={[styles.messageContainer, { bottom: spacing.xxl }]}>
        {hasError && (
          <View style={[styles.messageContent, { backgroundColor: colors.errorContainer }]}>
            <Text style={[typography.bodyMedium, { color: colors.onErrorContainer }]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {isDetected && !hasError && (
          <View style={[styles.messageContent, { backgroundColor: colors.successContainer }]}>
            {/* <LottieView
              source={require('../../../../assets/animations/loading.json')}
              autoPlay
              loop
              style={styles.lottieSmall}
            /> */}
            <Text style={[typography.bodyMedium, { color: colors.onSuccessContainer }]}>
              Procesando...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scanBoxContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBox: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderRadius: 24,
  },
  messageContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  lottieSmall: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});
