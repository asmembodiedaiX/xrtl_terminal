import React from 'react';
import { ipcRenderer } from 'electron';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';

const Header: React.FC = () => {
  const headerStyle: any = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '0 12px',
    WebkitAppRegion: 'drag',
    cursor: 'default',
    zIndex: 1000,
    position: 'relative'
  };

  const windowControlStyle: any = {
    WebkitAppRegion: 'no-drag',
    display: 'flex',
    alignItems: 'center',
    gap: 0
  };

  const controlButtonStyle = {
    width: 46,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: 12,
    transition: 'background-color 0.1s'
  };

  const handleMinimize = () => {
    ipcRenderer.send('window-minimize');
  };

  const handleMaximize = () => {
    ipcRenderer.send('window-maximize');
  };

  const handleClose = () => {
    ipcRenderer.send('window-close');
  };

  return (
    <div style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Logo size={24} />
        <span style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 'bold' }}>XRTL Terminal</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, WebkitAppRegion: 'no-drag' } as any}>
        <ThemeSwitcher />

        <div style={windowControlStyle}>
          <button
            style={controlButtonStyle}
            onClick={handleMinimize}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="最小化"
          >
            −
          </button>
          <button
            style={controlButtonStyle}
            onClick={handleMaximize}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="最大化"
          >
            □
          </button>
          <button
            style={{
              ...controlButtonStyle,
              color: '#ffffff'
            }}
            onClick={handleClose}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e81123'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="关闭"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;