import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  menuItems: MenuItem[];
}

export type MenuItem = (
  | {
      id: string;
      label: string;
      icon?: string;
      shortcut?: string;
      disabled?: boolean;
      divider?: false;
      onClick: () => void;
    }
  | {
      id: string;
      divider: true;
      onClick?: never;
    }
);

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, menuItems }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        backgroundColor: '#2d2d30',
        border: '1px solid #3c3c3c',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        padding: 4,
        minWidth: 160,
        zIndex: 1000
      }}
    >
      {menuItems.map((item) => {
        if (item.divider) {
          return (
            <div
              key={item.id}
              style={{
                height: 1,
                backgroundColor: '#3c3c3c',
                margin: '4px 0',
              }}
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 2,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              color: item.disabled ? '#666666' : '#cccccc',
              fontSize: 12,
              textAlign: 'left',
              transition: 'background-color 0.15s',
              gap: 8
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = '#3c3c3c';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </span>
            {item.shortcut && (
              <span style={{ color: '#858585', fontSize: 11 }}>
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
