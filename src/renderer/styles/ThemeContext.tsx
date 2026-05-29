import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, Theme } from './theme';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (name: string) => void;
  updateBackground: (background: Theme['background']) => void;
  themes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>('dark');
  const [customBackground, setCustomBackground] = useState<Theme['background'] | null>(null);
  const [oldBackground, setOldBackground] = useState<Theme['background'] | null>(null);
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
    const background = customBackground || theme.background;
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
    // Terminal colors
    document.documentElement.style.setProperty('--terminal-bg', theme.colors.terminalBg);
    document.documentElement.style.setProperty('--terminal-fg', theme.colors.terminalFg);
    document.documentElement.style.setProperty('--terminal-cursor', theme.colors.terminalCursor);
    document.documentElement.style.setProperty('--terminal-cursor-accent', theme.colors.terminalCursorAccent);
    document.documentElement.style.setProperty('--terminal-black', theme.colors.terminalBlack);
    document.documentElement.style.setProperty('--terminal-red', theme.colors.terminalRed);
    document.documentElement.style.setProperty('--terminal-green', theme.colors.terminalGreen);
    document.documentElement.style.setProperty('--terminal-yellow', theme.colors.terminalYellow);
    document.documentElement.style.setProperty('--terminal-blue', theme.colors.terminalBlue);
    document.documentElement.style.setProperty('--terminal-magenta', theme.colors.terminalMagenta);
    document.documentElement.style.setProperty('--terminal-cyan', theme.colors.terminalCyan);
    document.documentElement.style.setProperty('--terminal-white', theme.colors.terminalWhite);
    document.documentElement.style.setProperty('--terminal-bright-black', theme.colors.terminalBrightBlack);
    document.documentElement.style.setProperty('--terminal-bright-red', theme.colors.terminalBrightRed);
    document.documentElement.style.setProperty('--terminal-bright-green', theme.colors.terminalBrightGreen);
    document.documentElement.style.setProperty('--terminal-bright-yellow', theme.colors.terminalBrightYellow);
    document.documentElement.style.setProperty('--terminal-bright-blue', theme.colors.terminalBrightBlue);
    document.documentElement.style.setProperty('--terminal-bright-magenta', theme.colors.terminalBrightMagenta);
    document.documentElement.style.setProperty('--terminal-bright-cyan', theme.colors.terminalBrightCyan);
    document.documentElement.style.setProperty('--terminal-bright-white', theme.colors.terminalBrightWhite);
    
    // Background image settings — new layer
    if (background?.image) {
      document.documentElement.style.setProperty('--bg-image', `url(${background.image})`);
      document.documentElement.style.setProperty('--bg-blur', background.blur ? `${background.blur}px` : '0px');
      document.documentElement.style.setProperty('--bg-opacity', background.opacity ? `${background.opacity}` : '0.5');
      document.documentElement.style.setProperty('--bg-brightness', background.brightness ? `${background.brightness}` : '1');
      document.documentElement.style.setProperty('--bg-image-enabled', 'true');
    } else {
      document.documentElement.style.setProperty('--bg-image-enabled', 'false');
    }

    // Old background layer for crossfade
    if (oldBackground?.image) {
      document.documentElement.style.setProperty('--bg-image-old', `url(${oldBackground.image})`);
      document.documentElement.style.setProperty('--bg-blur-old', oldBackground.blur ? `${oldBackground.blur}px` : '0px');
      document.documentElement.style.setProperty('--bg-opacity-old', oldBackground.opacity ? `${oldBackground.opacity}` : '0.5');
      document.documentElement.style.setProperty('--bg-brightness-old', oldBackground.brightness ? `${oldBackground.brightness}` : '1');
    }
  }, [themeName, customBackground, oldBackground, isInitialized]);

  // Crossfade transition effect — uses two rAFs to control paint frames
  useEffect(() => {
    if (!oldBackground?.image || !customBackground?.image) return;

    const root = document.documentElement;
    const targetOpacity = customBackground.opacity ?? 0.5;
    const oldOpacity = oldBackground.opacity ?? 0.5;
    let cancelled = false;
    let storedRaf2: number | undefined;
    let storedTimer: ReturnType<typeof setTimeout> | undefined;

    // Step 1: freeze transitions, jump new layer to invisible, old layer to visible
    root.style.setProperty('--bg-fade-duration', '0s');
    root.style.setProperty('--bg-opacity', '0');
    root.style.setProperty('--bg-opacity-old', String(oldOpacity));

    // Step 2: after effects settle, schedule the crossfade across two paint frames
    const raf1 = requestAnimationFrame(() => {
      storedRaf2 = requestAnimationFrame(() => {
        if (cancelled) return;
        root.style.setProperty('--bg-fade-duration', '0.5s');
        root.style.setProperty('--bg-opacity', String(targetOpacity));
        root.style.setProperty('--bg-opacity-old', '0');
      });

      storedTimer = setTimeout(() => {
        if (cancelled) return;
        setOldBackground(null);
        root.style.removeProperty('--bg-image-old');
        root.style.removeProperty('--bg-blur-old');
        root.style.removeProperty('--bg-opacity-old');
        root.style.removeProperty('--bg-brightness-old');
        root.style.removeProperty('--bg-fade-duration');
      }, 550);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      if (storedRaf2 !== undefined) cancelAnimationFrame(storedRaf2);
      if (storedTimer !== undefined) clearTimeout(storedTimer);
    };
  }, [oldBackground, customBackground]);

  const setTheme = (name: string) => {
    if (themes[name]) {
      setThemeName(name);
      localStorage.setItem('app-theme', name);
    }
  };

  const updateBackground = (background: Theme['background']) => {
    if (customBackground?.image && background?.image && customBackground.image !== background.image) {
      setOldBackground({ ...customBackground });
    }
    setCustomBackground(background);
    if (background) {
      localStorage.setItem('app-background', JSON.stringify(background));
    } else {
      localStorage.removeItem('app-background');
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme: themes[themeName],
      themeName,
      setTheme,
      updateBackground,
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
