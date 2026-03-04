import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  TextInput, // Import TextInput
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

  // State for the amount input
  const [amount, setAmount] = useState(payload?.amount.toString() || '');
  const [isAmountEditable, setIsAmountEditable] = useState(false);

  const {
    flowState,
    paymentIntent,
    paymentResult,
    errorMessage,
    initializePayment,
    confirmAndPay,
    cancelFlow,
  } = usePaymentFlow();

  // Initialize the Payment Intent when the screen mounts
  useEffect(() => {
    if (payload) {
      initializePayment(payload, parseFloat(amount));
    }
  }, []);

  // Navigate to success/error when the flow ends
  useEffect(() => {
    if (flowState === 'success' && paymentResult) {
      router.replace({
        pathname: '/payment/success',
        params: {
          transactionId: paymentResult.transactionId,
          completedAt: paymentResult.completedAt?.toISOString(),
          merchantName: payload?.merchantName,
          amount: amount,
          currency: payload?.currency,
        },
      });
    } else if (flowState === 'error') {
      router.replace({
        pathname: '/payment/error',
        params: { errorMessage: errorMessage ?? 'Error desconocido' },
      });
    }
  }, [flowState]);

  const handleCancel = async () => {
    await cancelFlow();
    router.replace('/');
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      setAmount(text);
    }
  };

  const handleConfirmPayment = () => {
    if (payload) {
      initializePayment(payload, parseFloat(amount));
    }
    confirmAndPay();
  }

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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={[typography.headingLarge, { color: colors.textPrimary }]}>
              Confirmar pago
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 4 }]}>
              Revisa los detalles antes de continuar
            </Text>
          </View>

          {/* Merchant Card */}
          <MerchantCard
            merchantName={payload.merchantName}
            description={payload.description}
            reference={payload.reference}
            amount={parseFloat(amount) || 0}
            currency={payload.currency}
          />

          {/* Amount Input */}
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Monto a pagar ({payload.currency})
            </Text>
            <TextInput
              style={[
                typography.headingLarge, // Use a larger font for the amount
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: isAmountEditable ? colors.primary : colors.border,
                },
              ]}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              onFocus={() => setIsAmountEditable(true)}
              onBlur={() => setIsAmountEditable(false)}
            />
          </View>


          {/* Payment Intent Status */}
          {isCreatingIntent && (
            <View
              style={[
                styles.intentStatus,
                { backgroundColor: colors.primary + '12', borderRadius: borderRadius.md, marginTop: spacing.md },
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={[typography.bodySmall, { color: colors.primary, marginLeft: 10 }]}
              >
                Generando intent de pago seguro…
              </Text>
            </View>
          )}

          {isReady && paymentIntent && (
            <View
              style={[
                styles.intentStatus,
                { backgroundColor: colors.successBackground, borderRadius: borderRadius.md, marginTop: spacing.md },
              ]}
            >
              <Text style={{ fontSize: 14 }}>🔒</Text>
              <Text
                style={[typography.bodySmall, { color: colors.success, marginLeft: 8 }]}
              >
                Sesión segura establecida · {paymentIntent.id.slice(-8).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Security Note */}
          <View
            style={[
              styles.securityNote,
              { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderColor: colors.border, marginTop: spacing.md },
            ]}
          >
            <Text style={[typography.bodySmall, { color: colors.textTertiary, textAlign: 'center', lineHeight: 18 }]}>
              🔐 Transacción cifrada de extremo a extremo. Tu información financiera está protegida.
            </Text>
          </View>
        </ScrollView>

        {/* Actions */}
        <View
          style={[
            styles.actions,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.xl,
            },
          ]}
        >
          <Button
            label="Pagar ahora"
            onPress={handleConfirmPayment} // Use the new handler
            fullWidth
            size="lg"
            disabled={!isReady || !parseFloat(amount)}
            loading={isProcessing}
          />
          <Button
            label="Cancelar"
            onPress={handleCancel}
            variant="ghost"
            fullWidth
            size="md"
            disabled={isProcessing}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </SafeAreaView>

      {/* Processing Overlay */}
      {isProcessing && (
        <LoadingOverlay
          message="Procesando pago"
          submessage="Autorizando con tu banco…"
        />
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
  intentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  securityNote: {
    padding: 14,
    borderWidth: 1,
  },
  actions: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
});
