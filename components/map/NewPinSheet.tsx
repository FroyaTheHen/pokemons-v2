import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  KeyboardAvoidingView,
  Pressable,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useIsDark } from '../../contexts/ThemeContext';
import { usePokemonList } from '../../hooks/usePokemonList';
import { Pokemon } from '../../types/pokemon';

type Props = {
  coords: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onSave: (pokemon: Pokemon) => void;
};

export function NewPinSheet({ coords, onClose, onSave }: Props) {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const { data: pokemonList, loadMore, hasMore, loadingMore } = usePokemonList();
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    if (coords) setSelectedPokemon(null);
  }, [coords]);

  return (
    <Modal visible={coords !== null} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>New Pin</Text>
          <Text style={styles.sheetCoords}>
            {coords?.latitude.toFixed(5)}, {coords?.longitude.toFixed(5)}
          </Text>
          <FlatList
            data={pokemonList}
            keyExtractor={(item) => item.name}
            style={styles.pokemonList}
            keyboardShouldPersistTaps="handled"
            onEndReached={() => hasMore && !loadingMore && loadMore()}
            onEndReachedThreshold={0.3}
            renderItem={({ item, index }) => (
              <Pressable
                style={[
                  styles.pokemonItem,
                  {
                    backgroundColor:
                      selectedPokemon?.name === item.name
                        ? '#007AFF'
                        : isDark
                          ? '#2c2c2e'
                          : '#f2f2f7',
                  },
                ]}
                onPress={() => setSelectedPokemon(item)}
              >
                <Text
                  style={[
                    styles.pokemonItemText,
                    {
                      color:
                        selectedPokemon?.name === item.name
                          ? '#ffffff'
                          : isDark
                            ? '#ffffff'
                            : '#000000',
                    },
                  ]}
                >
                  {index + 1} {item.name}
                </Text>
              </Pressable>
            )}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={() => selectedPokemon && onSave(selectedPokemon)}
            >
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    flex: { flex: 1 },
    modalBackdrop: { flex: 1 },
    bottomSheet: {
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 12,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#C7C7CC',
      alignSelf: 'center',
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
      textTransform: 'capitalize',
      color: isDark ? '#ffffff' : '#000000',
    },
    sheetCoords: {
      fontSize: 14,
      marginBottom: 16,
      color: isDark ? '#aaaaaa' : '#666666',
    },
    buttonRow: { flexDirection: 'row', gap: 12 },
    actionButton: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    actionButtonText: { fontSize: 16, fontWeight: '600' },
    cancelButton: { backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7' },
    cancelButtonText: { color: isDark ? '#ffffff' : '#000000' },
    saveButton: { backgroundColor: '#007AFF' },
    primaryButtonText: { color: '#ffffff' },
    pokemonList: { maxHeight: 200, marginBottom: 16 },
    pokemonItem: {
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 4,
    },
    pokemonItemText: { fontSize: 15, fontWeight: '500', textTransform: 'capitalize' },
  });
