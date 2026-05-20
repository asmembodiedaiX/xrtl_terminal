import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { useTerminalStore } from '../stores/terminalStore';
import ContextMenu, { MenuItem } from './ContextMenu';
import SSHConfigDialog, { SSHConfig } from './SSHConfigDialog';
import ConfirmDialog from './ConfirmDialog';
import RenameDialog from './RenameDialog';
import { ToastContainer, Toast } from './Toast';

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: 'connected' | 'disconnected';
  colorTag?: string;
  environment?: string;
  remarks?: string;
  password?: string;
}

const Sidebar: React.FC = () => {
  const [activeView, setActiveView] = React.useState('servers');
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; server: Server | null } | null>(null);
  const [showConfigDialog, setShowConfigDialog] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [renameDialogData, setRenameDialogData] = React.useState<{
    server: Server;
  } | null>(null);
  const [newServerName, setNewServerName] = React.useState('');
  const [confirmDialogData, setConfirmDialogData] = React.useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);
  const [editingConfig, setEditingConfig] = React.useState<SSHConfig | null>(null);
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const { addSession, sessions } = useTerminalStore();

  useEffect(() => {
    loadServers();
  }, []);

  useEffect(() => {
    // 同步服务器状态与终端会话状态
    setServers(prevServers => 
      prevServers.map(server => {
        // 查找是否有同名的已连接会话
        const connectedSession = sessions.find(
          s => s.name === server.name && s.status === 'connected'
        );
        return {
          ...server,
          status: connectedSession ? 'connected' : 'disconnected'
        };
      })
    );
  }, [sessions]);

  const loadServers = async () => {
    try {
      const result = await ipcRenderer.invoke('load-all-ssh-configs');
      if (result.success) {
        const loadedServers: Server[] = result.configs.map((config: any) => ({
          id: config.id,
          name: config.name,
          host: config.host,
          port: config.port,
          username: config.user,
          status: 'disconnected' as const,
          colorTag: config.colorTag,
          environment: config.environment,
          remarks: config.remarks,
          password: config.password
        }));
        setServers(loadedServers);
      } else {
        showToast('加载配置失败: ' + result.error, 'error');
      }
    } catch (error: any) {
      showToast('加载配置失败: ' + error.message, 'error');
    }
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmDialogData({ title, message, onConfirm, type });
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmDialogData?.onConfirm) {
      confirmDialogData.onConfirm();
    }
    setShowConfirmDialog(false);
    setConfirmDialogData(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setConfirmDialogData(null);
  };

  const openRenameDialog = (server: Server) => {
    setRenameDialogData({ server });
    setNewServerName(server.name);
    setShowRenameDialog(true);
  };

  const handleRenameConfirm = async () => {
    if (renameDialogData && newServerName.trim()) {
      const updatedServer = { ...renameDialogData.server, name: newServerName.trim() };
      await saveServer(updatedServer);
    }
    setShowRenameDialog(false);
    setRenameDialogData(null);
    setNewServerName('');
  };

  const handleRenameCancel = () => {
    setShowRenameDialog(false);
    setRenameDialogData(null);
    setNewServerName('');
  };

  const showToast = (message: string, type: Toast['type']) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleConnect = (server: Server) => {
    addSession({
      name: server.name,
      status: 'connecting',
      type: 'ssh',
      sshConfig: {
        host: server.host,
        port: server.port,
        username: server.username,
        password: server.password
      }
    });
  };

  const handleContextMenu = (event: React.MouseEvent, server: Server) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      server
    });
  };

  const handleContextMenuClick = async (action: string, server: Server) => {
    switch (action) {
      case 'connect':
        handleConnect(server);
        break;
      case 'new-connection':
        setEditingConfig(null);
        setShowConfigDialog(true);
        break;
      case 'rename':
        openRenameDialog(server);
        break;
      case 'delete':
        showConfirm(
          '删除服务器',
          `确定要删除服务器 "${server.name}" 吗？此操作不可撤销。`,
          async () => {
            await deleteServer(server.id);
          },
          'danger'
        );
        break;
      case 'duplicate':
        const newServer: Server = {
          ...server,
          id: `server-${Date.now()}`,
          name: `${server.name} (副本)`,
          status: 'disconnected'
        };
        await saveServer(newServer);
        break;
      case 'edit':
        setEditingConfig({
          id: server.id,
          name: server.name,
          host: server.host,
          user: server.username,
          port: server.port,
          authMethod: server.password ? 'password' : 'agent',
          colorTag: server.colorTag || '#3498db',
          environment: server.environment || '无',
          remarks: server.remarks || '',
          mfaEnabled: false,
          password: server.password
        });
        setShowConfigDialog(true);
        break;
    }
  };

  const saveServer = async (server: Server) => {
    try {
      const config: SSHConfig = {
        id: server.id,
        name: server.name,
        host: server.host,
        user: server.username,
        port: server.port,
        authMethod: server.password ? 'password' : 'agent',
        colorTag: server.colorTag || '#3498db',
        environment: server.environment || '无',
        remarks: server.remarks || '',
        mfaEnabled: false,
        password: server.password
      };
      const result = await ipcRenderer.invoke('save-ssh-config', config);
      if (result.success) {
        await loadServers();
      } else {
        showToast('保存失败: ' + result.error, 'error');
      }
    } catch (error: any) {
      showToast('保存失败: ' + error.message, 'error');
    }
  };

  const deleteServer = async (id: string) => {
    try {
      const result = await ipcRenderer.invoke('delete-ssh-config', id);
      if (result.success) {
        await loadServers();
      } else {
        showToast('删除失败: ' + result.error, 'error');
      }
    } catch (error: any) {
      showToast('删除失败: ' + error.message, 'error');
    }
  };

  const handleSaveConfig = async (config: SSHConfig) => {
    try {
      // 如果是新建连接，生成唯一 ID
      const configWithId = config.id ? config : {
        ...config,
        id: `server-${Date.now()}`
      };
      const result = await ipcRenderer.invoke('save-ssh-config', configWithId);
      if (result.success) {
        showToast('配置已保存', 'success');
        await loadServers();
      } else {
        showToast('保存失败: ' + result.error, 'error');
      }
    } catch (error: any) {
      showToast('保存失败: ' + error.message, 'error');
    }
  };

  const getContextMenuItems = (server: Server): MenuItem[] => [
    {
      id: 'new-connection',
      label: '新建连接',
      icon: '➕',
      onClick: () => handleContextMenuClick('new-connection', server)
    },
    { id: 'divider1', divider: true },
    {
      id: 'connect',
      label: '连接',
      icon: '🔌',
      disabled: server.status === 'connected',
      onClick: () => handleContextMenuClick('connect', server)
    },
    {
      id: 'edit',
      label: '编辑',
      icon: '✏️',
      onClick: () => handleContextMenuClick('edit', server)
    },
    {
      id: 'delete',
      label: '删除',
      icon: '🗑️',
      onClick: () => handleContextMenuClick('delete', server)
    },
    {
      id: 'rename',
      label: '重命名',
      icon: '✏️',
      onClick: () => handleContextMenuClick('rename', server)
    },
    {
      id: 'duplicate',
      label: '复制',
      icon: '📋',
      onClick: () => handleContextMenuClick('duplicate', server)
    }
  ];

  const menuItems = [
    { id: 'servers', icon: '📁', label: '服务器列表' },
    { id: 'sessions', icon: '🖥️', label: '会话管理' },
    { id: 'settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <>
      <style>{`
        @keyframes breathing {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.85);
          }
        }
      `}</style>
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 4,
                border: 'none',
                backgroundColor: activeView === item.id ? 'var(--bg-tertiary)' : 'transparent',
                color: activeView === item.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              title={item.label}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
            padding: '4px 8px',
            color: 'var(--text-secondary)',
            fontSize: 12
          }}>
            <span>服务器列表</span>
            <button
              onClick={() => {
                setEditingConfig(null);
                setShowConfigDialog(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 14,
                padding: '2px 4px'
              }}
              title="新建连接"
            >
              ➕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {servers.map((server) => (
              <button
                key={server.id}
                onDoubleClick={() => handleConnect(server)}
                onContextMenu={(e) => handleContextMenu(e, server)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px',
                  backgroundColor: server.status === 'connected' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: server.status === 'connected' ? 'var(--success-color)' : (server.colorTag || 'var(--text-secondary)'),
                  animation: server.status === 'connected' ? 'breathing 2s ease-in-out infinite' : 'none'
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {server.name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {server.username}@{server.host}:{server.port}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          menuItems={contextMenu.server ? getContextMenuItems(contextMenu.server) : []}
        />
      )}

      <SSHConfigDialog
        isOpen={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        onSave={handleSaveConfig}
        onShowToast={showToast}
        config={editingConfig}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={confirmDialogData?.title || ''}
        message={confirmDialogData?.message || ''}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
        confirmText="删除"
        cancelText="取消"
        type={confirmDialogData?.type}
      />

      <RenameDialog
        isOpen={showRenameDialog}
        currentName={renameDialogData?.server.name || ''}
        onConfirm={handleRenameConfirm}
        onCancel={handleRenameCancel}
      />
    </>
  );
};

export default Sidebar;