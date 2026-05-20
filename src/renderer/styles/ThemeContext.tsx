import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, Theme } from './theme';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (name: string) => void;
  themes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>('dark');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved && themes[saved]) {
      setThemeName(saved);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const theme = themes[themeName];
    document.documentElement.style.setProperty('--bg-primary', theme.colors.bgPrimary);
    document.documentElement.style.setProperty('--bg-secondary', theme.colors.bgSecondary);
    document.documentElement.style.setProperty('--bg-tertiary', theme.colors.bgTertiary);
    document.documentElement.style.setProperty('--border-color', theme.colors.border);
    document.documentElement.style.setProperty('--text-primary', theme.colors.textPrimary);
    document.documentElement.style.setProperty('--text-secondary', theme.colors.textSecondary);
    document.documentElement.style.setProperty('--accent-color', theme.colors.accent);
    document.documentElement.style.setProperty('--success-color', theme.colors.success);
    document.documentElement.style.setProperty('--warning-color', theme.colors.warning);
    document.documentElement.style.setProperty('--danger-color', theme.colors.danger);
  }, [themeName, isInitialized]);

  const setTheme = (name: string) => {
    if (themes[name]) {
      setThemeName(name);
      localStorage.setItem('app-theme', name);
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme: themes[themeName],
      themeName,
      setTheme,
      themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
