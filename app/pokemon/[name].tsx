import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type StatRowProps = { label: string; value?: string | number };

function StatRow({ label, value }: StatRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? '—'}</Text>
    </View>
  );
}

export default function PokemonDetail() {
  const { name, hp, speed, attack, specialAttack, defense, specialDefense, types } =
    useLocalSearchParams<{
      name: string;
      hp: string;
      speed: string;
      attack: string;
      specialAttack: string;
      defense: string;
      specialDefense: string;
      types: string;
    }>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <View style={styles.section}>
        <View style={styles.typeRow}>
          {types?.split(',').map((t) => (
            <View key={t}>
              <Text style={styles.typeText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base Stats</Text>
        <StatRow label="HP" value={hp} />
        <StatRow label="Speed" value={speed} />
        <StatRow label="Attack" value={attack} />
        <StatRow label="Special Attack" value={specialAttack} />
        <StatRow label="Defense" value={defense} />
        <StatRow label="Special Defense" value={specialDefense} />
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeText: {
    fontSize: 14,
    textTransform: 'capitalize',
    color: '#3730a3',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 15,
    color: '#374151',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});
