import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useQRScanner } from '../hooks/useQRScanner';
import { ScannerOverlay } from '../components/ScannerOverlay';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';
import { useAuth } from '../../../shared/hooks/useAuth';

export default function ScannerScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { logout, user } = useAuth();

  const { scannerState, permission, requestPermission, onBarcodeScanned, resetScanner, lastError } =
    useQRScanner();

  useFocusEffect(
    useCallback(() => {
      resetScanner();
    }, [resetScanner])
  );

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
          Verificando permisos de cámara…
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={[typography.headingLarge, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }]}>
            Cámara requerida
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 }]}>
            Necesitamos acceso a tu cámara para escanear códigos QR de pago de forma segura.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Text style={[typography.labelLarge, { color: colors.textOnPrimary }]}>
              Permitir acceso
            </Text>
          </TouchableOpacity>
          {permission.canAskAgain === false && (
            <Text style={[typography.bodySmall, { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md }]}>
              Ve a Configuración → Privacidad → Cámara para habilitarla.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scannerState === 'scanning' ? onBarcodeScanned : undefined}
      />

      <ScannerOverlay
        isDetected={scannerState === 'detected'}
        hasError={scannerState === 'error'}
        errorMessage={lastError}
      />

      {/* Header con nombre de usuario y botón de salir */}
      <SafeAreaView style={styles.header}>
        <View style={[styles.headerContent, { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: borderRadius.full }]}>
          <View style={styles.headerInner}>
            <View>
              <Text style={[typography.headingSmall, { color: 'white' }]}>El Gran Checkout</Text>
              {user?.name ? (
                <Text style={[typography.bodySmall, { color: 'rgba(255,255,255,0.7)' }]}>
                  🏪 {user.name.split(' ')[0]}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={logout}
              activeOpacity={0.7}
              style={[styles.logoutBtn, { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.md }]}
            >
              <Text style={[typography.labelSmall, { color: 'rgba(255,255,255,0.9)' }]}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.footer}>
        <View style={[styles.footerHint, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: borderRadius.lg }]}>
          <Text style={[typography.bodySmall, { color: 'rgba(255,255,255,0.7)', textAlign: 'center' }]}>
            Apunta al código QR de pago dentro del marco
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'black' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionContainer: { alignItems: 'center', maxWidth: 320 },
  permissionEmoji: { fontSize: 64, marginBottom: 16 },
  permissionButton: { paddingVertical: 14, paddingHorizontal: 32, alignSelf: 'stretch', alignItems: 'center' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', paddingTop: 8 },
  headerContent: { paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  footer: { position: 'absolute', bottom: 60, left: 32, right: 32, alignItems: 'center' },
  footerHint: { paddingHorizontal: 20, paddingVertical: 12 },
});
