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
    const controller = new AbortController();
    const isFirstPage = offset === 0;

    setState((prev) => ({
      ...prev,
      loading: isFirstPage,
      loadingMore: !isFirstPage,
      error: null,
    }));

    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`, {
      signal: controller.signal,
    })
      .then((res) => res.json() as Promise<PokemonListResponse>)
      .then(async (json) => {
        const detailed = await Promise.all(
          json.results.map(async (pokemon) => {
            const detail = await fetch(pokemon.url, { signal: controller.signal }).then(
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
              spriteSmall: detail.sprites.front_default,
              spriteFull: detail.sprites.other.dream_world.front_default,
            };
          })
        );
        setState((prev) => {
          const existingNames = new Set(prev.data.map((p) => p.name));
          return {
            data: isFirstPage
              ? detailed
              : [...prev.data, ...detailed.filter((p) => !existingNames.has(p.name))],
            loading: false,
            loadingMore: false,
            error: null,
            hasMore: json.next !== null,
            count: json.count,
          };
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: 'Failed to load Pokemon.',
        }));
      });

    return () => controller.abort();
  }, [offset]);

  useEffect(() => {
    if (!state.loading && !state.loadingMore && state.hasMore) {
      setOffset((prev) => prev + LIMIT);
    }
  }, [state.loading, state.loadingMore, state.hasMore]);

  const loadMore = useCallback(() => {
    if (state.loadingMore || !state.hasMore) return;
    setOffset((prev) => prev + LIMIT);
  }, [state.loadingMore, state.hasMore]);

  return { ...state, loadMore };
}
