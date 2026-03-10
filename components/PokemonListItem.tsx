import { Pressable, StyleSheet, Text, View, Image } from 'react-native';

import { Pokemon } from '../types/pokemon';
import { PokemonType } from './PokemonType';
import { useIsDark } from '../contexts/ThemeContext';
import React, { useMemo } from 'react';

type Props = {
  item: Pokemon;
  onPress: () => void;
  index: number;
};

export function PokemonListItem({ item, onPress, index }: Props) {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={{ uri: item.spriteSmall }} style={styles.image} />

      <View style={styles.nameWrapper}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.index}>{index + 1}</Text>
      </View>

      <View style={styles.types}>
        {item.types?.map((t) => (
          <PokemonType key={t} t={t} />
        ))}
      </View>
    </Pressable>
  );
}

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      gap: 12,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    },
    image: {
      width: 60,
      height: 60,
    },
    nameWrapper: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      textTransform: 'capitalize',
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    index: {
      fontSize: 12,
      color: isDark ? '#aaaaaa' : '#888888',
      marginTop: 2,
    },
    types: {
      flexDirection: 'row',
      gap: 4,
    },
  });
};
