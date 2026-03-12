import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useIsDark } from '../../contexts/ThemeContext';
import React, { useEffect, useMemo, useState } from 'react';
import { Camera, useCameraPermission, useCameraDevice } from 'react-native-vision-camera';

export default function CameraScreen() {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    requestPermission();
  }, []);

  if (!hasPermission) {
    return (
      <View>
        <Text>No camera permission</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View>
        <Text>No camera device error</Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))}
      >
        <Text style={styles.switchText}>⇄</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    text: {
      color: isDark ? '#ffffff' : '#000000',
    },
    switchButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      alignSelf: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 30,
      padding: 15,
    },
    switchText: {
      color: '#ffffff',
      fontSize: 30,
    },
  });
};
