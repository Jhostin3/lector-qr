import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useQRScanner } from '../hooks/useQRScanner';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';

export default function ScannerScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { permission, requestPermission } = useQRScanner({});

  // ── Estado: esperando permisos ──────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
          Verificando permisos de cámara…
        </Text>
      </View>
    );
  }

  // ── Estado: permiso denegado ────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text
            style={[
              typography.headingLarge,
              { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
            ]}
          >
            Cámara requerida
          </Text>
          <Text
            style={[
              typography.bodyMedium,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: spacing.xl,
                lineHeight: 22,
              },
            ]}
          >
            Necesitamos acceso a tu cámara para escanear códigos QR de pago de forma segura.
          </Text>
          <TouchableOpacity
            style={[
              styles.permissionButton,
              { backgroundColor: colors.primary, borderRadius: borderRadius.md },
            ]}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Text style={[typography.labelLarge, { color: colors.textOnPrimary }]}>
              Permitir acceso
            </Text>
          </TouchableOpacity>

          {permission.canAskAgain === false && (
            <Text
              style={[
                typography.bodySmall,
                { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md },
              ]}
            >
              Ve a Configuración → Privacidad → Cámara para habilitarla.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return <View />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  permissionEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
