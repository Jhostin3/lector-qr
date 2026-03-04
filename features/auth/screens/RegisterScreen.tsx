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
import type { UserRole } from '../../../services/authService';

export default function RegisterScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('comprador');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, role);
    } catch (e: any) {
      setError(e.message ?? 'Error al crear la cuenta');
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

          <View style={styles.header}>
            <Text style={styles.logo}>🆕</Text>
            <Text style={[typography.displayMedium, { color: colors.textPrimary, textAlign: 'center' }]}>
              Crear cuenta
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
              Elige tu rol y empieza a pagar
            </Text>
          </View>

          <View style={[styles.form, { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderColor: colors.border }]}>

            {/* Nombre */}
            <SimpleField label="Nombre completo" value={name} onChangeText={setName}
              placeholder="Tu nombre" colors={colors} typography={typography}
              spacing={spacing} borderRadius={borderRadius} />

            {/* Correo */}
            <SimpleField label="Correo electrónico" value={email} onChangeText={setEmail}
              placeholder="correo@ejemplo.com" keyboardType="email-address"
              autoCapitalize="none" colors={colors} typography={typography}
              spacing={spacing} borderRadius={borderRadius} />

            {/* Contraseña */}
            <SimpleField label="Contraseña" value={password} onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres" secureTextEntry colors={colors}
              typography={typography} spacing={spacing} borderRadius={borderRadius} />

            {/* Selector de rol */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: 10 }]}>
                Rol
              </Text>
              <View style={styles.roleRow}>
                <RoleChip
                  label="🛒  Comprador"
                  description="Genera QR y paga"
                  selected={role === 'comprador'}
                  onPress={() => setRole('comprador')}
                  colors={colors}
                  typography={typography}
                  borderRadius={borderRadius}
                />
                <View style={{ width: 12 }} />
                <RoleChip
                  label="🏪  Vendedor"
                  description="Cobra con el escáner"
                  selected={role === 'vendedor'}
                  onPress={() => setRole('vendedor')}
                  colors={colors}
                  typography={typography}
                  borderRadius={borderRadius}
                />
              </View>
            </View>

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.errorBackground, borderRadius: borderRadius.md }]}>
                <Text style={[typography.bodySmall, { color: colors.error }]}>⚠️  {error}</Text>
              </View>
            )}

            <Button
              label="Crear cuenta"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.linkRow}
            activeOpacity={0.7}
          >
            <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '600' }]}>
              Iniciar sesión
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SimpleField({ label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType, autoCapitalize, colors, typography, spacing, borderRadius }: any) {
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
        autoCapitalize={autoCapitalize ?? 'words'}
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

function RoleChip({ label, description, selected, onPress, colors, typography, borderRadius }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.roleChip,
        {
          borderRadius: borderRadius.md,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1.5,
          backgroundColor: selected ? colors.primary + '12' : colors.background,
        },
      ]}
    >
      <Text style={[typography.labelLarge, { color: selected ? colors.primary : colors.textPrimary, textAlign: 'center' }]}>
        {label}
      </Text>
      <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: 2 }]}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 52, marginBottom: 12 },
  form: { padding: 24, borderWidth: 1, marginBottom: 24 },
  errorBox: { padding: 12, marginBottom: 8 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  roleRow: { flexDirection: 'row' },
  roleChip: { flex: 1, padding: 14, alignItems: 'center' },
});
