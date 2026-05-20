import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { ipcRenderer } from 'electron';
import { useTerminalStore, TerminalSession } from '../stores/terminalStore';

const TerminalPanel: React.FC = () => {
  const { sessions, activeSessionId, removeSession, setActiveSession, updateSessionStatus } = useTerminalStore();
  const terminalContainersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const terminalInstancesRef = useRef<Map<string, { terminal: Terminal; fitAddon: FitAddon }>>(new Map());
  const [fontSize, setFontSize] = useState(22);

  const createTerminalForSession = (session: TerminalSession, container: HTMLDivElement) => {
    if (terminalInstancesRef.current.has(session.id)) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: fontSize,
      fontFamily: '"JetBrains Mono Bold", "JetBrains Mono", "Fira Code", Consolas, monospace',
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

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());

    terminal.open(container);
    fitAddon.fit();

    terminalInstancesRef.current.set(session.id, { terminal, fitAddon });

    // Handle terminal input
    terminal.onData((data) => {
      ipcRenderer.send('ssh-send-data', { sessionId: session.id, data });
    });

    // Handle terminal resize
    const resizeObserver = new ResizeObserver(() => {
      if (terminalInstancesRef.current.has(session.id)) {
        const { fitAddon, terminal } = terminalInstancesRef.current.get(session.id)!;
        fitAddon.fit();
        const { cols, rows } = terminal;
        ipcRenderer.send('ssh-resize', { sessionId: session.id, cols, rows });
      }
    });

    resizeObserver.observe(container);

    // Handle mouse wheel zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -2 : 2;
        const newSize = Math.max(10, Math.min(72, fontSize + delta));
        if (newSize !== fontSize) {
          setFontSize(newSize);
          terminalInstancesRef.current.forEach(({ terminal, fitAddon }) => {
            terminal.options.fontSize = newSize;
            fitAddon.fit();
          });
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    // Connect to SSH if it's an SSH session and not already connected
    if (session.type === 'ssh' && session.status !== 'connected' && session.sshConfig) {
      connectToSSH(session);
    }
  };

  const connectToSSH = async (session: TerminalSession) => {
    if (!session.sshConfig) return;
    
    const terminal = terminalInstancesRef.current.get(session.id)?.terminal;
    if (!terminal) return;

    try {
      updateSessionStatus(session.id, 'connecting');
      await ipcRenderer.invoke('ssh-connect', {
        sessionId: session.id,
        config: session.sshConfig
      });
      updateSessionStatus(session.id, 'connected');

      // Setup data listener
      ipcRenderer.on(`ssh-data-${session.id}`, (_event, data) => {
        terminal.write(data);
      });

      // Setup close listener
      ipcRenderer.on(`ssh-close-${session.id}`, () => {
        updateSessionStatus(session.id, 'disconnected');
        terminal.write('\r\n[Connection closed]\r\n');
      });
    } catch (error: any) {
      updateSessionStatus(session.id, 'disconnected');
      terminal.write(`\r\n[Connection failed: ${error.message}]\r\n`);
    }
  };

  const setTerminalContainerRef = (sessionId: string, element: HTMLDivElement | null) => {
    if (element) {
      terminalContainersRef.current.set(sessionId, element);
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        createTerminalForSession(session, element);
      }
    }
  };

  const handleCloseSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    ipcRenderer.send('ssh-disconnect', { sessionId: id });
    
    const terminalInstance = terminalInstancesRef.current.get(id);
    if (terminalInstance) {
      terminalInstance.terminal.dispose();
    }
    
    terminalInstancesRef.current.delete(id);
    terminalContainersRef.current.delete(id);
    removeSession(id);
  };

  useEffect(() => {
    // Focus the active terminal when it changes
    if (activeSessionId && terminalInstancesRef.current.has(activeSessionId)) {
      const { terminal } = terminalInstancesRef.current.get(activeSessionId)!;
      setTimeout(() => {
        terminal.focus();
      }, 50);
    }
  }, [activeSessionId]);

  useEffect(() => {
    // Cleanup all listeners and terminals when component unmounts
    return () => {
      sessions.forEach(session => {
        ipcRenderer.removeAllListeners(`ssh-data-${session.id}`);
        ipcRenderer.removeAllListeners(`ssh-close-${session.id}`);
        ipcRenderer.send('ssh-disconnect', { sessionId: session.id });
      });

      terminalInstancesRef.current.forEach(({ terminal }) => {
        terminal.dispose();
      });
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{`
        @font-face {
          font-family: 'JetBrains Mono Bold';
          src: url('./fonts/ttf/JetBrainsMono-Bold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
        }

        @font-face {
          font-family: 'JetBrains Mono';
          src: url('./fonts/ttf/JetBrainsMono-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        /* Custom scrollbar for xterm */
        .xterm-viewport::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .xterm-viewport::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .xterm-viewport::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 5px;
        }

        .xterm-viewport::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }

        /* For Firefox */
        .xterm-viewport {
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) var(--bg-secondary);
        }
      `}</style>
      
      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        minHeight: 35
      }}>
        {sessions.map(session => (
          <div
            key={session.id}
            onClick={() => setActiveSession(session.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              backgroundColor: activeSessionId === session.id ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
              borderRight: '1px solid var(--border-color)',
              cursor: 'pointer',
              maxWidth: 200
            }}
          >
            <span style={{
              color: session.status === 'connected' ? 'var(--success-color)' :
                    session.status === 'connecting' ? 'var(--warning-color)' : 'var(--text-secondary)',
              marginRight: 6,
              fontSize: 12,
              animation: session.status === 'connected' ? 'breathing 2s ease-in-out infinite' : 'none'
            }}>
              ●
            </span>
            <span style={{
              color: 'var(--text-primary)',
              fontSize: 13,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {session.name}
            </span>
            <button
              onClick={(e) => handleCloseSession(e, session.id)}
              style={{
                marginLeft: 8,
                padding: 2,
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 14
              }}
              title="关闭会话"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Terminals Container */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', overflow: 'hidden', position: 'relative' }}>
        <style>{`
          @keyframes progressLine {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 100% 50%;
            }
          }

          /* Breathing animation for connected status */
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
        
        {/* 全局加载进度线 */}
        {activeSessionId && sessions.find(s => s.id === activeSessionId)?.status === 'connecting' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, var(--accent-color), var(--success-color), var(--accent-color))',
            backgroundSize: '200% 100%',
            animation: 'progressLine 1.5s ease-in-out infinite',
            zIndex: 100
          }} />
        )}
        
        {sessions.map(session => (
          <div
            key={session.id}
            ref={(el) => setTerminalContainerRef(session.id, el)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: activeSessionId === session.id ? 'block' : 'none',
              backgroundColor: 'var(--bg-primary)'
            }}
            tabIndex={0}
          />
        ))}
        
        {/* Empty State */}
        {sessions.length === 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
            fontSize: 14
          }}>
            从左侧选择或创建一个连接
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalPanel;
