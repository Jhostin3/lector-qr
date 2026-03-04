import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../shared/hooks/useAuth';
import { useAppTheme } from '../shared/hooks/useAppTheme';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/auth/login');
    } else if (user.role === 'comprador') {
      router.replace('/home');
    } else {
      // vendedor
      router.replace('/scanner');
    }
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
