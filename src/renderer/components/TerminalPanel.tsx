import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { ipcRenderer } from 'electron';
import { useTerminalStore, TerminalSession } from '../stores/terminalStore';
import FileBrowser from './FileBrowser';
import FileTransferManager from './FileTransferManager';
import { useTheme } from '../styles/ThemeContext';

const TerminalPanel: React.FC = () => {
  const { sessions, activeSessionId, removeSession, setActiveSession, updateSessionStatus, updateSessionPath, reorderSessions } = useTerminalStore();
  const { currentTheme } = useTheme();
  const terminalContainersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const terminalInstancesRef = useRef<Map<string, { terminal: Terminal; fitAddon: FitAddon }>>(new Map());
  const lastKnownPathRef = useRef<Map<string, string>>(new Map());
  const enterPressCountRef = useRef<Map<string, number>>(new Map());
  const enterPressTimerRef = useRef<Map<string, number>>(new Map());
  const sessionsRef = useRef(sessions);
  
  // 拖拽排序相关状态
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Keep sessionsRef updated with latest sessions
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);
  
  const [fontSize, setFontSize] = useState(22);
  const [transferTasks, setTransferTasks] = useState<any[]>([]);
  const [showTransferManager, setShowTransferManager] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(true);

  // 从当前主题获取终端颜色配置
  const getTerminalThemeFromContext = () => {
    const colors = currentTheme.colors;
    return {
      background: 'rgba(0, 0, 0, 0.3)',  // 强制透明，显示背景图片
      foreground: colors.terminalFg,
      cursor: colors.terminalCursor,
      cursorAccent: colors.terminalCursorAccent,
      black: colors.terminalBlack,
      red: colors.terminalRed,
      green: colors.terminalGreen,
      yellow: colors.terminalYellow,
      blue: colors.terminalBlue,
      magenta: colors.terminalMagenta,
      cyan: colors.terminalCyan,
      white: colors.terminalWhite,
      brightBlack: colors.terminalBrightBlack,
      brightRed: colors.terminalBrightRed,
      brightGreen: colors.terminalBrightGreen,
      brightYellow: colors.terminalBrightYellow,
      brightBlue: colors.terminalBrightBlue,
      brightMagenta: colors.terminalBrightMagenta,
      brightCyan: colors.terminalBrightCyan,
      brightWhite: colors.terminalBrightWhite
    };
  };

  // 更新所有终端的主题颜色
  const updateAllTerminalThemes = () => {
    const newTheme = getTerminalThemeFromContext();
    terminalInstancesRef.current.forEach(({ terminal, fitAddon }) => {
      // 直接修改主题选项
      terminal.options.theme = { ...newTheme };
      // 触发重绘：通过调用 fit() 来强制刷新终端显示
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('Failed to refresh terminal:', e);
      }
    });
  };

  // 监听主题变化，实时更新终端颜色
  useEffect(() => {
    updateAllTerminalThemes();
  }, [currentTheme]);

  const addTransferTask = (task: any) => {
    setTransferTasks(prev => [...prev, task]);
  };

  const updateTransferTask = (taskId: string, updates: any) => {
    setTransferTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTransferTask = (taskId: string) => {
    setTransferTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const createTerminalForSession = (session: TerminalSession, container: HTMLDivElement) => {
    if (terminalInstancesRef.current.has(session.id)) {
      return;
    }

    // 获取当前主题的终端颜色
    const terminalTheme = getTerminalThemeFromContext();

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: fontSize,
      fontFamily: '"JetBrains Mono Bold", "JetBrains Mono", "Fira Code", Consolas, monospace',
      theme: terminalTheme
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());

    terminal.open(container);
    fitAddon.fit();

    terminalInstancesRef.current.set(session.id, { terminal, fitAddon });

    // Handle terminal input (sending data to remote server)
    terminal.onData((data: string) => {
      // Check if session is disconnected and handle double Enter for reconnect
      // Use sessionsRef to get the latest state, not the closure-captured sessions
      const currentSession = sessionsRef.current.find(s => s.id === session.id);
      const currentStatus = currentSession?.status;
      
      if (currentStatus === 'disconnected' && (data.includes('\r') || data.includes('\n'))) {
        // Handle double Enter press for reconnect
        const currentCount = enterPressCountRef.current.get(session.id) || 0;
        const newCount = currentCount + 1;
        enterPressCountRef.current.set(session.id, newCount);
        
        // Clear previous timer if exists
        const existingTimer = enterPressTimerRef.current.get(session.id);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        
        if (newCount >= 2) {
          // Double Enter pressed - reconnect
          enterPressCountRef.current.set(session.id, 0);
          terminal.write('\r\n正在重连...\r\n');
          // Use the latest session config for reconnection
          if (currentSession) {
            connectToSSH(currentSession);
          }
        } else {
          // Set timer to reset count after 2 seconds
          const timer = window.setTimeout(() => {
            enterPressCountRef.current.set(session.id, 0);
          }, 2000);
          enterPressTimerRef.current.set(session.id, timer);
        }
        return;
      }
      
      ipcRenderer.send('ssh-send-data', { sessionId: session.id, data });
      
      // 当用户按 Enter 键时，获取当前工作目录
      if (data.includes('\r') || data.includes('\n')) {
        setTimeout(async () => {
          try {
            const result = await ipcRenderer.invoke('ssh-get-cwd', { sessionId: session.id });
            if (result.success) {
              const lastPath = lastKnownPathRef.current.get(session.id);
              // 只有当路径真正改变时才更新
              if (lastPath !== result.path) {
                lastKnownPathRef.current.set(session.id, result.path);
                updateSessionPath(session.id, result.path);
              }
            }
          } catch (err) {
            console.error('Failed to get cwd:', err);
          }
        }, 500);
      }
    });

    // Handle terminal resize (RAF 节流，避免最大化/最小化时频繁重绘导致闪烁)
    let resizeRafId: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeRafId !== null) return;
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        if (terminalInstancesRef.current.has(session.id)) {
          const { fitAddon, terminal } = terminalInstancesRef.current.get(session.id)!;
          fitAddon.fit();
          const { cols, rows } = terminal;
          ipcRenderer.send('ssh-resize', { sessionId: session.id, cols, rows });
        }
      });
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

    // Handle text selection - auto copy when selection changes
    terminal.onSelectionChange(() => {
      const selection = terminal.getSelection();
      if (selection && selection.trim()) {
        navigator.clipboard.writeText(selection.trim()).catch(err => {
          console.error('Failed to copy to clipboard:', err);
        });
      }
    });

    // Handle right-click paste
    container.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      // Use Electron's clipboard API for better multi-line support
      ipcRenderer.invoke('get-clipboard-text').then((text: string) => {
        if (text && text.trim()) {
          // Convert Windows line endings to Unix line endings
          const normalizedText = text.replace(/\r\n/g, '\n');
          ipcRenderer.send('ssh-send-data', { sessionId: session.id, data: normalizedText });
        }
      }).catch(err => {
        console.error('Failed to read from clipboard:', err);
      });
    });

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

      // Remove existing listeners to prevent duplicate handlers
      ipcRenderer.removeAllListeners(`ssh-data-${session.id}`);
      ipcRenderer.removeAllListeners(`ssh-close-${session.id}`);

      // Setup data listener FIRST before connecting
      ipcRenderer.on(`ssh-data-${session.id}`, (_event, data: string) => {
        terminal.write(data);
      });

      // Setup close listener FIRST before connecting
      ipcRenderer.once(`ssh-close-${session.id}`, () => {
        updateSessionStatus(session.id, 'disconnected');
        terminal.write('\r\n');
        terminal.write('──────────────────────────────────────────────────────────────────────────────\r\n');
        terminal.write('\x1b[31m连接已断开，按两次回车键重连\x1b[0m\r\n');
        terminal.write('\x1b[31mclosed\x1b[0m\r\n');
        terminal.write('──────────────────────────────────────────────────────────────────────────────\r\n');
      });

      // Now connect
      await ipcRenderer.invoke('ssh-connect', {
        sessionId: session.id,
        config: session.sshConfig
      });
      updateSessionStatus(session.id, 'connected');

      // 连接成功后立即发送终端尺寸（多次发送确保生效）
      const sendResize = () => {
        if (terminalInstancesRef.current.has(session.id)) {
          const { fitAddon, terminal } = terminalInstancesRef.current.get(session.id)!;
          fitAddon.fit();
          const { cols, rows } = terminal;
          ipcRenderer.send('ssh-resize', { sessionId: session.id, cols, rows });
        }
      };
      
      // 多次发送 resize 确保生效
      setTimeout(sendResize, 50);
      setTimeout(sendResize, 200);
      setTimeout(sendResize, 500);

      // 连接成功后立即获取一次当前目录
      setTimeout(async () => {
        try {
          const result = await ipcRenderer.invoke('ssh-get-cwd', { sessionId: session.id });
          if (result.success) {
            lastKnownPathRef.current.set(session.id, result.path);
            updateSessionPath(session.id, result.path);
          }
        } catch (err) {
          console.error('Failed to get initial cwd:', err);
        }
      }, 1000);
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

  const activeSession = sessions.find(s => s.id === activeSessionId);

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

        /* 透明背景，显示底层背景图片 */
        .xterm, .xterm .xterm-screen, .xterm .xterm-viewport, .xterm canvas {
          background-color: transparent !important;
        }
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
        /* Firefox scrollbar */
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
        minHeight: 35,
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex' }}>
          {sessions.map((session, index) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              draggable
              onDragStart={(e) => {
                setDraggedIndex(index);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverIndex(index);
              }}
              onDragLeave={() => {
                setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedIndex !== null && draggedIndex !== index) {
                  reorderSessions(draggedIndex, index);
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: activeSessionId === session.id ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                borderRight: '1px solid var(--border-color)',
                cursor: draggedIndex !== null ? 'grabbing' : 'grab',
                maxWidth: 200,
                opacity: draggedIndex === index ? 0.5 : 1,
                transform: dragOverIndex === index && draggedIndex !== index ? 'scale(1.05)' : 'none',
                transition: 'opacity 0.2s, transform 0.2s'
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

        {/* 右侧按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', gap: '8px' }}>
          <button
            onClick={() => setShowFileBrowser(!showFileBrowser)}
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            📁 文件浏览器
          </button>
          <button
            onClick={() => setShowTransferManager(!showTransferManager)}
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📤 文件传输
            {transferTasks.length > 0 && (
              <span style={{
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                padding: '0 6px',
                borderRadius: 10,
                fontSize: 10
              }}>
                {transferTasks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 终端容器 */}
        <div style={{ flex: 1, backgroundColor: 'transparent', overflow: 'hidden', position: 'relative' }}>
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
                backgroundColor: 'transparent'
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

        {/* 文件浏览器 */}
        {showFileBrowser && activeSession && (
          <FileBrowser
            sessionId={activeSession.id}
            transferTasks={transferTasks}
            addTransferTask={addTransferTask}
            updateTransferTask={updateTransferTask}
            deleteTransferTask={deleteTransferTask}
            setShowTransferManager={setShowTransferManager}
            currentPath={activeSession.currentPath}
          />
        )}
      </div>

      {/* 文件传输管理器 */}
      {showTransferManager && (
        <FileTransferManager
          transferTasks={transferTasks}
          onClose={() => setShowTransferManager(false)}
          onPauseTask={(taskId: string) => {
            const task = transferTasks.find(t => t.id === taskId);
            if (task) {
              updateTransferTask(taskId, { status: 'paused' });
            }
          }}
          onResumeTask={(taskId: string) => {
            const task = transferTasks.find(t => t.id === taskId);
            if (task) {
              updateTransferTask(taskId, { status: 'pending' });
            }
          }}
          onDeleteTask={deleteTransferTask}
        />
      )}
    </div>
  );
};

export default TerminalPanel;
