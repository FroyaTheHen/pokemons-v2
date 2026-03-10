import { SplashScreen, Stack } from 'expo-router';
import { useContext, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, StyleSheet, View, Pressable, Text } from 'react-native';
import pokemonLogo from '../assets/pokemon-logo.png';
import { ThemeContext, ThemeProvider } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import settings from '../assets/icons/settings.png';
import { PokemonContext, PokmemonProvider } from '../contexts/FavouriteContext';

function FavouritePokemon() {
  const context = useContext(PokemonContext);
  if (!context?.pokemon) {
    return <Text style={styles.favText}>No Pokemon loaded yet...</Text>;
  }
  const { pokemon } = context;
  return <Text style={styles.favText}>Fav: {pokemon.name}</Text>;
}

function HeaderLogo() {
  const { theme } = useContext(ThemeContext)!;
  const isDark = theme === 'dark';
  return (
    <View>
      <View style={styles.row}>
        <Image source={pokemonLogo} style={styles.headerImage} resizeMode="contain" />
        <Pressable onPress={() => navigateToSettings()}>
          <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#6a6a6a' : '#d4d5d7' }]}>
            <Image source={settings} style={styles.icon} />
          </View>
        </Pressable>
      </View>
      <FavouritePokemon />
    </View>
  );
}

function navigateToSettings() {
  router.push('/settings');
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PokmemonProvider>
          <AppNavigator />
        </PokmemonProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { theme } = useContext(ThemeContext)!;
  const bg = theme === 'dark' ? '#1e1e1e' : '#ffffff';

  return (
    <Stack
      screenOptions={{
        headerTitle: () => <HeaderLogo />,
        headerTitleAlign: 'left',
        headerStyle: { backgroundColor: bg },
        contentStyle: { backgroundColor: bg },
        headerShadowVisible: false,
        headerTintColor: theme === 'dark' ? '#ffffff' : '#000000',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="pokemon/[name]" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: 120,
    height: 40,
    paddingVertical: 50,
  },
  iconWrapper: {
    borderRadius: 25,
    padding: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favText: {
    fontSize: 12,
    color: '#888888',
  },
});
