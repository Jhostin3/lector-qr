
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

const MapScreen = () => {
  const initialRegion = {
    latitude: 19.432608,
    longitude: -99.133209,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const generateRandomMarkers = (count: number) => {
    const markers = [];
    for (let i = 0; i < count; i++) {
      markers.push({
        id: i,
        coordinate: {
          latitude: initialRegion.latitude + (Math.random() - 0.5) * 0.1,
          longitude: initialRegion.longitude + (Math.random() - 0.5) * 0.1,
        },
        title: `Comercio ${i + 1}`,
        description: 'Acepta pagos con QR',
      });
    }
    return markers;
  };

  const markers = generateRandomMarkers(Math.floor(Math.random() * 6) + 5); // Entre 5 y 10 marcadores

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {markers.map(marker => (
          <Marker key={marker.id} coordinate={marker.coordinate}>
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                <Text style={styles.calloutDescription}>{marker.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    width: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  calloutDescription: {
    fontSize: 14,
  },
});

export default MapScreen;
