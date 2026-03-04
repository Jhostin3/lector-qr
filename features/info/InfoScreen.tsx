import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../shared/hooks/useAppTheme'; // Corrected Path
import { typography } from '../../theme'; // Corrected Path

const InfoScreen = () => {
  // The useAppTheme hook is the correct one, not useTheme
  const { colors, isDark } = useAppTheme(); 
  const params = useLocalSearchParams();

  let title = 'Información';
  let data: { [key: string]: string } = {};

  try {
    title = params.title ? (params.title as string) : 'Información';
    if (params.data && typeof params.data === 'string') {
      data = JSON.parse(params.data);
    }
  } catch (e) {
    console.error("Error parsing info data:", e);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Use Stack.Screen to dynamically set the header title */}
      <Stack.Screen 
        options={{ 
          title, 
          headerTintColor: colors.text, 
          headerStyle: { backgroundColor: colors.card },
          headerShown: true, // Make sure header is visible
        }} 
      />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {Object.entries(data).length > 0 ? (
          Object.entries(data).map(([key, value]) => (
            <View key={key} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={[styles.keyText, { color: colors.text }]}>{key}:</Text>
              <Text style={[styles.valueText, { color: colors.primary }]}>{value}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.text }}>No se encontró información para mostrar.</Text>
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  keyText: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  valueText: {
    ...typography.body,
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
});

export default InfoScreen;
