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
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
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
                backgroundColor: 'var(--border-color)',
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
              color: item.disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
              fontSize: 12,
              textAlign: 'left',
              transition: 'background-color 0.15s',
              gap: 8
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
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
              <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
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