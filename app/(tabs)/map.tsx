import {
  Text,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useIsDark } from '../../contexts/ThemeContext';
import React, { useMemo, useState } from 'react';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { usePins, MapPin } from '../../contexts/PinContext';

export default function MapScreen() {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [pendingCoords, setPendingCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [newPinTitle, setNewPinTitle] = useState('');
  const { pins, addPin, removePin } = usePins();

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 1, 1));

  const handleMapClick = (event: { coordinates: { latitude?: number; longitude?: number } }) => {
    const { latitude, longitude } = event.coordinates;
    if (latitude == null || longitude == null) return;
    setPendingCoords({ latitude, longitude });
    setNewPinTitle('');
  };

  const handleSavePin = async () => {
    if (!pendingCoords) return;
    await addPin(
      pendingCoords.latitude,
      pendingCoords.longitude,
      newPinTitle.trim() || 'Saved Location'
    );
    setPendingCoords(null);
  };

  const handleDeletePin = () => {
    if (selectedPin) {
      removePin(selectedPin.id);
      setSelectedPin(null);
    }
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <AppleMaps.View
          style={styles.map}
          cameraPosition={{
            coordinates: { latitude: 50.047704, longitude: 19.95814 },
            zoom: zoomLevel,
          }}
          onMapClick={handleMapClick}
          markers={pins}
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
              {pins.map((pin) => (
                <Pressable
                  key={pin.id}
                  style={({ pressed }) => [styles.pinChip, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => setSelectedPin(pin)}
                >
                  <Text style={styles.pinChipText} numberOfLines={1}>
                    📍 {pin.pokemon}
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
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Pressable style={styles.modalBackdrop} onPress={() => setPendingCoords(null)} />
            <View style={[styles.bottomSheet, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                New Pin
              </Text>
              <Text style={[styles.sheetCoords, { color: isDark ? '#aaaaaa' : '#666666' }]}>
                {pendingCoords?.latitude.toFixed(5)}, {pendingCoords?.longitude.toFixed(5)}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7',
                    color: isDark ? '#ffffff' : '#000000',
                  },
                ]}
                placeholder="Pin title (optional)"
                placeholderTextColor={isDark ? '#666666' : '#aaaaaa'}
                value={newPinTitle}
                onChangeText={setNewPinTitle}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSavePin}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setPendingCoords(null)}
                >
                  <Text
                    style={[styles.actionButtonText, { color: isDark ? '#ffffff' : '#000000' }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSavePin}
                >
                  <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Save</Text>
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
          <View style={[styles.bottomSheet, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              {selectedPin?.pokemon}
            </Text>
            <Text style={[styles.sheetCoords, { color: isDark ? '#aaaaaa' : '#666666' }]}>
              {selectedPin?.coordinates.latitude.toFixed(5)},{' '}
              {selectedPin?.coordinates.longitude.toFixed(5)}
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePin}>
              <Text style={styles.deleteButtonText}>Remove Pin</Text>
            </TouchableOpacity>
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
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
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
    },
    sheetCoords: {
      fontSize: 14,
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
    cancelButton: {
      backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7',
    },
    saveButton: {
      backgroundColor: '#007AFF',
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: '#FF3B30',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
