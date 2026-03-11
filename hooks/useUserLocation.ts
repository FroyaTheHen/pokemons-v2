import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

type UserLocation = {
  location: Location.LocationObject | null;
  error: string | null;
};

export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  return { location, error };
}
