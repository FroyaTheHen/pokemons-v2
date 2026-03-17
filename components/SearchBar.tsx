import { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useIsDark } from '../contexts/ThemeContext';
import Search from '../assets/icons/search.png';
import { Image } from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export default function PokemonSearchBar({ value, onChangeText }: Props) {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.container}>
      <Image source={Search} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search a pokemon..."
        placeholderTextColor={isDark ? '#888888' : '#aaaaaa'}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 15,
      marginBottom: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#5d5c5c' : '#c5c5c5',
      paddingHorizontal: 12,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#000000',
      paddingVertical: 12,
    },
    icon: {
      width: 20,
      height: 20,
    },
  });
