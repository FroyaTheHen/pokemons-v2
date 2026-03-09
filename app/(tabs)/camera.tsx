import { Text, View, StyleSheet } from 'react-native';
import { useIsDark } from '../../contexts/ThemeContext';
import React, { useMemo } from 'react';

export default function CameraScreen() {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Camera screen</Text>
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
