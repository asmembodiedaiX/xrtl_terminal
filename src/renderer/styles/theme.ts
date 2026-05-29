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
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
      bgTertiary: '#2d2d30',
      border: '#3c3c3c',
      textPrimary: '#cccccc',
      textSecondary: '#858585',
      accent: '#007acc',
      success: '#6a9955',
      warning: '#dcdcaa',
      danger: '#f14c4c',
      // Terminal colors
      terminalBg: 'transparent',
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
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
      bgTertiary: '#e8e8e8',
      border: '#d4d4d4',
      textPrimary: '#333333',
      textSecondary: '#666666',
      accent: '#0078d4',
      success: '#107c10',
      warning: '#795e26',
      danger: '#e81123',
      // Terminal colors
      terminalBg: 'transparent',
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
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
      bgTertiary: '#0f3460',
      border: '#e94560',
      textPrimary: '#eaeaea',
      textSecondary: '#a0a0a0',
      accent: '#e94560',
      success: '#4ecca3',
      warning: '#ffc107',
      danger: '#ff6b6b',
      // Terminal colors
      terminalBg: 'transparent',
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
    },
    background: {
      image: './由内而外2字符海报超宽m.jpg',
      blur: 0,
      opacity: 1,
      brightness: 1
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
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
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
      image: './default.jpg',
      blur: 0,
      opacity: 1,
      brightness: 1
    }
  },
  orange: {
    name: '橙色',
    colors: {
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
      bgTertiary: '#4d3316',
      border: '#ea580c',
      textPrimary: '#fed7aa',
      textSecondary: '#fdba74',
      accent: '#fb923c',
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#f87171',
      // Terminal colors
      terminalBg: 'transparent',
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
    },
    background: {
      image: './珍妮K-pop3840_2160.jpg',
      blur: 0,
      opacity: 1,
      brightness: 1
    }
  },
  nord: {
    name: 'Nord',
    colors: {
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
      bgTertiary: '#434c5e',
      border: '#4c566a',
      textPrimary: '#d8dee9',
      textSecondary: '#8fbcbb',
      accent: '#88c0d0',
      success: '#a3be8c',
      warning: '#ebcb8b',
      danger: '#bf616a',
      // Terminal colors
      terminalBg: 'transparent',
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
      image: './default2.jpg',
      blur: 0,
      opacity: 1,
      brightness: 1
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
  },
  dracula: {
    name: 'Dracula',
    colors: {
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
      bgTertiary: '#282a36',
      border: '#44475a',
      textPrimary: '#f8f8f2',
      textSecondary: '#6272a4',
      accent: '#bd93f9',
      success: '#50fa7b',
      warning: '#f1fa8c',
      danger: '#ff5555',
      // Terminal colors
      terminalBg: 'transparent',
      terminalFg: '#f8f8f2',
      terminalCursor: '#bd93f9',
      terminalCursorAccent: '#000000',
      terminalBlack: '#21222c',
      terminalRed: '#ff5555',
      terminalGreen: '#50fa7b',
      terminalYellow: '#f1fa8c',
      terminalBlue: '#bd93f9',
      terminalMagenta: '#ff79c6',
      terminalCyan: '#8be9fd',
      terminalWhite: '#f8f8f2',
      terminalBrightBlack: '#6272a4',
      terminalBrightRed: '#ff6e6e',
      terminalBrightGreen: '#69ff94',
      terminalBrightYellow: '#ffffa5',
      terminalBrightBlue: '#d6acff',
      terminalBrightMagenta: '#ff92df',
      terminalBrightCyan: '#a4ffff',
      terminalBrightWhite: '#ffffff'
    },
    background: {
      image: './default.jpg',
      blur: 0,
      opacity: 1,
      brightness: 1
    }
  },
  monokai: {
    name: 'Monokai',
    colors: {
      bgPrimary: '#272822',
      bgSecondary: '#2e2f29',
      bgTertiary: '#3e3d32',
      border: '#75715e',
      textPrimary: '#f8f8f2',
      textSecondary: '#cfcfc2',
      accent: '#a6e22e',
      success: '#a6e22e',
      warning: '#f4bf75',
      danger: '#f92672',
      // Terminal colors
      terminalBg: '#272822',
      terminalFg: '#f8f8f2',
      terminalCursor: '#f92672',
      terminalCursorAccent: '#000000',
      terminalBlack: '#272822',
      terminalRed: '#f92672',
      terminalGreen: '#a6e22e',
      terminalYellow: '#f4bf75',
      terminalBlue: '#66d9ef',
      terminalMagenta: '#ae81ff',
      terminalCyan: '#a1efe4',
      terminalWhite: '#f8f8f2',
      terminalBrightBlack: '#75715e',
      terminalBrightRed: '#f92672',
      terminalBrightGreen: '#a6e22e',
      terminalBrightYellow: '#f4bf75',
      terminalBrightBlue: '#66d9ef',
      terminalBrightMagenta: '#ae81ff',
      terminalBrightCyan: '#a1efe4',
      terminalBrightWhite: '#f9f8f5'
    }
  },
  tokyoNight: {
    name: 'Tokyo Night',
    colors: {
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
      bgTertiary: '#1a1b26',
      border: '#414868',
      textPrimary: '#c0caf5',
      textSecondary: '#565f89',
      accent: '#7aa2f7',
      success: '#9ece6a',
      warning: '#e0af68',
      danger: '#f7768e',
      // Terminal colors
      terminalBg: 'transparent',
      terminalFg: '#c0caf5',
      terminalCursor: '#7aa2f7',
      terminalCursorAccent: '#000000',
      terminalBlack: '#15161e',
      terminalRed: '#f7768e',
      terminalGreen: '#9ece6a',
      terminalYellow: '#e0af68',
      terminalBlue: '#7aa2f7',
      terminalMagenta: '#bb9af7',
      terminalCyan: '#7dcfff',
      terminalWhite: '#a9b1d6',
      terminalBrightBlack: '#414868',
      terminalBrightRed: '#f7768e',
      terminalBrightGreen: '#9ece6a',
      terminalBrightYellow: '#e0af68',
      terminalBrightBlue: '#7aa2f7',
      terminalBrightMagenta: '#bb9af7',
      terminalBrightCyan: '#7dcfff',
      terminalBrightWhite: '#c0caf5'
    },
    background: {
      image: './default2.jpg',
      blur: 0,
      opacity: 1,
      brightness: 1
    }
  },
  gruvbox: {
    name: 'Gruvbox',
    colors: {
      bgPrimary: '#282828',
      bgSecondary: '#32302f',
      bgTertiary: '#3c3836',
      border: '#504945',
      textPrimary: '#ebdbb2',
      textSecondary: '#a89984',
      accent: '#d79921',
      success: '#98971a',
      warning: '#d79921',
      danger: '#cc241d',
      // Terminal colors
      terminalBg: '#282828',
      terminalFg: '#ebdbb2',
      terminalCursor: '#d79921',
      terminalCursorAccent: '#000000',
      terminalBlack: '#282828',
      terminalRed: '#cc241d',
      terminalGreen: '#98971a',
      terminalYellow: '#d79921',
      terminalBlue: '#458588',
      terminalMagenta: '#b16286',
      terminalCyan: '#689d6a',
      terminalWhite: '#a89984',
      terminalBrightBlack: '#928374',
      terminalBrightRed: '#fb4934',
      terminalBrightGreen: '#b8bb26',
      terminalBrightYellow: '#fabd2f',
      terminalBrightBlue: '#83a598',
      terminalBrightMagenta: '#d3869b',
      terminalBrightCyan: '#8ec07c',
      terminalBrightWhite: '#ebdbb2'
    }
  },
  catppuccin: {
    name: 'Catppuccin',
    colors: {
      bgPrimary: 'transparent',
      bgSecondary: 'transparent',
      bgTertiary: '#1e1e2e',
      border: '#45475a',
      textPrimary: '#cdd6f4',
      textSecondary: '#a6adc8',
      accent: '#cba6f7',
      success: '#a6e3a1',
      warning: '#f9e2af',
      danger: '#f38ba8',
      // Terminal colors
      terminalBg: 'transparent',
      terminalFg: '#cdd6f4',
      terminalCursor: '#cba6f7',
      terminalCursorAccent: '#000000',
      terminalBlack: '#11111b',
      terminalRed: '#f38ba8',
      terminalGreen: '#a6e3a1',
      terminalYellow: '#f9e2af',
      terminalBlue: '#89b4fa',
      terminalMagenta: '#f5c2e7',
      terminalCyan: '#94e2d5',
      terminalWhite: '#cdd6f4',
      terminalBrightBlack: '#45475a',
      terminalBrightRed: '#f38ba8',
      terminalBrightGreen: '#a6e3a1',
      terminalBrightYellow: '#f9e2af',
      terminalBrightBlue: '#89b4fa',
      terminalBrightMagenta: '#f5c2e7',
      terminalBrightCyan: '#94e2d5',
      terminalBrightWhite: '#ffffff'
    },
    background: {
      image: './由内而外2字符海报超宽m.jpg',
      blur: 0,
      opacity: 1,
      brightness: 1
    }
  }
};

export const themeNames = Object.keys(themes);
