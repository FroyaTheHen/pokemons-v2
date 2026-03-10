import { SplashScreen, Stack, useNavigation } from 'expo-router';
import { useContext, useEffect } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, StyleSheet, View, Pressable, Text } from 'react-native';
import pokemonLogo from '../assets/pokemon-logo.png';
import { ThemeContext, ThemeProvider } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import settings from '../assets/icons/settings.png';
import { PokmemonProvider } from '../contexts/FavouriteContext';

function AppHeader() {
  const { theme } = useContext(ThemeContext)!;
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const tint = isDark ? '#ffffff' : '#000000';
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  return (
    <View style={[styles.header, { backgroundColor: bg, paddingTop: insets.top }]}>
      {canGoBack ? (
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: tint }]}>‹</Text>
        </Pressable>
      ) : (
        <Image source={pokemonLogo} style={styles.headerImage} resizeMode="contain" />
      )}
      <Pressable onPress={() => router.push('/settings')}>
        <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#6a6a6a' : '#d4d5d7' }]}>
          <Image source={settings} style={styles.icon} />
        </View>
      </Pressable>
    </View>
  );
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
        header: () => <AppHeader />,
        contentStyle: { backgroundColor: bg },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="pokemon/[name]" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerImage: {
    width: 120,
    height: 40,
  },
  backButton: {
    paddingRight: 8,
  },
  backArrow: {
    fontSize: 42,
    lineHeight: 44,
  },
  iconWrapper: {
    borderRadius: 25,
    padding: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
});
