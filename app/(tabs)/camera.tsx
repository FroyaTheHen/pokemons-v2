import { Text, View, StyleSheet, LayoutChangeEvent, TouchableOpacity, Image } from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, useCameraPermission, useCameraDevice } from 'react-native-vision-camera';
import FaceDetection from '@react-native-ml-kit/face-detection';
import { useFocusEffect } from 'expo-router';
import { PokemonContext } from '../../contexts/FavouriteContext';

const SPRITE_SIZE = 64;

export default function CameraScreen() {
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('front');
  const cameraPositionRef = useRef(cameraPosition);
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [forehead, setForehead] = useState<{ x: number; y: number } | null>(null);
  const viewSizeRef = useRef({ width: 0, height: 0 });
  const { pokemon } = useContext(PokemonContext)!;

  const favouriteOverlay = useMemo(() => {
    if (pokemon?.spriteSmall) {
      return <Image source={{ uri: pokemon.spriteSmall }} style={styles.sprite} />;
    }
    return <Text style={styles.noFavLabel}>No favourite pokemon</Text>;
  }, [pokemon?.spriteSmall]);

  useEffect(() => {
    requestPermission();
  }, []);

  const flipCamera = useCallback(() => {
    setCameraPosition((p) => {
      const next = p === 'front' ? 'back' : 'front';
      cameraPositionRef.current = next;
      return next;
    });
    setForehead(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      let busy = false;
      const interval = setInterval(async () => {
        if (!cameraRef.current || busy || viewSizeRef.current.width === 0) return;
        busy = true;
        try {
          const photo = await cameraRef.current.takePhoto();
          const faces = await FaceDetection.detect(`file://${photo.path}`, {
            performanceMode: 'accurate',
            landmarkMode: 'all',
            minFaceSize: 0.05,
          });

          if (faces.length > 0) {
            const face = faces[0];
            const { width: screenW, height: screenH } = viewSizeRef.current;
            const isFront = cameraPositionRef.current === 'front';

            // VisionCamera reports raw sensor dims (may be landscape).
            // ML Kit reads EXIF and returns coords in display-oriented (portrait) space.
            const isRotated = photo.width > photo.height;
            const displayW = isRotated ? photo.height : photo.width;
            const displayH = isRotated ? photo.width : photo.height;

            // Cover-fit: scale to fill screen, offset the cropped axis.
            const photoAR = displayW / displayH;
            const screenAR = screenW / screenH;
            let scale: number;
            let offsetX = 0;
            let offsetY = 0;
            if (photoAR > screenAR) {
              scale = screenH / displayH;
              offsetX = (displayW - screenW / scale) / 2;
            } else {
              scale = screenW / displayW;
              offsetY = (displayH - screenH / scale) / 2;
            }

            const toScreenX = (rawX: number) => {
              const x = isFront ? displayW - rawX : rawX;
              return (x - offsetX) * scale;
            };
            const toScreenY = (rawY: number) => (rawY - offsetY) * scale;

            const leftEye = face.landmarks?.leftEye;
            const rightEye = face.landmarks?.rightEye;
            const rawX =
              leftEye && rightEye
                ? (leftEye.position.x + rightEye.position.x) / 2
                : face.frame.left + face.frame.width / 2;
            const eyeY =
              leftEye && rightEye
                ? (leftEye.position.y + rightEye.position.y) / 2
                : face.frame.top + face.frame.height * 0.4;
            const foreheadRawY = face.frame.top + (eyeY - face.frame.top) / 2;

            setForehead({ x: toScreenX(rawX), y: toScreenY(foreheadRawY) });
          } else {
            setForehead(null);
          }
        } catch {
          // camera may not be ready yet
        } finally {
          busy = false;
        }
      }, 800);

      return () => {
        setIsFocused(false);
        setForehead(null);
        clearInterval(interval);
      };
    }, [])
  );

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
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        viewSizeRef.current = { width, height };
      }}
    >
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        photo={true}
      />
      {forehead && (
        <View
          style={[
            styles.markerRoot,
            { top: forehead.y - SPRITE_SIZE / 2, left: forehead.x - SPRITE_SIZE / 2 },
          ]}
        >
          {favouriteOverlay}
        </View>
      )}
      <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
        <Text style={styles.flipButtonText}>
          {cameraPosition === 'front' ? '⬅ Back' : '🤳 Front'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sprite: {
    position: 'absolute',
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
  },
  noFavRoot: {
    position: 'absolute',
  },
  noFavLabel: {
    color: '#00ff00',
    fontSize: 11,
    fontWeight: 'bold',
  },
  flipButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  markerRoot: {
    position: 'absolute',
    alignItems: 'center',
    gap: 6,
  },
});
