import { useLocalSearchParams } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { PokemonTypeDetail } from '../../components/PokemonType';
import { Image as ExpoImage } from 'expo-image';
import { Image as ReactNativeImage } from 'react-native';
import statHeart from '../../assets/icons/stat-hearth.png';
import shape from '../../assets/icons/shape.png';
import statShield from '../../assets/icons/stat-shield.png';
import statTargetAlt from '../../assets/icons/stat-target-alt.png';

type StatRowProps = {
  label: string;
  value?: string | number;
  icon: ImageSourcePropType;
  additionalStyle: StyleProp<ViewStyle>;
};

function StatRow({ label, value, icon, additionalStyle }: StatRowProps) {
  return (
    <View style={[styles.row, additionalStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={styles.value}>{value ?? '—'}</Text>
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <View style={styles.typeRow}>
        {types?.split(',').map((t) => (
          <PokemonTypeDetail key={t} t={t} />
        ))}
      </View>

      <View style={styles.section}>
        <ExpoImage source={{ uri: spriteFull }} style={styles.image} />
      </View>

      <View style={styles.section}>
        <StatRow label="HP" value={hp} icon={statHeart} additionalStyle={styles.empty} />
        <StatRow label="Speed" value={speed} icon={shape} additionalStyle={styles.rowUnderlined} />
        <StatRow
          label="Attack"
          value={attack}
          icon={statTargetAlt}
          additionalStyle={styles.empty}
        />
        <StatRow
          label="Special Attack"
          value={specialAttack}
          icon={statTargetAlt}
          additionalStyle={styles.rowUnderlined}
        />
        <StatRow label="Defense" value={defense} icon={statShield} additionalStyle={styles.empty} />
        <StatRow
          label="Special Defense"
          value={specialDefense}
          icon={statShield}
          additionalStyle={styles.empty}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 20,
    textAlign: 'center',
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
    paddingVertical: 120,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowUnderlined: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d4d5d7',
  },
  empty: {},
  label: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    width: 24,
    height: 24,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
