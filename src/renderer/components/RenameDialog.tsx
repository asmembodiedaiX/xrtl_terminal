import React, { useEffect, useRef } from 'react';

interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

const RenameDialog: React.FC<RenameDialogProps> = ({
  isOpen,
  currentName,
  onConfirm,
  onCancel
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = React.useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, currentName]);

  const handleConfirm = () => {
    if (newName.trim()) {
      onConfirm(newName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={dialogOverlayStyle}>
      <div style={dialogStyle}>
        <div style={dialogHeaderStyle}>
          <span style={titleStyle}>重命名服务器</span>
          <button onClick={onCancel} style={closeButtonStyle as any}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={contentStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>新名称</label>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle as any}
              placeholder="输入新名称"
            />
          </div>
        </div>

        <div style={dialogFooterStyle}>
          <button onClick={onCancel} style={{ ...footerButtonStyle as any }}>
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...footerButtonStyle as any,
              backgroundColor: 'var(--accent-color)',
              color: '#ffffff'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const dialogOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const dialogStyle: React.CSSProperties = {
  width: 400,
  backgroundColor: 'var(--bg-primary)',
  borderRadius: 8,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const dialogHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)'
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--text-primary)'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  borderRadius: 4,
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: 'var(--bg-tertiary)'
  }
};

const contentStyle = {
  padding: 20
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary)'
};

const inputStyle = {
  padding: '8px 12px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.15s',
  ':focus': {
    borderColor: 'var(--accent-color)'
  }
};

const dialogFooterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 12,
  padding: '12px 16px',
  borderTop: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)'
};

const footerButtonStyle = {
  padding: '6px 16px',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  borderRadius: 4,
  color: 'var(--text-secondary)',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    borderColor: 'var(--text-secondary)'
  }
};

export default RenameDialog;