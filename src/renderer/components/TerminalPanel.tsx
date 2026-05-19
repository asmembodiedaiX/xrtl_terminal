import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { useTerminalStore } from '../stores/terminalStore';

const TerminalPanel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon>(new FitAddon());
  const { sessions, activeSessionId } = useTerminalStore();
  const [showConnectForm, setShowConnectForm] = useState(true);
  const [formData, setFormData] = useState({
    hostname: '',
    port: '22',
    username: '',
    password: '',
    privateKey: '',
    useKey: false
  });

  useEffect(() => {
    if (!containerRef.current) return;

    if (!terminalRef.current) {
      terminalRef.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#aeafad',
          cursorAccent: '#000000',
          black: '#000000',
          red: '#f14c4c',
          green: '#6a9955',
          yellow: '#dcdcaa',
          blue: '#569cd6',
          magenta: '#c586c0',
          cyan: '#4ec9b0',
          white: '#d4d4d4',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#6a9955',
          brightYellow: '#dcdcaa',
          brightBlue: '#569cd6',
          brightMagenta: '#c586c0',
          brightCyan: '#4ec9b0',
          brightWhite: '#ffffff'
        }
      });

      terminalRef.current.loadAddon(fitAddonRef.current);
      terminalRef.current.loadAddon(new WebLinksAddon());
      terminalRef.current.open(containerRef.current);
      fitAddonRef.current.fit();

      terminalRef.current.writeln('Welcome to XRTL Terminal!');
      terminalRef.current.writeln('Type "help" for available commands.');
      terminalRef.current.write('$ ');
    }

    const handleResize = () => {
      fitAddonRef.current.fit();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConnectForm(false);
  };

  if (showConnectForm && sessions.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e1e1e'
      }}>
        <div style={{
          width: 400,
          backgroundColor: '#252526',
          borderRadius: 8,
          padding: 24,
          border: '1px solid #3c3c3c'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 20,
            color: '#569cd6',
            fontSize: 18,
            fontWeight: 600
          }}>
            新建连接
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                color: '#858585',
                fontSize: 12,
                marginBottom: 4
              }}>
                主机名称
              </label>
              <input
                type="text"
                value={formData.hostname}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3c3c3c',
                  borderRadius: 4,
                  color: '#cccccc',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
                placeholder="hostname"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#858585',
                fontSize: 12,
                marginBottom: 4
              }}>
                端口
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3c3c3c',
                  borderRadius: 4,
                  color: '#cccccc',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
                placeholder="22"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#858585',
                fontSize: 12,
                marginBottom: 4
              }}>
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3c3c3c',
                  borderRadius: 4,
                  color: '#cccccc',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
                placeholder="username"
              />
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#858585',
                fontSize: 12,
                marginBottom: 4,
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.useKey}
                  onChange={(e) => setFormData({ ...formData, useKey: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                使用密钥登录
              </label>
            </div>

            {formData.useKey ? (
              <div>
                <label style={{
                  display: 'block',
                  color: '#858585',
                  fontSize: 12,
                  marginBottom: 4
                }}>
                  私钥路径
                </label>
                <input
                  type="text"
                  value={formData.privateKey}
                  onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #3c3c3c',
                    borderRadius: 4,
                    color: '#cccccc',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                  placeholder="~/.ssh/id_rsa"
                />
              </div>
            ) : (
              <div>
                <label style={{
                  display: 'block',
                  color: '#858585',
                  fontSize: 12,
                  marginBottom: 4
                }}>
                  密码
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #3c3c3c',
                    borderRadius: 4,
                    color: '#cccccc',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                  placeholder="password"
                />
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: 8,
                padding: '10px',
                backgroundColor: '#007acc',
                border: 'none',
                borderRadius: 4,
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              连接到服务器
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={{ 
        flex: 1, 
        backgroundColor: '#1e1e1e',
        minHeight: 0
      }} 
    />
  );
};

export default TerminalPanel;
