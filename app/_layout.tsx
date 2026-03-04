import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useNotifications } from '../services/notificationService'; // Corrected import
import { ThemeProvider } from '../shared/hooks/useAppTheme'; // Ensure ThemeProvider is wrapping the app

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  // This custom hook will handle all push notification logic.
  // It's designed to be safe to use in any environment (Expo Go, web, device).
  useNotifications(); // Corrected function name

  const [loaded, error] = useFonts({
    // Define your fonts here if you have any
    // 'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <ThemeProvider>
      {!loaded ? null : (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="info" options={{ presentation: 'modal' }} />
          <Stack.Screen name="payment/confirm" options={{ presentation: 'modal' }} />
          <Stack.Screen name="payment/success" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="payment/error" options={{ presentation: 'modal' }} />
        </Stack>
      )}
    </ThemeProvider>
  );
}
