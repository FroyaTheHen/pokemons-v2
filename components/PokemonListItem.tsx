import { Pressable, StyleSheet, Text, View, Image } from 'react-native';

import { Pokemon } from '../types/pokemon';
import { PokemonType } from './PokemonType';

type Props = {
  item: Pokemon;
  onPress: () => void;
};

export function PokemonListItem({ item, onPress }: Props) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={{ uri: item.spriteSmall }} style={styles.image} />

      <View style={styles.name}>
        <Text style={styles.name}>{item.name}</Text>
      </View>

      <View style={styles.types}>
        {item.types?.map((t) => (
          <PokemonType key={t} t={t} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 12,
  },
  image: {
    width: 60,
    height: 60,
  },
  name: {
    flex: 1,
    fontSize: 16,
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
  types: {
    flexDirection: 'row',
    gap: 4,
  },
});
