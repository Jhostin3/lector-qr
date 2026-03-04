import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useAppTheme } from '../../../shared/hooks/useAppTheme';
import { Button } from '../../../shared/components/Button';

export default function LoginScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Completa todos los campos');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const profile = await login(email.trim().toLowerCase(), password);
      router.replace(profile.role === 'comprador' ? '/home' : '/scanner');
    } catch (e: any) {
      setError(e.message ?? 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo / Título */}
          <View style={styles.header}>
            <Text style={styles.logo}>💳</Text>
            <Text style={[typography.displayMedium, { color: colors.textPrimary, textAlign: 'center' }]}>
              El Gran Checkout
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
              Inicia sesión para continuar
            </Text>
          </View>

          {/* Formulario */}
          <View style={[styles.form, { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderColor: colors.border }]}>
            <Field
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              colors={colors}
              typography={typography}
              spacing={spacing}
              borderRadius={borderRadius}
            />
            <Field
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              colors={colors}
              typography={typography}
              spacing={spacing}
              borderRadius={borderRadius}
            />

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.errorBackground, borderRadius: borderRadius.md }]}>
                <Text style={[typography.bodySmall, { color: colors.error }]}>⚠️  {error}</Text>
              </View>
            )}

            <Button
              label="Iniciar sesión"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>

          {/* Link a registro */}
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            style={styles.linkRow}
            activeOpacity={0.7}
          >
            <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
              ¿No tienes cuenta?{' '}
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '600' }]}>
              Regístrate
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Campo de formulario reutilizable (local al archivo)
function Field({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, autoCapitalize,
  colors, typography, spacing, borderRadius,
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: 6 }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          typography.bodyMedium,
          {
            color: colors.textPrimary,
            backgroundColor: colors.background,
            borderRadius: borderRadius.md,
            borderWidth: 1.5,
            borderColor: focused ? colors.primary : colors.border,
            padding: spacing.md,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 56, marginBottom: 16 },
  form: { padding: 24, borderWidth: 1, marginBottom: 24 },
  errorBox: { padding: 12, marginBottom: 8 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
