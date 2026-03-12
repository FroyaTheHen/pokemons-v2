import React, { createContext, useContext } from 'react';
import { usePokemonList } from '../hooks/usePokemonList';
import { Pokemon } from '../types/pokemon';

type PokemonListContextType = {
  data: Pokemon[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  count: number;
};

const PokemonListContext = createContext<PokemonListContextType | null>(null);

export function PokemonListProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, loadingMore, error, count } = usePokemonList();
  return (
    <PokemonListContext.Provider value={{ data, loading, loadingMore, error, count }}>
      {children}
    </PokemonListContext.Provider>
  );
}

export function usePokemonListContext() {
  const ctx = useContext(PokemonListContext);
  if (!ctx) throw new Error('usePokemonListContext must be used within PokemonListProvider');
  return ctx;
}
