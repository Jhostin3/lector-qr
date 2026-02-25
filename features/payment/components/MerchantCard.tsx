import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';
import { formatCurrency } from '../../../shared/utils/formatters';

interface MerchantCardProps {
  merchantName: string;
  description: string;
  reference: string;
  amount: number;
  currency: string;
}

export function MerchantCard({
  merchantName,
  description,
  reference,
  amount,
  currency,
}: MerchantCardProps) {
  const { colors, typography, spacing } = useAppTheme();

  return (
    <Card elevated>
      {/* Logo placeholder del comercio */}
      <View style={styles.merchantRow}>
        <View style={[styles.merchantLogo, { backgroundColor: colors.primary + '20' }]}>
          <Text style={{ fontSize: 24 }}>🏪</Text>
        </View>
        <View style={styles.merchantInfo}>
          <Text style={[typography.headingSmall, { color: colors.textPrimary }]}>
            {merchantName}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
            {description}
          </Text>
        </View>
      </View>

      {/* Separador */}
      <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.md }]} />

      {/* Monto */}
      <View style={styles.amountContainer}>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Total a pagar</Text>
        <Text style={[typography.amount, { color: colors.textPrimary, marginTop: 4 }]}>
          {formatCurrency(amount, currency)}
        </Text>
      </View>

      {/* Referencia */}
      <View
        style={[
          styles.referenceContainer,
          { backgroundColor: colors.borderSubtle, borderRadius: 8, marginTop: spacing.md },
        ]}
      >
        <Text style={[typography.labelSmall, { color: colors.textTertiary }]}>REFERENCIA</Text>
        <Text
          style={[typography.labelMedium, { color: colors.textSecondary, marginTop: 2 }]}
        >
          {reference}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  merchantLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  merchantInfo: {
    flex: 1,
  },
  divider: {
    height: 1,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  referenceContainer: {
    padding: 10,
    alignItems: 'center',
  },
});
