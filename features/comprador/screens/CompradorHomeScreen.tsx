import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect, Link } from 'expo-router';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { supabase } from '../../../services/supabase';
import { formatCurrency, formatDate, generateShortId } from '../../../shared/utils/formatters';

interface Payment {
  id: string;
  transaction_id: string | null;
  amount: number;
  currency: string;
  merchant_name: string;
  description: string;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
}

interface QRPayload {
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
}

export default function CompradorHomeScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { user, logout } = useAuth();

  const [amountInput, setAmountInput] = useState('');
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = useCallback(async () => {
    if (!user) return;
    setLoadingPayments(true);
    const { data, error } = await supabase
      .from('payments')
      .select('id, transaction_id, amount, currency, merchant_name, description, status, created_at')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) setPayments(data as Payment[]);
    setLoadingPayments(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handleGenerateQR = () => {
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) return;
    if (!user) return; // guardia: user puede ser null si el perfil no cargó aún

    const payload: QRPayload = {
      merchantId: user.id,
      merchantName: user.name,
      amount,
      currency: 'MXN',
      description: `Pago de ${user.name}`,
      reference: `REF-${generateShortId()}`,
    };
    setQrPayload(JSON.stringify(payload));
  };

  const handleClearQR = () => {
    setQrPayload(null);
    setAmountInput('');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleAmountChange = (text: string) => {
    if (/^\d*\.?\d{0,2}$/.test(text)) {
      setAmountInput(text);
      setQrPayload(null); // Limpiar QR si cambia el monto
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
              Hola, {user?.name?.split(' ')[0]} 👋
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary + '18', borderRadius: borderRadius.full }]}>
              <Text style={[typography.labelSmall, { color: colors.primary }]}>🛒 COMPRADOR</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Text style={[typography.labelMedium, { color: colors.error }]}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* ── Generar QR ───────────────────────────────────────────────────── */}
        <Text style={[typography.headingSmall, { color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.md }]}>
          Generar QR de pago
        </Text>

        <Card elevated>
          {qrPayload ? (
            /* QR generado */
            <View style={styles.qrContainer}>
              <View style={[styles.qrWrapper, { backgroundColor: 'white', borderRadius: borderRadius.lg, padding: 16 }]}>
                <QRCode
                  value={qrPayload}
                  size={220}
                  color="#000000"
                  backgroundColor="white"
                />
              </View>
              <Text style={[typography.amount, { color: colors.textPrimary, marginTop: spacing.md }]}>
                {formatCurrency(parseFloat(amountInput), 'MXN')}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4, textAlign: 'center' }]}>
                Muestra este QR al vendedor para pagar
              </Text>
              <Button
                label="Generar nuevo QR"
                onPress={handleClearQR}
                variant="outline"
                size="md"
                style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
              />
            </View>
          ) : (
            /* Input de monto */
            <View>
              <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
                Monto a pagar (MXN)
              </Text>
              <TextInput
                value={amountInput}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                style={[
                  typography.amount,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    borderWidth: 1.5,
                    borderColor: colors.border,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  },
                ]}
              />
              <Button
                label="Generar QR"
                onPress={handleGenerateQR}
                fullWidth
                size="lg"
                disabled={!parseFloat(amountInput)}
              />
            </View>
          )}
        </Card>

        {/* ── Botón para ver el mapa ──────────────────────────────────────────────── */}
        <Link href="/map" asChild>
          <TouchableOpacity style={{ marginTop: spacing.lg }}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[typography.labelLarge, { color: colors.primary, marginRight: 8 }]}>Ver comercios en el mapa</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </Link>

        {/* ── Mis pagos ────────────────────────────────────────────────────── */}
        <Text style={[typography.headingSmall, { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md }]}>
          Mis pagos
        </Text>

        {loadingPayments ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : payments.length === 0 ? (
          <Card>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center' }]}>
              Aún no tienes pagos registrados.{'\n'}Genera un QR y paga 🎉
            </Text>
          </Card>
        ) : (
          payments.map((payment, index) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              colors={colors}
              typography={typography}
              spacing={spacing}
              borderRadius={borderRadius}
              showDivider={index < payments.length - 1}
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function PaymentRow({ payment, colors, typography, spacing, borderRadius, showDivider }: any) {
  const isSuccess = payment.status === 'success';
  const date = new Date(payment.created_at);

  return (
    <View style={[
      styles.paymentRow,
      {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderColor: colors.border,
        marginBottom: 8,
      },
    ]}>
      {/* Icono de estado */}
      <View style={[
        styles.statusDot,
        {
          backgroundColor: isSuccess ? colors.successBackground : colors.errorBackground,
          borderRadius: borderRadius.full,
        },
      ]}>
        <Text style={{ fontSize: 14 }}>{isSuccess ? '✓' : '✕'}</Text>
      </View>

      {/* Info */}
      <View style={styles.flex}>
        <Text style={[typography.labelLarge, { color: colors.textPrimary }]}>
          {formatCurrency(payment.amount, payment.currency)}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
          {payment.description}
        </Text>
        <Text style={[typography.labelSmall, { color: colors.textTertiary, marginTop: 2 }]}>
          {formatDate(date)}
        </Text>
      </View>

      {/* Badge de estado */}
      <View style={[
        styles.statusBadge,
        {
          backgroundColor: isSuccess ? colors.successBackground : colors.errorBackground,
          borderRadius: borderRadius.sm,
        },
      ]}>
        <Text style={[typography.labelSmall, { color: isSuccess ? colors.success : colors.error }]}>
          {isSuccess ? 'Exitoso' : 'Fallido'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  qrContainer: { alignItems: 'center' },
  qrWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  statusDot: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4 },
});
