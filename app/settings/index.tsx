import { StyleSheet, Text, View, Switch } from 'react-native';
import React, { useContext, useMemo } from 'react';

import { ThemeContext, useIsDark } from '../../contexts/ThemeContext';

export default function SettingsIndexScreen() {
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;

  const { toggleTheme } = themeContext;

  return (
    <View style={[styles.container]}>
      <View style={styles.row}>
        <Text style={styles.text}>Theme</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#cfcfcf' }}
        />
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    text: {
      color: isDark ? '#ffffff' : '#333333',
    },
  });
};
