import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Image as RNImage } from 'react-native';
import heartSolid from '../../assets/icons/heart-solid.png';
import { useContext } from 'react';
import { usePokemonList } from '../../hooks/usePokemonList';
import { Pokemon } from '../../types/pokemon';
import { PokemonListItem } from '../../components/PokemonListItem';
import { useIsDark } from '../../contexts/ThemeContext';
import React, { useMemo } from 'react';
import { PokemonContext } from '../../contexts/FavouriteContext';
import PokemonSearchBar from '../../components/SearchBar';

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

function FavouritePokemon() {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const context = useContext(PokemonContext);
  if (!context?.pokemon) {
    return <View></View>;
  }
  const { pokemon } = context;
  return (
    <View style={styles.favouriteWrapper}>
      <View style={styles.favouritePokemon}>
        <View style={styles.favouriteImageContainer}>
          <View style={styles.favouriteImageWrapper}>
            <Image source={{ uri: pokemon.spriteFull }} style={styles.favouriteImage} />
          </View>
          <View style={[styles.heartBadge, { backgroundColor: isDark ? '#F1C242' : '#F6D98A' }]}>
            <RNImage source={heartSolid} style={styles.heartBadgeIcon} />
          </View>
        </View>

        <View style={styles.nameWrapper}>
          <Text style={styles.favouriteTextHeader}>your favourite pokemon</Text>

          <Text style={styles.favouriteName}>{pokemon.name}</Text>
        </View>
      </View>
      <View style={styles.favouriteFooter}>
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: isDark ? '#ffffff' : '#000000',
            },
          ]}
          onPress={() => navigateToDetail(pokemon)}
        >
          <Text style={[styles.btnText, { color: isDark ? '#000000' : '#ffffff' }]}>
            See details
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: isDark ? '#000000' : '#c5c5c5' }]}
          onPress={() => {
            context.clearPokemon();
          }}
        >
          <Text style={[styles.btnText, { color: isDark ? '#ffffff' : '#000000' }]}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
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
      <FavouritePokemon />
      <PokemonSearchBar />
      <View style={styles.pokeListContainer}>
        <View style={styles.row}>
          <Text style={styles.name}> Pokedex </Text>
          <Text style={styles.count}>
            {data.length} / {count} pokemons
          </Text>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <PokemonListItem item={item} index={index} onPress={() => navigateToDetail(item)} />
          )}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} /> : null}
        />
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean) => {
  const bg = isDark ? '#121212' : '#f2f2f2';
  const text = isDark ? '#ffffff' : '#000000';
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#ffffff',
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
    pokeListContainer: {
      backgroundColor: bg,
    },
    favouriteName: {
      fontSize: 20,
      textTransform: 'capitalize',
      fontWeight: 'bold',
      color: text,
    },
    favouriteWrapper: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderWidth: 1,
      marginHorizontal: 15,
      marginVertical: 15,
      borderColor: isDark ? '#aaaaaa' : '#c5c5c5',
    },
    favouritePokemon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    favouriteFooter: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 15,
    },
    favouriteTextHeader: {
      textTransform: 'uppercase',
      color: isDark ? '#ffffff' : '#aaaaaa',
      fontWeight: 'bold',
    },
    image: {
      width: 60,
      height: 60,
    },
    favouriteImageContainer: {
      position: 'relative',
    },
    heartBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heartBadgeIcon: {
      width: 22,
      height: 22,
    },
    favouriteImageWrapper: {
      width: 90,
      height: 90,
      borderRadius: 8,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderWidth: 1,
      borderColor: isDark ? '#aaaaaa' : '#c5c5c5',
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    favouriteImage: {
      width: 70,
      height: 70,
    },
    nameWrapper: {
      flex: 1,
    },
    button: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      width: 160,
      borderRadius: 24,
    },
    btnText: {
      fontSize: 15,
      fontWeight: 'bold',
    },
  });
};
