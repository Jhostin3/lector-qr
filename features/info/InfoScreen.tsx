import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../shared/hooks/useAppTheme';

const InfoScreen = () => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const params = useLocalSearchParams();

  let title = 'Información';
  let data: Record<string, string> = {};

  try {
    title = params.title ? (params.title as string) : 'Información';
    if (params.data && typeof params.data === 'string') {
      data = JSON.parse(params.data);
    }
  } catch (e) {
    console.error('Error parsing info data:', e);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title,
          headerTintColor: colors.textPrimary,
          headerStyle: { backgroundColor: colors.surface },
          headerShown: true,
        }}
      />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
        {Object.entries(data).length > 0 ? (
          Object.entries(data).map(([key, value], index, arr) => (
            <View
              key={key}
              style={[
                styles.row,
                index < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[typography.labelMedium, { color: colors.textSecondary, flex: 1 }]}>
                {key}
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.primary, flex: 2, textAlign: 'right' }]}>
                {value}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            No se encontró información para mostrar.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
});

export default InfoScreen;
