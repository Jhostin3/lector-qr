// Add a new comment for the eighth commit
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { StatusIcon } from '../../../shared/components/StatusIcon';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';
import { formatCurrency, formatDate, maskTransactionId } from '../../../shared/utils/formatters';

export default function PaymentSuccessScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const params = useLocalSearchParams<{
    transactionId: string;
    completedAt: string;
    merchantName: string;
    amount: string;
    currency: string;
  }>();

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const amount = parseFloat(params.amount ?? '0');
  const completedAt = params.completedAt ? new Date(params.completedAt) : new Date();

  const handleNewPayment = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { padding: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Icono de éxito */}
          <View style={styles.iconSection}>
            <StatusIcon type="success" size={100} />
          </View>

          {/* Textos principales */}
          <Animated.View
            style={[
              styles.textSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text
              style={[
                typography.displayMedium,
                { color: colors.textPrimary, textAlign: 'center' },
              ]}
            >
              ¡Pago exitoso!
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
              ]}
            >
              Tu transacción fue procesada y confirmada.
            </Text>
          </Animated.View>

          {/* Monto destacado */}
          <Animated.View
            style={[
              styles.amountSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                backgroundColor: colors.successBackground,
                borderRadius: borderRadius.xl,
                marginTop: spacing.xl,
              },
            ]}
          >
            <Text
              style={[typography.bodySmall, { color: colors.success, marginBottom: 4 }]}
            >
              Total pagado
            </Text>
            <Text style={[typography.amountLarge, { color: colors.success }]}>
              {formatCurrency(amount, params.currency ?? 'MXN')}
            </Text>
          </Animated.View>

          {/* Detalles de la transacción */}
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginTop: spacing.lg }}
          >
            <Card>
              <Text
                style={[
                  typography.labelSmall,
                  { color: colors.textTertiary, marginBottom: spacing.md, letterSpacing: 1 },
                ]}
              >
                DETALLES DE TRANSACCIÓN
              </Text>

              <DetailRow label="Comercio" value={params.merchantName ?? '-'} colors={colors} typography={typography} />
              <DetailRow
                label="ID Transacción"
                value={maskTransactionId(params.transactionId ?? '--------')}
                colors={colors}
                typography={typography}
                mono
              />
              <DetailRow
                label="Fecha y hora"
                value={formatDate(completedAt)}
                colors={colors}
                typography={typography}
                last
              />
            </Card>
          </Animated.View>
        </ScrollView>

        {/* Acción principal */}
        <View
          style={[
            styles.actions,
            {
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.xl,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Button
            label="Nuevo pago"
            onPress={handleNewPayment}
            fullWidth
            size="lg"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  colors,
  typography,
  mono = false,
  last = false,
}: {
  label: string;
  value: string;
  colors: any;
  typography: any;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 12, paddingBottom: 12 },
      ]}
    >
      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={[
          typography.labelMedium,
          { color: colors.textPrimary, fontFamily: mono ? 'monospace' : undefined },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingBottom: 20 },
  iconSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 8 },
  textSection: { alignItems: 'center', paddingHorizontal: 24 },
  amountSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  actions: { borderTopWidth: 1, paddingTop: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
