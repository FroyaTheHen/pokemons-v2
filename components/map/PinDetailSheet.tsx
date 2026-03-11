import React, { useMemo } from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useIsDark } from '../../contexts/ThemeContext';
import { MapPin } from '../../contexts/PinContext';

type Props = {
  pin: MapPin | null;
  onClose: () => void;
  onDelete: () => void;
};

export function PinDetailSheet({ pin, onClose, onDelete }: Props) {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <Modal visible={pin !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.flex}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.pinDetailRow}>
            {pin?.pokemon.spriteSmall ? (
              <Image source={{ uri: pin.pokemon.spriteSmall }} style={styles.pinDetailImage} />
            ) : null}
            <View>
              <Text style={styles.sheetTitle}>{pin?.pokemon.name}</Text>
              <Text style={[styles.sheetCoords, styles.sheetCoordsCompact]}>
                {pin?.coordinates.latitude.toFixed(5)}, {pin?.coordinates.longitude.toFixed(5)}
              </Text>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Remove Pin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    sheetCoordsCompact: { marginBottom: 0 },
    pinDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    pinDetailImage: { width: 100, height: 100 },
    buttonRow: { flexDirection: 'row', gap: 12 },
    actionButton: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    actionButtonText: { fontSize: 16, fontWeight: '600' },
    cancelButton: { backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7' },
    cancelButtonText: { color: isDark ? '#ffffff' : '#000000' },
    deleteButton: { backgroundColor: '#FF3B30' },
    primaryButtonText: { color: '#ffffff' },
  });
