export type Pokemon = {
  name: string;
  url: string;
  hp?: number;
  speed?: number;
  attack?: number;
  specialAttack?: number;
  defense?: number;
  specialDefense?: number;
  types?: string[];
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
};

type PokemonStat = {
  base_stat: number;
  stat: { name: string };
};

type PokemonType = {
  type: { name: string };
};

export type PokemonDetailResponse = {
  stats: PokemonStat[];
  types: PokemonType[];
};
