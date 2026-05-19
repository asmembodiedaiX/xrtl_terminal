import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
}

export const MinimizeIcon: React.FC<IconProps> = ({ size = 10, color = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <path 
      d="M1 5H9" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

export const MaximizeIcon: React.FC<IconProps> = ({ size = 10, color = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <rect 
      x="1" 
      y="1" 
      width="8" 
      height="8" 
      stroke={color} 
      strokeWidth="1.5"
      rx="1"
    />
  </svg>
);

export const RestoreIcon: React.FC<IconProps> = ({ size = 10, color = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <rect 
      x="2" 
      y="2" 
      width="6" 
      height="6" 
      stroke={color} 
      strokeWidth="1.5"
      rx="1"
    />
    <path 
      d="M6 0L10 0L10 4" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect 
      x="6" 
      y="0" 
      width="3" 
      height="3" 
      stroke={color} 
      strokeWidth="1.5"
      rx="0.5"
    />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 10, color = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <path 
      d="M1 1L9 9M9 1L1 9" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

interface WindowButtonProps {
  type: 'minimize' | 'maximize' | 'restore' | 'close';
  isHovered: boolean;
  isPressed: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const buttonStyles: Record<string, { default: string; hover: string; pressed: string }> = {
  minimize: {
    default: '#37373d',
    hover: '#4a4a4f',
    pressed: '#6e6e76'
  },
  maximize: {
    default: '#37373d',
    hover: '#4a4a4f',
    pressed: '#6e6e76'
  },
  restore: {
    default: '#37373d',
    hover: '#4a4a4f',
    pressed: '#6e6e76'
  },
  close: {
    default: '#e64759',
    hover: '#f1707a',
    pressed: '#ff7b86'
  }
};

export const WindowButton: React.FC<WindowButtonProps> = ({ type, isHovered, isPressed, onClick, onMouseEnter, onMouseLeave }) => {
  const colors = buttonStyles[type];
  let bgColor = colors.default;
  
  if (isPressed) {
    bgColor = colors.pressed;
  } else if (isHovered) {
    bgColor = colors.hover;
  }

  const renderIcon = () => {
    switch (type) {
      case 'minimize':
        return <MinimizeIcon />;
      case 'maximize':
        return <MaximizeIcon />;
      case 'restore':
        return <RestoreIcon />;
      case 'close':
        return <CloseIcon />;
      default:
        return null;
    }
  };

  const buttonStyle: any = {
    width: 46,
    height: 32,
    background: bgColor,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.1s ease',
    WebkitAppRegion: 'no-drag'
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={buttonStyle}
    >
      {renderIcon()}
    </button>
  );
};
