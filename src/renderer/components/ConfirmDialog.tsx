import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case 'danger': return 'var(--danger-color)';
      case 'warning': return 'var(--warning-color)';
      case 'info': return 'var(--accent-color)';
      default: return 'var(--warning-color)';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger': return 'var(--danger-color)';
      case 'warning': return 'var(--warning-color)';
      case 'info': return 'var(--accent-color)';
      default: return 'var(--warning-color)';
    }
  };

  return (
    <div style={dialogOverlayStyle}>
      <div style={dialogStyle}>
        <div style={dialogHeaderStyle}>
          <span style={titleStyle}>{title}</span>
          <button onClick={onCancel} style={closeButtonStyle as any}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={contentStyle}>
          <div style={iconContainerStyle}>
            {type === 'danger' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M9 3h6l6 6v6l-6 6H9l-6-6V9l6-6z" stroke={getIconColor()} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {type === 'warning' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={getIconColor()} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {type === 'info' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke={getIconColor()} strokeWidth="1.5"/>
                <path d="M12 8v8M12 8h.01M12 16h.01" stroke={getIconColor()} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <p style={messageStyle}>{message}</p>
        </div>

        <div style={dialogFooterStyle}>
          <button onClick={onCancel} style={{ ...footerButtonStyle as any }}>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...footerButtonStyle as any,
              backgroundColor: getConfirmButtonColor(),
              color: '#ffffff'
            }}
          >
            {confirmText}
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
  width: 420,
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

const contentStyle: React.CSSProperties = {
  padding: 24,
  textAlign: 'center'
};

const iconContainerStyle: React.CSSProperties = {
  marginBottom: 16,
  display: 'flex',
  justifyContent: 'center'
};

const messageStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-primary)',
  margin: 0,
  lineHeight: 1.6
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

export default ConfirmDialog;