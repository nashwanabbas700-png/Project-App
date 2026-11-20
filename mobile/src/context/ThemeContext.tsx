import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MobileColors,
  ThemeColors,
  MobileSpacing,
  MobileRadius,
  MobileShadow,
} from '../constants/mobileTheme';

const THEME_PREF_KEY = '@edunova_theme_mode';

interface ThemeContextType {
  mode: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof MobileSpacing;
  radius: typeof MobileRadius;
  shadow: typeof MobileShadow;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREF_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setMode(saved);
      }
    });
  }, []);

  const setThemeMode = (newMode: 'light' | 'dark') => {
    setMode(newMode);
    AsyncStorage.setItem(THEME_PREF_KEY, newMode).catch(() => {});
  };

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
  };

  const colors = MobileColors[mode];

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark: mode === 'dark',
        colors,
        spacing: MobileSpacing,
        radius: MobileRadius,
        shadow: MobileShadow,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
