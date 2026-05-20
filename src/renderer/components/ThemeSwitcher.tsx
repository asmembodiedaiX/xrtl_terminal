import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../styles/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, themeName, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeSelect = (name: string) => {
    setTheme(name);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          background: 'none',
          border: '1px solid var(--border-color)',
          borderRadius: 4,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: 12
        }}
        title="切换主题"
      >
        <span style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: currentTheme.colors.accent,
          border: '2px solid var(--border-color)'
        }} />
        <span>{currentTheme.name}</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 6,
          padding: 4,
          minWidth: 120,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {Object.entries(themes).map(([name, theme]) => (
            <div
              key={name}
              onClick={() => handleThemeSelect(name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: 4,
                backgroundColor: themeName === name ? 'var(--bg-tertiary)' : 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                if (themeName !== name) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (themeName !== name) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: theme.colors.accent,
                border: '2px solid var(--border-color)'
              }} />
              <span style={{ fontSize: 13 }}>{theme.name}</span>
              {themeName === name && (
                <span style={{ marginLeft: 'auto', color: 'var(--success-color)' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
