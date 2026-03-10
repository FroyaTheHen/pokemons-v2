import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MapPin = {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  title: string;
};

type PinContextType = {
  pins: MapPin[];
  addPin: (latitude: number, longitude: number, title: string) => Promise<void>;
  removePin: (id: string) => Promise<void>;
};

const PinContext = createContext<PinContextType | null>(null);

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [pins, setPins] = useState<MapPin[]>([]);

  useEffect(() => {
    const loadPins = async () => {
      try {
        const savedPins = await AsyncStorage.getItem('@saved_pins');
        if (savedPins) {
          setPins(JSON.parse(savedPins));
        }
      } catch (error) {
        console.error('Failed to load pins', error);
      }
    };
    loadPins();
  }, []);

  const addPin = async (latitude: number, longitude: number, title: string) => {
    const newPin: MapPin = {
      id: Date.now().toString(),
      coordinates: { latitude, longitude },
      title,
    };
    const updatedPins = [...pins, newPin];
    setPins(updatedPins);
    try {
      await AsyncStorage.setItem('@saved_pins', JSON.stringify(updatedPins));
    } catch (error) {
      console.error('Failed to save pin', error);
    }
  };

  const removePin = async (id: string) => {
    const updatedPins = pins.filter((p) => p.id !== id);
    setPins(updatedPins);
    try {
      await AsyncStorage.setItem('@saved_pins', JSON.stringify(updatedPins));
    } catch (error) {
      console.error('Failed to remove pin', error);
    }
  };

  return <PinContext.Provider value={{ pins, addPin, removePin }}>{children}</PinContext.Provider>;
}

export function usePins() {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error('usePins must be used within a PinProvider');
  return ctx;
}
