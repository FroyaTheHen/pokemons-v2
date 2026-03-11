import {
  Text,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  FlatList,
  Image,
} from 'react-native';
import { useIsDark } from '../../contexts/ThemeContext';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AppleMaps, GoogleMaps } from 'expo-maps';
import type { AppleMapsViewType } from 'expo-maps/src/apple/AppleMaps.types';
import { usePins, MapPin } from '../../contexts/PinContext';
import { usePokemonList } from '../../hooks/usePokemonList';
import { Pokemon } from '../../types/pokemon';
import { ImageRef, useImage } from 'expo-image';

function PinImageLoader({
  url,
  onLoad,
}: {
  url: string;
  onLoad: (url: string, ref: ImageRef) => void;
}) {
  const image = useImage(url);
  useEffect(() => {
    if (image) onLoad(url, image);
  }, [image]);
  return null;
}

export default function MapScreen() {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const mapRef = useRef<AppleMapsViewType>(null);
  const cameraRef = useRef({ latitude: 50.047704, longitude: 19.95814, zoom: 12 });
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [pendingCoords, setPendingCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [pinImageRefs, setPinImageRefs] = useState<Map<string, ImageRef>>(new Map());
  const handleImageLoad = useCallback((url: string, ref: ImageRef) => {
    setPinImageRefs((prev) => new Map(prev).set(url, ref));
  }, []);
  const { pins, addPin, removePin } = usePins();
  const { data: pokemonList, loadMore, hasMore, loadingMore } = usePokemonList();

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

  const COORD_THRESHOLD = 0.001;

  const handleMapClick = (event: { coordinates: { latitude?: number; longitude?: number } }) => {
    const { latitude, longitude } = event.coordinates;
    if (latitude == null || longitude == null) return;
    const nearbyPin = pins.find(
      (p) =>
        Math.abs(p.coordinates.latitude - latitude) < COORD_THRESHOLD &&
        Math.abs(p.coordinates.longitude - longitude) < COORD_THRESHOLD
    );
    if (nearbyPin) {
      setSelectedPin(nearbyPin);
      mapRef.current?.setCameraPosition({
        coordinates: nearbyPin.coordinates,
        zoom: 14,
      });
      return;
    }
    setPendingCoords({ latitude, longitude });
    setSelectedPokemon(null);
  };

  const handleSavePin = async () => {
    if (!pendingCoords) return;
    if (!selectedPokemon) return;
    await addPin(pendingCoords.latitude, pendingCoords.longitude, selectedPokemon);
    setPendingCoords(null);
  };

  const handleDeletePin = () => {
    if (selectedPin) {
      removePin(selectedPin.id);
      setSelectedPin(null);
    }
  };

  const annotations = pins.map((pin) => ({
    id: pin.id,
    coordinates: pin.coordinates,
    title: pin.pokemon.name.charAt(0).toUpperCase() + pin.pokemon.name.slice(1),
    icon: pin.pokemon.spriteSmall ? pinImageRefs.get(pin.pokemon.spriteSmall) : undefined,
  }));

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        {pins.map((pin) =>
          pin.pokemon.spriteSmall ? (
            <PinImageLoader key={pin.id} url={pin.pokemon.spriteSmall} onLoad={handleImageLoad} />
          ) : null
        )}
        <AppleMaps.View
          ref={mapRef}
          style={styles.map}
          cameraPosition={{
            coordinates: { latitude: 50.047704, longitude: 19.95814 },
            zoom: 12,
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

        {pins.length > 0 && (
          <View style={styles.pinListContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pinListContent}
            >
              {pins.map((pin, index) => (
                <Pressable
                  key={pin.id}
                  style={({ pressed }) => [styles.pinChip, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => {
                    setSelectedPin(pin);
                    mapRef.current?.setCameraPosition({
                      coordinates: pin?.coordinates,
                      zoom: 14,
                    });
                  }}
                >
                  <Image source={{ uri: pin.pokemon.spriteSmall }} style={styles.pinImage} />
                  <Text>{index + 1}. </Text>
                  <Text style={styles.pinChipText} numberOfLines={1}>
                    {pin.pokemon.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* New pin modal */}
        <Modal
          visible={pendingCoords !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setPendingCoords(null)}
        >
          <KeyboardAvoidingView style={styles.flex} behavior="padding">
            <Pressable style={styles.modalBackdrop} onPress={() => setPendingCoords(null)} />
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>New Pin</Text>
              <Text style={styles.sheetCoords}>
                {pendingCoords?.latitude.toFixed(5)}, {pendingCoords?.longitude.toFixed(5)}
              </Text>
              <FlatList
                data={pokemonList}
                keyExtractor={(item) => item.name}
                style={styles.pokemonList}
                keyboardShouldPersistTaps="handled"
                onEndReached={() => hasMore && !loadingMore && loadMore()}
                onEndReachedThreshold={0.3}
                renderItem={({ item, index }) => (
                  <Pressable
                    style={[
                      styles.pokemonItem,
                      {
                        backgroundColor:
                          selectedPokemon?.name === item.name
                            ? '#007AFF'
                            : isDark
                              ? '#2c2c2e'
                              : '#f2f2f7',
                      },
                    ]}
                    onPress={() => setSelectedPokemon(item)}
                  >
                    <Text
                      style={[
                        styles.pokemonItemText,
                        {
                          color:
                            selectedPokemon?.name === item.name
                              ? '#ffffff'
                              : isDark
                                ? '#ffffff'
                                : '#000000',
                        },
                      ]}
                    >
                      {index} {item.name}
                    </Text>
                  </Pressable>
                )}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setPendingCoords(null)}
                >
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSavePin}
                >
                  <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Pin detail modal */}
        <Modal
          visible={selectedPin !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedPin(null)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedPin(null)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.pinDetailRow}>
              <Image
                source={{ uri: selectedPin?.pokemon.spriteSmall }}
                style={styles.pinDetailImage}
              />
              <View>
                <Text style={styles.sheetTitle}>{selectedPin?.pokemon.name}</Text>
                <Text style={[styles.sheetCoords, styles.sheetCoordsCompact]}>
                  {selectedPin?.coordinates.latitude.toFixed(5)},{' '}
                  {selectedPin?.coordinates.longitude.toFixed(5)}
                </Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setSelectedPin(null)}
              >
                <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeletePin}
              >
                <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Remove Pin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  } else if (Platform.OS === 'android') {
    return <GoogleMaps.View style={{ flex: 1 }} />;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
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
    button: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 24,
      fontWeight: '500',
      color: '#007AFF',
    },
    divider: {
      height: 1,
      backgroundColor: '#E5E5EA',
      width: '100%',
    },
    pinListContainer: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
    },
    pinListContent: {
      paddingHorizontal: 12,
      gap: 8,
    },
    pinChip: {
      backgroundColor: isDark ? '#1e1e1ebb' : '#ffffffcc',
      borderRadius: 5,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    pinChipText: {
      fontSize: 13,
      color: isDark ? '#ffffff' : '#000000',
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    modalBackdrop: {
      flex: 1,
    },
    bottomSheet: {
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 12,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#C7C7CC',
      alignSelf: 'center',
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
      textTransform: 'capitalize',
      color: isDark ? '#ffffff' : '#000000',
    },
    sheetCoords: {
      fontSize: 14,
      marginBottom: 16,
      color: isDark ? '#aaaaaa' : '#666666',
    },
    sheetCoordsCompact: {
      marginBottom: 0,
    },
    pinDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    input: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      marginBottom: 16,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7',
    },
    cancelButtonText: {
      color: isDark ? '#ffffff' : '#000000',
    },
    saveButton: {
      backgroundColor: '#007AFF',
    },
    deleteButton: {
      backgroundColor: '#FF3B30',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#ffffff',
    },
    pokemonList: {
      maxHeight: 200,
      marginBottom: 16,
    },
    pokemonItem: {
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 4,
    },
    pokemonItemText: {
      fontSize: 15,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    pinImage: {
      width: 50,
      height: 50,
    },
    pinDetailImage: {
      width: 100,
      height: 100,
    },
  });
};
