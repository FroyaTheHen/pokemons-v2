import {
  Text,
  View,
  StyleSheet,
  LayoutChangeEvent,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, useCameraPermission, useCameraDevice } from 'react-native-vision-camera';
import FaceDetection from '@react-native-ml-kit/face-detection';
import { useFocusEffect } from 'expo-router';
import { PokemonContext } from '../../contexts/FavouriteContext';
import {
  CameraRoll,
  iosRequestReadWriteGalleryPermission,
} from '@react-native-camera-roll/camera-roll';
import { Skia, ImageFormat } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';

const SPRITE_SIZE = 64;

// ─── Skia compositing ─────────────────────────────────────────────────────────
// Loads any URI (file:// or http://) into a Skia image using fetch so it works
// uniformly for both local snapshots and remote pokemon sprite URLs.
async function loadSkiaImage(uri: string) {
  const res = await fetch(uri);
  const buffer = await res.arrayBuffer();
  const data = Skia.Data.fromBytes(new Uint8Array(buffer));
  return Skia.Image.MakeImageFromEncoded(data);
}

// Composites the photo with the pokemon sprite at the forehead position,
// writes the result to a temp file and saves it to the camera roll.
async function compositeAndSave(
  photoUri: string,
  forehead: { x: number; y: number } | null,
  spriteUrl: string | null,
  screenW: number,
  screenH: number
): Promise<void> {
  const photoImage = await loadSkiaImage(photoUri);
  if (!photoImage) throw new Error('Failed to decode photo');

  // Use actual decoded dimensions — Skia applies EXIF rotation on decode,
  // so these may differ from the raw sensor dims reported by VisionCamera.
  const imgW = photoImage.width();
  const imgH = photoImage.height();

  // Cap output at 1920px on the longest side to keep memory usage manageable
  const MAX_DIM = 1920;
  const rawScale = Math.min(1, MAX_DIM / Math.max(imgW, imgH));
  const outW = Math.round(imgW * rawScale);
  const outH = Math.round(imgH * rawScale);

  const surface = Skia.Surface.Make(outW, outH);
  if (!surface) throw new Error('Failed to create Skia surface');

  const canvas = surface.getCanvas();
  canvas.drawImageRect(
    photoImage,
    { x: 0, y: 0, width: imgW, height: imgH },
    { x: 0, y: 0, width: outW, height: outH },
    Skia.Paint()
  );

  // Overlay the sprite if we have a face position and a sprite URL
  if (forehead && spriteUrl) {
    const spriteImage = await loadSkiaImage(spriteUrl);
    if (spriteImage) {
      // Map screen-space forehead coords → output-space coords
      const scaleX = outW / screenW;
      const scaleY = outH / screenH;
      const spriteW = SPRITE_SIZE * scaleX;
      const spriteH = SPRITE_SIZE * scaleY;
      const paint = Skia.Paint();
      canvas.drawImageRect(
        spriteImage,
        { x: 0, y: 0, width: spriteImage.width(), height: spriteImage.height() },
        {
          x: forehead.x * scaleX - spriteW / 2,
          y: forehead.y * scaleY - spriteH / 2,
          width: spriteW,
          height: spriteH,
        },
        paint
      );
    }
  }

  const base64 = surface.makeImageSnapshot().encodeToBase64(ImageFormat.JPEG, 90);
  const tmpFile = new File(Paths.cache, `pokemon_photo_${Date.now()}.jpg`);
  tmpFile.write(base64, { encoding: 'base64' });
  await CameraRoll.saveAsset(tmpFile.uri, { type: 'photo' });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CameraScreen() {
  // ─── Camera device ────────────────────────────────────────────────────────
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('front');
  // ref mirrors state so async callbacks (interval) always read the latest value
  const cameraPositionRef = useRef(cameraPosition);
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();

  // ─── Camera session state ─────────────────────────────────────────────────
  const cameraRef = useRef<Camera>(null);
  // true only after onInitialized fires — gates every takePhoto() call
  const isCameraReadyRef = useRef(false);
  const [isCameraReady, setIsCameraReady] = useState(false); // drives button disabled state
  // true while a flip or error-recovery is in progress — prevents onError
  // from triggering a second recovery cycle on top of one already running
  const isSwitchingRef = useRef(false);
  // toggled false→true→false to force VisionCamera to rebuild its session on error
  const [isCameraActive, setIsCameraActive] = useState(true);
  // last snapshot taken by the detection loop — reused as the base for saving
  const lastPhotoUriRef = useRef<string | null>(null);
  const lastPhotoDimsRef = useRef({ width: 0, height: 0 });
  // shown over the camera while the new device session is initialising
  const [frozenFrameUri, setFrozenFrameUri] = useState<string | null>(null);

  // ─── Screen focus ─────────────────────────────────────────────────────────
  const [isFocused, setIsFocused] = useState(false);

  // ─── Face / forehead position ─────────────────────────────────────────────
  const [forehead, setForehead] = useState<{ x: number; y: number } | null>(null);
  // measured on layout — used for coordinate mapping
  const viewSizeRef = useRef({ width: 0, height: 0 });

  // ─── Pokemon overlay ──────────────────────────────────────────────────────
  const { pokemon } = useContext(PokemonContext)!;

  // ─── Save state ───────────────────────────────────────────────────────────
  const isCapturingRef = useRef(false);
  const detectionBusyRef = useRef(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    requestPermission();
    if (Platform.OS !== 'ios') return;
    iosRequestReadWriteGalleryPermission().catch((e: unknown) =>
      console.warn('[Camera] photo library permission error:', e)
    );
  }, []);

  // ─── Save ─────────────────────────────────────────────────────────────────
  // Grabs the last detection snapshot (photo + forehead coords are guaranteed
  // to match since they came from the same frame), shows ✅ immediately, then
  // composites and saves in the background via Skia — user is never blocked.
  const takeAndSave = useCallback(async () => {
    if (isCapturingRef.current || !lastPhotoUriRef.current || !isCameraReadyRef.current) return;
    isCapturingRef.current = true;

    const photoUri = lastPhotoUriRef.current;
    const currentForehead = forehead;
    const spriteUrl = pokemon?.spriteSmall ?? null;
    const { width: screenW, height: screenH } = viewSizeRef.current;

    // Unblock the user immediately
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    compositeAndSave(photoUri, currentForehead, spriteUrl, screenW, screenH)
      .catch((e) => console.error('[Camera] compositeAndSave error:', e))
      .finally(() => {
        isCapturingRef.current = false;
      });
  }, [forehead, pokemon?.spriteSmall]);

  // ─── Pokemon sprite overlay (live view) ───────────────────────────────────
  const favouriteOverlay = useMemo(() => {
    if (pokemon?.spriteSmall) {
      return <Image source={{ uri: pokemon.spriteSmall }} style={styles.sprite} />;
    }
    return <Text style={styles.noFavLabel}>No favourite pokemon</Text>;
  }, [pokemon?.spriteSmall]);

  // ─── Camera recovery ──────────────────────────────────────────────────────
  // Shared logic: mark camera not-ready, briefly deactivate to force a new session.
  // onInitialized will re-enable everything once the session is healthy again.
  const recoverCamera = useCallback(() => {
    isCameraReadyRef.current = false;
    setIsCameraReady(false);
    isSwitchingRef.current = true;
    setIsCameraActive(false);
    setTimeout(() => {
      setIsCameraActive(true);
    }, 500);
  }, []);

  // ─── Flip ─────────────────────────────────────────────────────────────────
  const flipCamera = useCallback(() => {
    isCameraReadyRef.current = false;
    setIsCameraReady(false);
    isSwitchingRef.current = true;
    // Show the last detection frame so the screen doesn't flash black during the switch
    setFrozenFrameUri(lastPhotoUriRef.current);
    setForehead(null);
    // Defer device change to the next frame so the frozen frame is painted first
    requestAnimationFrame(() => {
      setCameraPosition((p) => {
        const next = p === 'front' ? 'back' : 'front';
        cameraPositionRef.current = next;
        return next;
      });
    });
  }, []);

  // ─── Detection loop ───────────────────────────────────────────────────────
  // Runs every 800 ms while the screen is focused.
  // iOS uses takePhoto() (physical device requirement); Android uses takeSnapshot()
  // (faster, no preview interruption).
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      const interval = setInterval(
        async () => {
          // Skip if camera isn't ready or another operation is already running
          if (
            !cameraRef.current ||
            !isCameraReadyRef.current ||
            detectionBusyRef.current ||
            isCapturingRef.current ||
            viewSizeRef.current.width === 0
          )
            return;

          detectionBusyRef.current = true;
          try {
            const photo =
              Platform.OS === 'ios'
                ? await cameraRef.current.takePhoto({ flash: 'off', enableShutterSound: false })
                : await cameraRef.current.takeSnapshot({ quality: 40 });
            lastPhotoUriRef.current = `file://${photo.path}`;
            lastPhotoDimsRef.current = { width: photo.width, height: photo.height };

            const faces = await FaceDetection.detect(`file://${photo.path}`, {
              performanceMode: 'accurate',
              landmarkMode: 'all',
              minFaceSize: 0.05,
            });

            if (faces.length === 0) {
              setForehead(null);
              return;
            }

            const face = faces[0];
            const { width: screenW, height: screenH } = viewSizeRef.current;
            const isFront = cameraPositionRef.current === 'front';

            // VisionCamera reports raw sensor dims (may be landscape).
            // ML Kit reads EXIF and returns coords in display-oriented (portrait) space.
            const isRotated = photo.width > photo.height;
            const displayW = isRotated ? photo.height : photo.width;
            const displayH = isRotated ? photo.width : photo.height;

            // Cover-fit: work out scale + crop offset so photo coords map to screen coords
            const scale =
              displayW / displayH > screenW / screenH
                ? screenH / displayH // photo wider than screen → letterbox sides
                : screenW / displayW; // photo taller than screen → letterbox top/bottom
            const offsetX = (displayW - screenW / scale) / 2;
            const offsetY = (displayH - screenH / scale) / 2;

            const toScreenX = (rawX: number) => {
              // Mirror X for front camera (sensor is not pre-mirrored)
              const x = isFront ? displayW - rawX : rawX;
              return (x - offsetX) * scale;
            };
            const toScreenY = (rawY: number) => (rawY - offsetY) * scale;

            // Prefer actual landmark positions; fall back to face bounding box
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
            // Forehead = halfway between the top of the face frame and the eyes
            const foreheadRawY = face.frame.top + (eyeY - face.frame.top) / 2;

            setForehead({ x: toScreenX(rawX), y: toScreenY(foreheadRawY) });
          } catch (e) {
            const err = e as Record<string, unknown>;
            console.warn('[Camera] detection error:', err?.['code'], err?.['message']);
            if (err?.['code'] === 'system/camera-is-restricted' && isCameraReadyRef.current) {
              console.warn('[Camera] detection: bad session → recovering');
              recoverCamera();
            }
          } finally {
            detectionBusyRef.current = false;
          }
          // takePhoto() on iOS captures full-res images — run less frequently to avoid memory pressure
        },
        Platform.OS === 'ios' ? 2500 : 800
      );

      return () => {
        setIsFocused(false);
        setForehead(null);
        clearInterval(interval);
      };
    }, [recoverCamera])
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
        photo
        isActive={isFocused && isCameraActive}
        onInitialized={() => {
          isCameraReadyRef.current = true;
          setIsCameraReady(true);
          isSwitchingRef.current = false;
          setFrozenFrameUri(null);
        }}
        onError={(e) => {
          // Only recover if we're not already in the middle of a flip/recovery
          if (!isSwitchingRef.current) {
            console.warn('[Camera] onError:', e.code, e.message, '→ recovering');
            recoverCamera();
          } else {
            console.warn('[Camera] onError during switch (expected):', e.code);
          }
        }}
      />

      {/* Freeze-frame shown while the camera session is reinitialising after a flip */}
      {frozenFrameUri && (
        <Image
          source={{ uri: frozenFrameUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      {/* Pokemon sprite positioned over the detected forehead */}
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
      <TouchableOpacity
        style={[styles.photoButton, !isCameraReady && styles.buttonDisabled]}
        onPress={takeAndSave}
        disabled={!isCameraReady}
      >
        <Text style={styles.flipButtonText}>{saved ? '✅' : '📸'}</Text>
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
  noFavLabel: {
    color: '#00ff00',
    fontSize: 11,
    fontWeight: 'bold',
  },
  flipButton: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  photoButton: {
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
  buttonDisabled: {
    opacity: 0.4,
  },
});
