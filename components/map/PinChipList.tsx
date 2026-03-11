import React, { useMemo } from 'react';
import { View, ScrollView, Pressable, Text, Image, StyleSheet } from 'react-native';
import { useIsDark } from '../../contexts/ThemeContext';
import { MapPin } from '../../contexts/PinContext';

type Props = {
  pins: MapPin[];
  onPressPin: (pin: MapPin) => void;
};

export function PinChipList({ pins, onPressPin }: Props) {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  if (pins.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {pins.map((pin, index) => (
          <Pressable
            key={pin.id}
            style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => onPressPin(pin)}
          >
            {pin.pokemon.spriteSmall ? (
              <Image source={{ uri: pin.pokemon.spriteSmall }} style={styles.image} />
            ) : null}
            <Text>{index + 1}. </Text>
            <Text style={styles.chipText} numberOfLines={1}>
              {pin.pokemon.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
    },
    content: {
      paddingHorizontal: 12,
      gap: 8,
    },
    chip: {
      backgroundColor: isDark ? '#1e1e1ebb' : '#ffffffcc',
      borderRadius: 5,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    chipText: {
      fontSize: 13,
      color: isDark ? '#ffffff' : '#000000',
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    image: { width: 50, height: 50 },
  });
