import * as Location from 'expo-location';

const DEV_LOCATION: Location.LocationObject = {
  coords: {
    latitude: 50.047704,
    longitude: 19.95814,
    altitude: null,
    accuracy: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
};

export async function getPhotoLocation(): Promise<Location.LocationObject | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return __DEV__ ? DEV_LOCATION : null;
  try {
    return await Location.getCurrentPositionAsync({});
  } catch {
    return __DEV__ ? DEV_LOCATION : null;
  }
}
