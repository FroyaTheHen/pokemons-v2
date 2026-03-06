import { SplashScreen, Stack } from 'expo-router';
import { useContext, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, StyleSheet, View, Pressable } from 'react-native';
import pokemonLogo from '../assets/pokemon-logo.png';
import { ThemeContext, ThemeProvider } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import settings from '../assets/icons/settings.png';

function HeaderLogo() {
  return (
    <View style={styles.row}>
      <Image source={pokemonLogo} style={styles.headerImage} resizeMode="contain" />
      <Pressable onPress={() => navigateToSettings()}>
        <View style={styles.iconWrapper}>
          <Image source={settings} style={styles.icon} />
        </View>
      </Pressable>
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
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { theme } = useContext(ThemeContext)!;
  const bg = theme === 'dark' ? '#121212' : '#ffffff';

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
    backgroundColor: '#d4d5d7',
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
});
