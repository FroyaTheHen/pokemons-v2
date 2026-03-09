import { Text, View, StyleSheet } from 'react-native';
import { useIsDark } from '../../contexts/ThemeContext';
import React, { useMemo } from 'react';

export default function MapScreen() {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map screen</Text>
    </View>
  );
}

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    text: {
      color: isDark ? '#ffffff' : '#000000',
    },
  });
};
