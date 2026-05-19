import React from 'react';
import { useTerminalStore } from '../stores/terminalStore';
import ContextMenu, { MenuItem } from './ContextMenu';

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: 'connected' | 'disconnected';
}

const servers: Server[] = [
  { id: '1', name: '192.168.1.30-server', host: '192.168.1.30', port: 22, username: 'root', status: 'connected' },
  { id: '2', name: '192.168.1.72', host: '192.168.1.72', port: 22, username: 'admin', status: 'disconnected' },
  { id: '3', name: 'example.com', host: 'example.com', port: 22, username: 'user', status: 'disconnected' },
  { id: '4', name: 'test-server.com', host: 'test-server.com', port: 22, username: 'ubuntu', status: 'disconnected' },
];

const Sidebar: React.FC = () => {
  const [activeView, setActiveView] = React.useState('servers');
  const [expanded, setExpanded] = React.useState(true);
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; server: Server | null } | null>(null);
  const { addSession } = useTerminalStore();

  const handleConnect = (server: Server) => {
    addSession({
      name: server.name,
      status: 'connecting',
      type: 'ssh',
      sshConfig: {
        host: server.host,
        port: server.port,
        username: server.username
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

  const handleContextMenuClick = (action: string, server: Server) => {
    switch (action) {
      case 'connect':
        handleConnect(server);
        break;
      case 'rename':
        const newName = prompt('请输入新名称:', server.name);
        if (newName) {
          const index = servers.findIndex(s => s.id === server.id);
          if (index !== -1) {
            servers[index].name = newName;
          }
        }
        break;
      case 'delete':
        if (confirm(`确定要删除服务器 "${server.name}" 吗？`)) {
          const index = servers.findIndex(s => s.id === server.id);
          if (index !== -1) {
            servers.splice(index, 1);
          }
        }
        break;
      case 'duplicate':
        const newServer: Server = {
          ...server,
          id: `server-${Date.now()}`,
          name: `${server.name} (副本)`,
          status: 'disconnected'
        };
        servers.push(newServer);
        break;
    }
  };

  const getContextMenuItems = (server: Server): MenuItem[] => [
    {
      id: 'new-folder',
      label: '新建目录',
      icon: '📁',
      onClick: () => handleContextMenuClick('new-folder', server)
    },
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
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#858585',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  ▼
                </button>
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
                      backgroundColor: server.status === 'connected' ? '#6a9955' : '#666666'
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
    </>
  );
};

export default Sidebar;
