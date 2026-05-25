export interface Theme {
  name: string;
  colors: {
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    // Terminal colors
    terminalBg: string;
    terminalFg: string;
    terminalCursor: string;
    terminalCursorAccent: string;
    terminalBlack: string;
    terminalRed: string;
    terminalGreen: string;
    terminalYellow: string;
    terminalBlue: string;
    terminalMagenta: string;
    terminalCyan: string;
    terminalWhite: string;
    terminalBrightBlack: string;
    terminalBrightRed: string;
    terminalBrightGreen: string;
    terminalBrightYellow: string;
    terminalBrightBlue: string;
    terminalBrightMagenta: string;
    terminalBrightCyan: string;
    terminalBrightWhite: string;
  };
  // Background image settings
  background?: {
    image?: string;
    blur?: number;
    opacity?: number;
    brightness?: number;
  };
}

export const themes: Record<string, Theme> = {
  dark: {
    name: '深色',
    colors: {
      bgPrimary: '#1e1e1e',
      bgSecondary: '#252526',
      bgTertiary: '#2d2d30',
      border: '#3c3c3c',
      textPrimary: '#cccccc',
      textSecondary: '#858585',
      accent: '#007acc',
      success: '#6a9955',
      warning: '#dcdcaa',
      danger: '#f14c4c',
      // Terminal colors
      terminalBg: '#1e1e1e',
      terminalFg: '#d4d4d4',
      terminalCursor: '#aeafad',
      terminalCursorAccent: '#000000',
      terminalBlack: '#000000',
      terminalRed: '#f14c4c',
      terminalGreen: '#6a9955',
      terminalYellow: '#dcdcaa',
      terminalBlue: '#569cd6',
      terminalMagenta: '#c586c0',
      terminalCyan: '#4ec9b0',
      terminalWhite: '#d4d4d4',
      terminalBrightBlack: '#666666',
      terminalBrightRed: '#f14c4c',
      terminalBrightGreen: '#6a9955',
      terminalBrightYellow: '#dcdcaa',
      terminalBrightBlue: '#569cd6',
      terminalBrightMagenta: '#c586c0',
      terminalBrightCyan: '#4ec9b0',
      terminalBrightWhite: '#ffffff'
    }
  },
  light: {
    name: '浅色',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f3f3f3',
      bgTertiary: '#e8e8e8',
      border: '#d4d4d4',
      textPrimary: '#333333',
      textSecondary: '#666666',
      accent: '#0078d4',
      success: '#107c10',
      warning: '#795e26',
      danger: '#e81123',
      // Terminal colors
      terminalBg: '#fafafa',
      terminalFg: '#3c3c3c',
      terminalCursor: '#000000',
      terminalCursorAccent: '#ffffff',
      terminalBlack: '#000000',
      terminalRed: '#cd3131',
      terminalGreen: '#007400',
      terminalYellow: '#9d802c',
      terminalBlue: '#007acc',
      terminalMagenta: '#795da3',
      terminalCyan: '#379489',
      terminalWhite: '#cccccc',
      terminalBrightBlack: '#808080',
      terminalBrightRed: '#f14c4c',
      terminalBrightGreen: '#16c60c',
      terminalBrightYellow: '#f0c674',
      terminalBrightBlue: '#3794ff',
      terminalBrightMagenta: '#b77ee0',
      terminalBrightCyan: '#56d4dd',
      terminalBrightWhite: '#ffffff'
    }
  },
  blue: {
    name: '蓝色',
    colors: {
      bgPrimary: '#1a1a2e',
      bgSecondary: '#16213e',
      bgTertiary: '#0f3460',
      border: '#e94560',
      textPrimary: '#eaeaea',
      textSecondary: '#a0a0a0',
      accent: '#e94560',
      success: '#4ecca3',
      warning: '#ffc107',
      danger: '#ff6b6b',
      // Terminal colors
      terminalBg: '#1a1a2e',
      terminalFg: '#eaeaea',
      terminalCursor: '#e94560',
      terminalCursorAccent: '#000000',
      terminalBlack: '#0d0d1a',
      terminalRed: '#ff6b6b',
      terminalGreen: '#4ecca3',
      terminalYellow: '#ffc107',
      terminalBlue: '#3794ff',
      terminalMagenta: '#a855f7',
      terminalCyan: '#22d3ee',
      terminalWhite: '#eaeaea',
      terminalBrightBlack: '#4a4a6a',
      terminalBrightRed: '#ff8787',
      terminalBrightGreen: '#6ee7b7',
      terminalBrightYellow: '#fcd34d',
      terminalBrightBlue: '#60a5fa',
      terminalBrightMagenta: '#c084fc',
      terminalBrightCyan: '#67e8f9',
      terminalBrightWhite: '#ffffff'
    }
  },
  green: {
    name: '护眼绿',
    colors: {
      bgPrimary: '#1a2a1a',
      bgSecondary: '#243324',
      bgTertiary: '#2d3d2d',
      border: '#3d4d3d',
      textPrimary: '#d4e6d4',
      textSecondary: '#8fa88f',
      accent: '#4caf50',
      success: '#81c784',
      warning: '#aed581',
      danger: '#e57373',
      // Terminal colors
      terminalBg: '#1a2a1a',
      terminalFg: '#d4e6d4',
      terminalCursor: '#4caf50',
      terminalCursorAccent: '#000000',
      terminalBlack: '#0d1a0d',
      terminalRed: '#e57373',
      terminalGreen: '#81c784',
      terminalYellow: '#aed581',
      terminalBlue: '#64b5f6',
      terminalMagenta: '#ba68c8',
      terminalCyan: '#4dd0e1',
      terminalWhite: '#d4e6d4',
      terminalBrightBlack: '#3d5d3d',
      terminalBrightRed: '#ef9a9a',
      terminalBrightGreen: '#a5d6a7',
      terminalBrightYellow: '#c5e1a5',
      terminalBrightBlue: '#90caf9',
      terminalBrightMagenta: '#ce93d8',
      terminalBrightCyan: '#80deea',
      terminalBrightWhite: '#ffffff'
    }
  },
  purple: {
    name: '紫色',
    colors: {
      bgPrimary: 'rgba(45, 27, 78, 0.85)',
      bgSecondary: 'rgba(30, 17, 51, 0.9)',
      bgTertiary: '#150a25',
      border: '#6b21a8',
      textPrimary: '#e9d5ff',
      textSecondary: '#a78bfa',
      accent: '#a855f7',
      success: '#4ade80',
      warning: '#facc15',
      danger: '#f87171',
      // Terminal colors
      terminalBg: 'transparent',
      terminalFg: '#e9d5ff',
      terminalCursor: '#a855f7',
      terminalCursorAccent: '#000000',
      terminalBlack: '#150a25',
      terminalRed: '#f87171',
      terminalGreen: '#4ade80',
      terminalYellow: '#facc15',
      terminalBlue: '#60a5fa',
      terminalMagenta: '#c084fc',
      terminalCyan: '#22d3ee',
      terminalWhite: '#e9d5ff',
      terminalBrightBlack: '#4c1d6e',
      terminalBrightRed: '#fca5a5',
      terminalBrightGreen: '#86efac',
      terminalBrightYellow: '#fde047',
      terminalBrightBlue: '#93c5fd',
      terminalBrightMagenta: '#e9d5ff',
      terminalBrightCyan: '#67e8f9',
      terminalBrightWhite: '#ffffff'
    },
    background: {
      image: '/girl.png',
      blur: 0,
      opacity: 1,
      brightness: 1
    }
  },
  orange: {
    name: '橙色',
    colors: {
      bgPrimary: '#2d1f12',
      bgSecondary: '#3d2914',
      bgTertiary: '#4d3316',
      border: '#ea580c',
      textPrimary: '#fed7aa',
      textSecondary: '#fdba74',
      accent: '#fb923c',
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#f87171',
      // Terminal colors
      terminalBg: '#2d1f12',
      terminalFg: '#fed7aa',
      terminalCursor: '#fb923c',
      terminalCursorAccent: '#000000',
      terminalBlack: '#1a120a',
      terminalRed: '#f87171',
      terminalGreen: '#4ade80',
      terminalYellow: '#fbbf24',
      terminalBlue: '#60a5fa',
      terminalMagenta: '#fb7185',
      terminalCyan: '#22d3ee',
      terminalWhite: '#fed7aa',
      terminalBrightBlack: '#5c3d1a',
      terminalBrightRed: '#fca5a5',
      terminalBrightGreen: '#86efac',
      terminalBrightYellow: '#fde047',
      terminalBrightBlue: '#93c5fd',
      terminalBrightMagenta: '#fda4af',
      terminalBrightCyan: '#67e8f9',
      terminalBrightWhite: '#ffffff'
    }
  },
  nord: {
    name: 'Nord',
    colors: {
      bgPrimary: 'rgba(46, 52, 64, 0.85)',
      bgSecondary: 'rgba(59, 66, 82, 0.9)',
      bgTertiary: '#434c5e',
      border: '#4c566a',
      textPrimary: '#d8dee9',
      textSecondary: '#8fbcbb',
      accent: '#88c0d0',
      success: '#a3be8c',
      warning: '#ebcb8b',
      danger: '#bf616a',
      // Terminal colors
      terminalBg: 'rgba(46, 52, 64, 0.9)',
      terminalFg: '#d8dee9',
      terminalCursor: '#88c0d0',
      terminalCursorAccent: '#000000',
      terminalBlack: '#1e2430',
      terminalRed: '#bf616a',
      terminalGreen: '#a3be8c',
      terminalYellow: '#ebcb8b',
      terminalBlue: '#81a1c1',
      terminalMagenta: '#b48ead',
      terminalCyan: '#88c0d0',
      terminalWhite: '#e5e9f0',
      terminalBrightBlack: '#4c566a',
      terminalBrightRed: '#bf616a',
      terminalBrightGreen: '#a3be8c',
      terminalBrightYellow: '#ebcb8b',
      terminalBrightBlue: '#81a1c1',
      terminalBrightMagenta: '#b48ead',
      terminalBrightCyan: '#8fbcbb',
      terminalBrightWhite: '#ffffff'
    },
    background: {
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
      blur: 15,
      opacity: 0.35,
      brightness: 0.6
    }
  },
  solarized: {
    name: 'Solarized',
    colors: {
      bgPrimary: '#002b36',
      bgSecondary: '#073642',
      bgTertiary: '#002b36',
      border: '#586e75',
      textPrimary: '#839496',
      textSecondary: '#657b83',
      accent: '#268bd2',
      success: '#859900',
      warning: '#b58900',
      danger: '#dc322f',
      // Terminal colors
      terminalBg: '#002b36',
      terminalFg: '#839496',
      terminalCursor: '#268bd2',
      terminalCursorAccent: '#000000',
      terminalBlack: '#073642',
      terminalRed: '#dc322f',
      terminalGreen: '#859900',
      terminalYellow: '#b58900',
      terminalBlue: '#268bd2',
      terminalMagenta: '#d33682',
      terminalCyan: '#2aa198',
      terminalWhite: '#eee8d5',
      terminalBrightBlack: '#586e75',
      terminalBrightRed: '#cb4b16',
      terminalBrightGreen: '#586e75',
      terminalBrightYellow: '#657b83',
      terminalBrightBlue: '#839496',
      terminalBrightMagenta: '#6c71c4',
      terminalBrightCyan: '#93a1a1',
      terminalBrightWhite: '#fdf6e3'
    }
  }
};

export const themeNames = Object.keys(themes);
