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
  spriteSmall?: string;
  spriteFull?: string;
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

type PokemonSprite = {
  front_default: string;
  other: { dream_world: { front_default: string } };
};

export type PokemonDetailResponse = {
  stats: PokemonStat[];
  types: PokemonType[];
  sprites: PokemonSprite;
};

export type PokeType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';
