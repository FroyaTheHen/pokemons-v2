import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { usePokemonList } from '../../hooks/usePokemonList';
import { Pokemon } from '../../types/pokemon';
import { PokemonListItem } from '../../components/PokemonListItem';
import { useIsDark } from '../../contexts/ThemeContext';
import React, { useMemo } from 'react';

function navigateToDetail(item: Pokemon) {
  router.push({
    pathname: '/pokemon/[name]',
    params: {
      name: item.name,
      hp: item.hp,
      speed: item.speed,
      attack: item.attack,
      specialAttack: item.specialAttack,
      defense: item.defense,
      specialDefense: item.specialDefense,
      types: item.types?.join(','),
      spriteFull: item.spriteFull,
    },
  });
}

export default function Index() {
  const { data, loading, loadingMore, error, hasMore, count, loadMore } = usePokemonList();
  const theme = useIsDark();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.name}> Pokedex </Text>
        <Text style={styles.count}>{count} pokemons found</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PokemonListItem item={item} onPress={() => navigateToDetail(item)} />
        )}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} /> : null}
      />
    </View>
  );
}

const createStyles = (isDark: boolean) => {
  const bg = isDark ? '#121212' : '#f2f2f2';
  const text = isDark ? '#ffffff' : '#000000';
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: bg,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bg,
    },
    list: {
      padding: 16,
    },
    item: {
      padding: 16,
      marginBottom: 8,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: 8,
    },
    name: {
      fontSize: 16,
      textTransform: 'capitalize',
      fontWeight: 'bold',
      color: text,
    },
    footer: {
      paddingVertical: 16,
    },
    count: {
      textAlign: 'right',
      paddingRight: 16,
      color: isDark ? '#aaaaaa' : '#333333',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
    },
  });
};
