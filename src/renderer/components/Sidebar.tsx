import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { useTerminalStore } from '../stores/terminalStore';
import ContextMenu, { MenuItem } from './ContextMenu';
import SSHConfigDialog, { SSHConfig } from './SSHConfigDialog';
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
  const [expanded, setExpanded] = React.useState(true);
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; server: Server | null } | null>(null);
  const [showConfigDialog, setShowConfigDialog] = React.useState(false);
  const [editingConfig, setEditingConfig] = React.useState<SSHConfig | null>(null);
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const { addSession } = useTerminalStore();

  useEffect(() => {
    loadServers();
  }, []);

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
        const newName = prompt('请输入新名称:', server.name);
        if (newName) {
          const updatedServer = { ...server, name: newName };
          await saveServer(updatedServer);
        }
        break;
      case 'delete':
        if (confirm(`确定要删除服务器 "${server.name}" 吗？`)) {
          await deleteServer(server.id);
        }
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
      const result = await ipcRenderer.invoke('save-ssh-config', config);
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
    {
      id: 'new-folder',
      label: '新建目录',
      icon: '📁',
      onClick: () => handleContextMenuClick('new-folder', server)
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
    },
    { id: 'divider2', divider: true },
    {
      id: 'cut',
      label: '剪切',
      icon: '✂️',
      onClick: () => handleContextMenuClick('cut', server)
    },
    {
      id: 'paste',
      label: '粘贴',
      icon: '📥',
      onClick: () => handleContextMenuClick('paste', server)
    },
    { id: 'divider3', divider: true },
    {
      id: 'refresh',
      label: '刷新',
      icon: '🔄',
      onClick: () => handleContextMenuClick('refresh', server)
    },
    { id: 'divider4', divider: true },
    {
      id: 'import',
      label: '导入',
      icon: '📥',
      onClick: () => handleContextMenuClick('import', server)
    },
    {
      id: 'export',
      label: '导出',
      icon: '📤',
      onClick: () => handleContextMenuClick('export', server)
    }
  ];

  const menuItems = [
    { id: 'servers', icon: '📁', label: '服务器列表' },
    { id: 'sessions', icon: '🖥️', label: '会话管理' },
    { id: 'settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <>
      <div style={{
        width: expanded ? 220 : 48,
        backgroundColor: '#252526',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #3c3c3c',
        transition: 'width 0.2s'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderBottom: '1px solid #3c3c3c'
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
                backgroundColor: activeView === item.id ? '#3c3c3c' : 'transparent',
                color: activeView === item.id ? '#569cd6' : '#858585',
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

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {expanded && (
            <div style={{ padding: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                padding: '4px 8px',
                color: '#858585',
                fontSize: 12
              }}>
                <span>服务器列表</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => {
                      setEditingConfig(null);
                      setShowConfigDialog(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#858585',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: '2px 4px'
                    }}
                    title="新建连接"
                  >
                    ➕
                  </button>
                  <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#858585',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: '2px 4px'
                    }}
                  >
                    ▼
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {servers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => handleConnect(server)}
                    onContextMenu={(e) => handleContextMenu(e, server)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px',
                      backgroundColor: server.status === 'connected' ? '#094771' : '#2d2d30',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: server.colorTag || (server.status === 'connected' ? '#6a9955' : '#666666')
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#cccccc', fontSize: 13 }}>{server.name}</div>
                      <div style={{ color: '#858585', fontSize: 11 }}>{server.username}@{server.host}:{server.port}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!expanded && (
            <div style={{ padding: '8px' }}>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#2d2d30',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: '#858585',
                  fontSize: 12
                }}
              >
                ► 展开
              </button>
            </div>
          )}
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
    </>
  );
};

export default Sidebar;