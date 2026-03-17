import { Text, StyleSheet, Platform, View, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import type { AppleMapsViewType } from 'expo-maps/src/apple/AppleMaps.types';
import { usePins, MapPin } from '../../contexts/PinContext';
import { Pokemon } from '../../types/pokemon';
import { ImageRef } from 'expo-image';
import { PinImageLoader } from '../../components/map/PinImageLoader';
import { NewPinSheet } from '../../components/map/NewPinSheet';
import { PinDetailSheet } from '../../components/map/PinDetailSheet';
import { PinChipList } from '../../components/map/PinChipList';
import { useUserLocation } from '../../hooks/useUserLocation';
import { usePokemonListContext } from '../../contexts/PokemonListContext';

const COORD_THRESHOLD = 0.001;
const ZOOM_DEFAULT = 12;

export default function MapScreen() {
  const { location } = useUserLocation();
  const { data: pokemonList, count } = usePokemonListContext();
  const mapRef = useRef<AppleMapsViewType>(null);
  const cameraRef = useRef({ latitude: 50.047704, longitude: 19.95814, zoom: ZOOM_DEFAULT });
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [pendingCoords, setPendingCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [pinImageRefs, setPinImageRefs] = useState<Map<string, ImageRef>>(new Map());
  const { pins, addPin, removePin } = usePins();

  useEffect(() => {
    if (location) {
      mapRef.current?.setCameraPosition({
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: ZOOM_DEFAULT,
      });
    }
  }, [location]);

  const handleImageLoad = useCallback((url: string, ref: ImageRef) => {
    setPinImageRefs((prev) => new Map(prev).set(url, ref));
  }, []);

  const handleZoomIn = () => {
    cameraRef.current.zoom = Math.min(cameraRef.current.zoom + 1, 20);
    mapRef.current?.setCameraPosition({
      coordinates: cameraRef.current,
      zoom: cameraRef.current.zoom,
    });
  };

  const handleZoomOut = () => {
    cameraRef.current.zoom = Math.max(cameraRef.current.zoom - 1, 1);
    mapRef.current?.setCameraPosition({
      coordinates: cameraRef.current,
      zoom: cameraRef.current.zoom,
    });
  };

  const handleMapClick = (event: { coordinates: { latitude?: number; longitude?: number } }) => {
    const { latitude, longitude } = event.coordinates;
    if (latitude == null || longitude == null) return;

    const dynamicThreshold = COORD_THRESHOLD * (70 / cameraRef.current.zoom);
    const nearbyPin = pins.find(
      (p) =>
        Math.abs(p.coordinates.latitude - latitude) < dynamicThreshold &&
        Math.abs(p.coordinates.longitude - longitude) < dynamicThreshold
    );
    if (nearbyPin) {
      setSelectedPin(nearbyPin);

      const dynamicZoom =
        cameraRef.current.zoom > ZOOM_DEFAULT ? cameraRef.current.zoom : ZOOM_DEFAULT;
      mapRef.current?.setCameraPosition({ coordinates: nearbyPin.coordinates, zoom: dynamicZoom });
      return;
    }
    setPendingCoords({ latitude, longitude });
  };

  const handleSavePin = async (pokemon: Pokemon) => {
    if (!pendingCoords) return;
    await addPin(pendingCoords.latitude, pendingCoords.longitude, pokemon);
    setPendingCoords(null);
  };

  const handleDeletePin = () => {
    if (selectedPin) {
      removePin(selectedPin.id);
      setSelectedPin(null);
    }
  };

  const handlePressChip = (pin: MapPin) => {
    setSelectedPin(pin);
    mapRef.current?.setCameraPosition({ coordinates: pin.coordinates, zoom: ZOOM_DEFAULT });
  };

  const annotations = pins.map((pin) => ({
    id: pin.id,
    coordinates: pin.coordinates,
    title: pin.pokemon.name.charAt(0).toUpperCase() + pin.pokemon.name.slice(1),
    icon:
      !pin.photoUri && pin.pokemon.spriteSmall
        ? pinImageRefs.get(pin.pokemon.spriteSmall)
        : undefined,
  }));

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        {pins.map((pin) =>
          !pin.photoUri && pin.pokemon.spriteSmall ? (
            <PinImageLoader key={pin.id} url={pin.pokemon.spriteSmall} onLoad={handleImageLoad} />
          ) : null
        )}
        <AppleMaps.View
          ref={mapRef}
          style={styles.map}
          cameraPosition={{
            coordinates: { latitude: 50.047704, longitude: 19.95814 },
            zoom: ZOOM_DEFAULT,
          }}
          properties={{ pointsOfInterest: { including: [] } }}
          onCameraMove={(e) => {
            cameraRef.current.latitude = e.coordinates.latitude;
            cameraRef.current.longitude = e.coordinates.longitude;
            cameraRef.current.zoom = e.zoom;
          }}
          onMapClick={handleMapClick}
          annotations={annotations}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleZoomIn}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.button} onPress={handleZoomOut}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
        <PinChipList pins={pins} onPressPin={handlePressChip} />
        <NewPinSheet
          coords={pendingCoords}
          onClose={() => setPendingCoords(null)}
          onSave={handleSavePin}
          pokemonList={pokemonList}
          count={count}
        />
        <PinDetailSheet
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          onDelete={handleDeletePin}
        />
      </View>
    );
  } else if (Platform.OS === 'android') {
    // TODO
    return <GoogleMaps.View style={{ flex: 1 }} />;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  buttonContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  button: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 24, fontWeight: '500', color: '#007AFF' },
  divider: { height: 1, backgroundColor: '#E5E5EA', width: '100%' },
});
