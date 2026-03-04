import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useNotifications } from '../services/notificationService';
import { darkColors, lightColors } from '../theme';
import { AuthProvider } from '../shared/hooks/useAuth';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  // Registra push notifications (seguro en cualquier entorno)
  useNotifications();

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="scanner" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="info" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen name="payment/confirm" options={{ headerShown: false }} />
        <Stack.Screen name="payment/success" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="payment/error" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </AuthProvider>
  );
}
