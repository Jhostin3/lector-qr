import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button } from '../../../shared/components/Button';
import { StatusIcon } from '../../../shared/components/StatusIcon';
import { Card } from '../../../shared/components/Card';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';

const ERROR_SUGGESTIONS: Record<string, string> = {
  INSUFFICIENT_FUNDS: 'Verifica el saldo disponible en tu cuenta o usa otro método de pago.',
  CARD_DECLINED: 'Contacta a tu banco o intenta con otra tarjeta.',
  NETWORK_ERROR: 'Verifica tu conexión a internet e intenta de nuevo.',
  DEFAULT: 'Intenta de nuevo o contacta al soporte si el problema persiste.',
};

export default function PaymentErrorScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { errorMessage } = useLocalSearchParams<{ errorMessage: string }>();

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 8,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de shake para el ícono de error
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const suggestion =
    ERROR_SUGGESTIONS[errorMessage ?? 'DEFAULT'] ?? ERROR_SUGGESTIONS['DEFAULT'];

  const handleRetry = () => {
    router.replace('/');
  };

  const handleSupport = () => {
    // En producción: abrir chat de soporte o llamada
    router.replace('/');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.content, { padding: spacing.lg }]}>
          {/* Ícono de error con shake */}
          <View style={styles.iconSection}>
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <StatusIcon type="error" size={100} />
            </Animated.View>
          </View>

          {/* Textos */}
          <Animated.View
            style={[
              styles.textSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text
              style={[typography.displayMedium, { color: colors.textPrimary, textAlign: 'center' }]}
            >
              Pago fallido
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
              ]}
            >
              No pudimos completar tu transacción
            </Text>
          </Animated.View>

          {/* Detalle del error */}
          <Animated.View
            style={[
              styles.errorCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                backgroundColor: colors.errorBackground,
                borderRadius: borderRadius.xl,
                borderColor: colors.error + '40',
                marginTop: spacing.xl,
              },
            ]}
          >
            <Text style={[typography.labelSmall, { color: colors.error, marginBottom: 6 }]}>
              MOTIVO DEL ERROR
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.error, fontWeight: '600' }]}>
              {errorMessage ?? 'Error al procesar el pago'}
            </Text>
          </Animated.View>

          {/* Sugerencia */}
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginTop: spacing.md }}
          >
            <Card>
              <View style={styles.suggestionRow}>
                <Text style={{ fontSize: 20, marginRight: 10 }}>💡</Text>
                <Text
                  style={[
                    typography.bodySmall,
                    { color: colors.textSecondary, flex: 1, lineHeight: 19 },
                  ]}
                >
                  {suggestion}
                </Text>
              </View>
            </Card>
          </Animated.View>
        </View>

        {/* Acciones */}
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
          <Button label="Intentar de nuevo" onPress={handleRetry} fullWidth size="lg" />
          <Button
            label="Contactar soporte"
            onPress={handleSupport}
            variant="outline"
            fullWidth
            size="md"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1 },
  iconSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 8 },
  textSection: { alignItems: 'center', paddingHorizontal: 24 },
  errorCard: { alignItems: 'center', paddingVertical: 22, paddingHorizontal: 24, borderWidth: 1 },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start' },
  actions: { borderTopWidth: 1, paddingTop: 16 },
});
