import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, StyleSheet } from 'react-native';
import pokemonLogo from '../assets/pokemon-logo.png';

function HeaderLogo() {
  return <Image source={pokemonLogo} style={styles.headerImage} resizeMode="contain" />;
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerShadowVisible: false,
          headerTintColor: '#000000',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pokemon/[name]" />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: 120,
    height: 40,
    paddingVertical: 50,
  },
});
