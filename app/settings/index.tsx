import { StyleSheet, Text, View, Switch } from 'react-native';
import React, { useContext } from 'react';

import { ThemeContext } from '../../contexts/ThemeContext';

export default function SettingsIndexScreen() {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;

  const { theme, toggleTheme } = themeContext;

  const isDark = theme === 'dark';
  const textColor = isDark ? '#a84848' : '#333333';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={{ color: textColor }}>Theme</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#f9f46a' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  text: {
    color: '#fff',
  },
});
