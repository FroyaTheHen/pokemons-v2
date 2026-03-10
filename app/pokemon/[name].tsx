import { useLocalSearchParams } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageSourcePropType,
  Pressable,
  Modal,
} from 'react-native';
import { PokemonTypeDetail } from '../../components/PokemonType';
import { Image as ExpoImage } from 'expo-image';
import { Image as ReactNativeImage } from 'react-native';
import statHeart from '../../assets/icons/stat-hearth.png';
import shape from '../../assets/icons/shape.png';
import statShield from '../../assets/icons/stat-shield.png';
import statTargetAlt from '../../assets/icons/stat-target-alt.png';
import { useIsDark } from '../../contexts/ThemeContext';
import { PokemonContext } from '../../contexts/FavouriteContext';
import React, { useMemo, useContext, useState } from 'react';
import heartSolid from '../../assets/icons/heart-solid.png';
import heart from '../../assets/icons/heart.png';

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
  const pokeContext = useContext(PokemonContext);
  const [betrayalModal, setBetrayalModal] = useState<string | null>(null);
  const betrayalName = betrayalModal
    ? betrayalModal.charAt(0).toUpperCase() + betrayalModal.slice(1)
    : null;

  const typesList = useMemo(() => types?.split(','), [types]);

  const newPokemonData = useMemo(
    () => ({
      name,
      url: '',
      hp: hp ? Number(hp) : undefined,
      speed: speed ? Number(speed) : undefined,
      attack: attack ? Number(attack) : undefined,
      specialAttack: specialAttack ? Number(specialAttack) : undefined,
      defense: defense ? Number(defense) : undefined,
      specialDefense: specialDefense ? Number(specialDefense) : undefined,
      types: typesList,
      spriteFull,
    }),
    [name, hp, speed, attack, specialAttack, defense, specialDefense, typesList, spriteFull]
  );

  const isFav = pokeContext?.pokemon?.name === name;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[themeStyle.title]}>{name}</Text>

      <View style={styles.typeRow}>
        {typesList?.map((t) => (
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

      <Pressable
        style={[
          styles.favButton,
          {
            backgroundColor: isFav
              ? isDark
                ? '#5a1a1a'
                : '#f8d7d7'
              : isDark
                ? '#2a2a2a'
                : '#e8e8e8',
          },
        ]}
        onPress={() => {
          if (isFav) {
            pokeContext!.clearPokemon();
          } else if (pokeContext?.pokemon) {
            setBetrayalModal(pokeContext.pokemon.name);
          } else {
            pokeContext?.updatePokemon(newPokemonData);
          }
        }}
      >
        <ReactNativeImage source={isFav ? heartSolid : heart} style={styles.heartIcon} />
        <Text
          style={[
            styles.favText,
            { color: isFav ? (isDark ? '#ff9999' : '#c0392b') : isDark ? '#aaaaaa' : '#555555' },
          ]}
        >
          {isFav ? 'Remove' : 'Mark favourite'}
        </Text>
      </Pressable>

      <Modal visible={betrayalModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              Betrayal detected! 💔
            </Text>
            <Text style={[styles.modalBody, { color: isDark ? '#cccccc' : '#444444' }]}>
              {`Poor ${betrayalName} has been tossed aside like yesterday's Pokéball. ${name} is your new obsession now. ${betrayalName} is already packing its bags.`}
            </Text>
            <View
              style={[styles.modalDivider, { backgroundColor: isDark ? '#333333' : '#e0e0e0' }]}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalBtn,
                  {
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor: isDark ? '#333333' : '#e0e0e0',
                  },
                ]}
                onPress={() => setBetrayalModal(null)}
              >
                <Text style={[styles.modalBtnText, { color: isDark ? '#aaaaaa' : '#555555' }]}>
                  Keep {betrayalName}
                </Text>
              </Pressable>
              <Pressable
                style={styles.modalBtn}
                onPress={() => {
                  setBetrayalModal(null);
                  pokeContext?.updatePokemon(newPokemonData);
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#e74c3c', fontWeight: '700' }]}>
                  Ditch {betrayalName}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  favButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    width: 160,
    borderRadius: 24,
  },
  heartIcon: {
    width: 20,
    height: 20,
  },
  favText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    lineHeight: 20,
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 15,
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
