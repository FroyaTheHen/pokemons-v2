import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { usePokemonList } from '../../hooks/usePokemonList';

export default function Index() {
  const { data, loading, loadingMore, error, hasMore, count, loadMore } = usePokemonList();

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
    <View>
      <Text style={styles.count}>{count} pokemons found</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
  },
  item: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 16,
  },
  count: {
    textAlign: 'right',
    paddingRight: 16,
  },
});
