import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="payment/confirm" options={{ headerShown: false }} />
      <Stack.Screen
        name="payment/success"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="payment/error"
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack>
  );
}
