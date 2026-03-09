import { PokeType } from '../types/pokemon';
import { View, Text, StyleProp, TextStyle, StyleSheet } from 'react-native';
import { useIsDark } from '../contexts/ThemeContext';
import React, { useMemo } from 'react';

const typeColors: Record<PokeType, StyleProp<TextStyle>> = {
  normal: { backgroundColor: '#9E9E9E' },
  fire: { backgroundColor: '#D33D34' },
  water: { backgroundColor: '#2C9BE3' },
  electric: { backgroundColor: '#F4D03F' },
  grass: { backgroundColor: '#5B9F3D' },
  ice: { backgroundColor: '#76D7F0' },
  fighting: { backgroundColor: '#C0392B' },
  poison: { backgroundColor: '#8745C4' },
  ground: { backgroundColor: '#D4A04A' },
  flying: { backgroundColor: '#31BFCF' },
  psychic: { backgroundColor: '#E91E8C' },
  bug: { backgroundColor: '#8BC34A' },
  rock: { backgroundColor: '#8D6E63' },
  ghost: { backgroundColor: '#5C3BC1' },
  dragon: { backgroundColor: '#3F51B5' },
  dark: { backgroundColor: '#37474F' },
  steel: { backgroundColor: '#78909C' },
  fairy: { backgroundColor: '#F48FB1' },
};

export function PokemonType({ t }: { t: string }) {
  const dynamicStyle = typeColors[t as PokeType] || {};
  return <View style={[styles.typeCircle, dynamicStyle]}></View>;
}

export function PokemonTypeDetail({ t }: { t: string }) {
  const dynamicStyle = typeColors[t as PokeType] || {};

  const isDark = useIsDark();
  const themeStyles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={themeStyles.typePill}>
      <View style={[styles.typeCircle, dynamicStyle]} />
      <Text style={themeStyles.typeLabel}>{t}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
    typePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 5,
      alignSelf: 'flex-start',
      backgroundColor: isDark ? '#333333' : '#E0E0E0',
    },
    typeLabel: {
      fontSize: 13,
      textTransform: 'capitalize',
      color: isDark ? '#eeeeee' : '#333333',
    },
  });
};
