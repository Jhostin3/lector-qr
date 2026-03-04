import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { MerchantCard } from '../components/MerchantCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Button } from '../../../shared/components/Button';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';
import type { QRPayload } from '../../../services/qrService';

export default function PaymentConfirmScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { payload: rawPayload } = useLocalSearchParams<{ payload: string }>();

  const payload: QRPayload | null = rawPayload ? JSON.parse(rawPayload) : null;

  const [amount, setAmount] = useState(payload?.amount?.toString() ?? '0');
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  // Ref para disparar confirmación automática tras re-inicializar con nuevo monto
  const confirmAfterInit = useRef(false);

  const {
    flowState,
    paymentIntent,
    paymentResult,
    errorMessage,
    initializePayment,
    confirmAndPay,
    cancelFlow,
  } = usePaymentFlow();

  // Crear el intent al montar con el monto del QR
  useEffect(() => {
    if (payload) {
      initializePayment(payload, parseFloat(amount) || payload.amount);
    }
  }, []);

  // Auto-confirmar si se re-inicializó por cambio de monto
  useEffect(() => {
    if (flowState === 'awaiting_confirmation' && confirmAfterInit.current) {
      confirmAfterInit.current = false;
      confirmAndPay();
    }
  }, [flowState]);

  // Navegar a éxito/error al terminar el flujo
  useEffect(() => {
    if (flowState === 'success' && paymentResult) {
      router.replace({
        pathname: '/payment/success',
        params: {
          transactionId: paymentResult.transactionId ?? '',
          completedAt: paymentResult.completedAt?.toISOString() ?? '',
          merchantName: payload?.merchantName ?? '',
          amount,
          currency: payload?.currency ?? 'MXN',
        },
      });
    } else if (flowState === 'error') {
      router.replace({
        pathname: '/payment/error',
        params: { errorMessage: errorMessage ?? 'Error desconocido' },
      });
    }
  }, [flowState]);

  const handleAmountChange = (text: string) => {
    if (/^\d*\.?\d{0,2}$/.test(text)) {
      setAmount(text);
    }
  };

  const handleConfirmPayment = () => {
    if (!payload) return;
    const finalAmount = parseFloat(amount) || payload.amount;

    if (!paymentIntent || Math.abs(finalAmount - paymentIntent.amount) > 0.001) {
      // El monto cambió: re-crear intent con nuevo valor, luego auto-confirmar
      confirmAfterInit.current = true;
      initializePayment(payload, finalAmount);
    } else {
      // Monto sin cambios: confirmar directamente
      confirmAndPay();
    }
  };

  const handleCancel = async () => {
    await cancelFlow();
    router.replace('/');
  };

  if (!payload) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[typography.bodyMedium, { color: colors.error }]}>
          Datos de pago inválidos
        </Text>
      </View>
    );
  }

  const isCreatingIntent = flowState === 'creating_intent';
  const isProcessing = flowState === 'processing';
  const isReady = flowState === 'awaiting_confirmation';
  const isBusy = isCreatingIntent || isProcessing;
  const canPay = !isBusy && !!parseFloat(amount);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[typography.headingLarge, { color: colors.textPrimary }]}>
              Confirmar pago
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 4 }]}>
              Revisa los detalles antes de continuar
            </Text>
          </View>

          <MerchantCard
            merchantName={payload.merchantName}
            description={payload.description}
            reference={payload.reference}
            amount={parseFloat(amount) || 0}
            currency={payload.currency}
          />

          {/* Monto editable */}
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Monto a pagar ({payload.currency})
            </Text>
            <TextInput
              style={[
                typography.headingLarge,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1.5,
                  borderColor: isAmountFocused ? colors.primary : colors.border,
                },
              ]}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setIsAmountFocused(false)}
              editable={!isBusy}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Estado del Intent */}
          {isCreatingIntent && (
            <View style={[styles.statusBadge, { backgroundColor: colors.primary + '12', borderRadius: borderRadius.md, marginTop: spacing.md }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[typography.bodySmall, { color: colors.primary, marginLeft: 10 }]}>
                Generando sesión de pago…
              </Text>
            </View>
          )}

          {isReady && paymentIntent && (
            <View style={[styles.statusBadge, { backgroundColor: colors.successBackground, borderRadius: borderRadius.md, marginTop: spacing.md }]}>
              <Text style={{ fontSize: 14 }}>🔒</Text>
              <Text style={[typography.bodySmall, { color: colors.success, marginLeft: 8 }]}>
                Sesión segura · {paymentIntent.id.slice(-8).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={[styles.securityNote, { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderColor: colors.border, marginTop: spacing.md }]}>
            <Text style={[typography.bodySmall, { color: colors.textTertiary, textAlign: 'center', lineHeight: 18 }]}>
              🔐 Transacción cifrada de extremo a extremo
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.actions, { backgroundColor: colors.background, borderTopColor: colors.border, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }]}>
          <Button
            label="Pagar ahora"
            onPress={handleConfirmPayment}
            fullWidth
            size="lg"
            disabled={!canPay}
            loading={isProcessing}
          />
          <Button
            label="Cancelar"
            onPress={handleCancel}
            variant="ghost"
            fullWidth
            size="md"
            disabled={isBusy}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </SafeAreaView>

      {isProcessing && (
        <LoadingOverlay message="Procesando pago" submessage="Autorizando con tu banco…" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 20 },
  headerSection: { marginBottom: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  securityNote: { padding: 14, borderWidth: 1 },
  actions: { borderTopWidth: 1, paddingTop: 16 },
});
