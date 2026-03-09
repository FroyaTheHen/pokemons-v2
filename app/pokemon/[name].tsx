import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, ImageSourcePropType } from 'react-native';
import { PokemonTypeDetail } from '../../components/PokemonType';
import { Image as ExpoImage } from 'expo-image';
import { Image as ReactNativeImage } from 'react-native';
import statHeart from '../../assets/icons/stat-hearth.png';
import shape from '../../assets/icons/shape.png';
import statShield from '../../assets/icons/stat-shield.png';
import statTargetAlt from '../../assets/icons/stat-target-alt.png';
import { useIsDark } from '../../contexts/ThemeContext';
import React, { useMemo } from 'react';

type StatRowProps = {
  label: string;
  value?: string | number;
  icon: ImageSourcePropType;
  underline: boolean;
  themeStyle: ReturnType<typeof createStyles>;
};

function StatRow({ label, value, icon, underline, themeStyle }: StatRowProps) {
  return (
    <View style={[styles.row, underline ? themeStyle.rowUnderlined : {}]}>
      <Text style={themeStyle.label}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={themeStyle.value}>{value ?? '—'}</Text>
        <ReactNativeImage source={icon} style={styles.icon} />
      </View>
    </View>
  );
}

export default function PokemonDetail() {
  const { name, hp, speed, attack, specialAttack, defense, specialDefense, types, spriteFull } =
    useLocalSearchParams<{
      name: string;
      hp: string;
      speed: string;
      attack: string;
      specialAttack: string;
      defense: string;
      specialDefense: string;
      types: string;
      spriteFull: string;
    }>();

  const isDark = useIsDark();
  const themeStyle = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[themeStyle.title]}>{name}</Text>

      <View style={styles.typeRow}>
        {types?.split(',').map((t) => (
          <PokemonTypeDetail key={t} t={t} />
        ))}
      </View>

      <View style={styles.section}>
        <ExpoImage source={{ uri: spriteFull }} style={styles.image} />
      </View>

      <View style={styles.section}>
        <StatRow label="HP" value={hp} icon={statHeart} underline={false} themeStyle={themeStyle} />
        <StatRow
          label="Speed"
          value={speed}
          icon={shape}
          underline={true}
          themeStyle={themeStyle}
        />
        <StatRow
          label="Attack"
          value={attack}
          icon={statTargetAlt}
          underline={false}
          themeStyle={themeStyle}
        />
        <StatRow
          label="Special Attack"
          value={specialAttack}
          icon={statTargetAlt}
          underline={true}
          themeStyle={themeStyle}
        />
        <StatRow
          label="Defense"
          value={defense}
          icon={statShield}
          underline={false}
          themeStyle={themeStyle}
        />
        <StatRow
          label="Special Defense"
          value={specialDefense}
          icon={statShield}
          underline={false}
          themeStyle={themeStyle}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
});

const createStyles = (isDark: boolean) => {
  const textColor = isDark ? '#ffffff' : '#000000';
  const separatorColor = isDark ? '#444444' : '#d4d5d7';

  return StyleSheet.create({
    value: {
      fontSize: 15,
      fontWeight: '500',
      color: textColor,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      textTransform: 'capitalize',
      marginBottom: 20,
      textAlign: 'center',
      color: textColor,
    },
    label: {
      fontSize: 15,
      fontWeight: '500',
      color: textColor,
    },
    rowUnderlined: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: separatorColor,
    },
  });
};
