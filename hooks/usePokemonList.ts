import { useCallback, useEffect, useState } from 'react';

import { Pokemon, PokemonDetailResponse, PokemonListResponse } from '../types/pokemon';

const LIMIT = 10;

type State = {
  data: Pokemon[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  count: number;
};

type Result = State & {
  loadMore: () => void;
};

export function usePokemonList(): Result {
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: true,
    count: 0,
  });

  useEffect(() => {
    const isFirstPage = offset === 0;

    setState((prev) => ({
      ...prev,
      loading: isFirstPage,
      loadingMore: !isFirstPage,
      error: null,
    }));

    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`)
      .then((res) => res.json() as Promise<PokemonListResponse>)
      .then(async (json) => {
        const detailed = await Promise.all(
          json.results.map(async (pokemon) => {
            const detail = await fetch(pokemon.url).then(
              (r) => r.json() as Promise<PokemonDetailResponse>
            );
            const getStat = (name: string) =>
              detail.stats.find((s) => s.stat.name === name)?.base_stat;
            return {
              ...pokemon,
              hp: getStat('hp'),
              speed: getStat('speed'),
              attack: getStat('attack'),
              specialAttack: getStat('special-attack'),
              defense: getStat('defense'),
              specialDefense: getStat('special-defense'),
              types: detail.types.map((t) => t.type.name),
            };
          })
        );
        setState((prev) => ({
          data: isFirstPage ? detailed : [...prev.data, ...detailed],
          loading: false,
          loadingMore: false,
          error: null,
          hasMore: json.next !== null,
          count: json.count,
        }));
      })
      .catch(() =>
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: 'Failed to load Pokemon.',
        }))
      );
  }, [offset]);

  const loadMore = useCallback(() => {
    setState((prev) => {
      if (prev.loadingMore || !prev.hasMore) return prev;
      return prev;
    });
    setOffset((prev) => prev + LIMIT);
  }, []);

  return { ...state, loadMore };
}
