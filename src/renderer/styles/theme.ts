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
      danger: '#f14c4c'
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
      danger: '#e81123'
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
      danger: '#ff6b6b'
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
      danger: '#e57373'
    }
  }
};

export const themeNames = Object.keys(themes);
