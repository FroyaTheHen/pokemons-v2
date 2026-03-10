import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon } from '../types/pokemon';

interface PokemonContextType {
  pokemon: Pokemon | null;
  updatePokemon: (newPokemon: Pokemon) => Promise<void>;
  clearPokemon: () => Promise<void>;
}

export const PokemonContext = createContext<PokemonContextType | null>(null);

export function PokmemonProvider({ children }: { children: React.ReactNode }) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    const loadSavedPokemon = async () => {
      const saved = await AsyncStorage.getItem('@favourite_pokemon');
      if (saved) {
        setPokemon(JSON.parse(saved));
      }
    };
    loadSavedPokemon();
  }, []);

  const updatePokemon = useCallback(async (newPokemon: Pokemon) => {
    setPokemon(newPokemon);
    await AsyncStorage.setItem('@favourite_pokemon', JSON.stringify(newPokemon));
  }, []);

  const clearPokemon = useCallback(async () => {
    setPokemon(null);
    await AsyncStorage.removeItem('@favourite_pokemon');
  }, []);

  const value = useMemo(
    () => ({ pokemon, updatePokemon, clearPokemon }),
    [pokemon, updatePokemon, clearPokemon]
  );

  return <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>;
}
