import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>('light');

  useEffect(() => {
    const loadSavedTheme = async () => {
      const saved = await AsyncStorage.getItem('@my_theme');
      if (saved !== null) {
        setTheme(saved);
      }
    };
    loadSavedTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('@my_theme', newTheme);
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useIsDark() {
  const themeContext = useContext(ThemeContext);
  return themeContext?.theme === 'dark';
}
