import { app, BrowserWindow, Menu, ipcMain, screen, clipboard, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { Client, SFTPWrapper } from 'ssh2';
import { saveSSHConfig, loadAllSSHConfigs, deleteSSHConfig } from './configStore';

let mainWindow: BrowserWindow | null = null;
const sshSessions: Map<string, { client: Client; stream: any; sftp?: SFTPWrapper }> = new Map();

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.floor(width),
    height: Math.floor(height),
    minWidth: 900,
    minHeight: 600,
    title: 'XRTL Terminal',
    icon: path.join(__dirname, '../../resources/icons/logo.ico'),
    titleBarStyle: 'hidden',
    frame: false,
    backgroundColor: '#1e1e1e',
    show: false,
    paintWhenInitiallyHidden: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false,
      backgroundThrottling: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000').catch(err => {
      console.error('Failed to load URL:', err);
    });

    // 监听加载失败
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Load failed:', errorCode, errorDescription);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).catch(err => {
      console.error('Failed to load file:', err);
    });
  }

  // 等待内容准备好后再显示窗口，防止白色残影
  mainWindow.once('ready-to-show', () => {
    // 确保窗口不是最大化状态
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    }
    // 再延迟一小段时间确保完全渲染
    setTimeout(() => {
      mainWindow?.show();
    }, 100);
  });

  // 添加超时机制，确保窗口一定会显示
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      // 确保窗口不是最大化状态
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      }
      mainWindow.show();
    }
  }, 3000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 禁用 devtools 打开
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow?.webContents.closeDevTools();
  });
}

app.on('ready', () => {
  createWindow();
  Menu.setApplicationMenu(null);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      mainWindow.webContents.send('window-maximized', false);
    } else {
      mainWindow.maximize();
      mainWindow.webContents.send('window-maximized', true);
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on('ssh-test-connection', (event, { config, channel }) => {
  const conn = new Client();
  let replied = false;

  const reply = (result: { success: boolean; message: string; error?: string }) => {
    if (!replied && mainWindow) {
      replied = true;
      mainWindow.webContents.send(channel, result);
    }
  };

  const timeout = setTimeout(() => {
    conn.end();
    reply({ success: false, message: '连接超时' });
  }, 10000);

  conn.on('ready', () => {
    clearTimeout(timeout);
    conn.end();
    reply({ success: true, message: '连接成功' });
  });

  conn.on('error', (err) => {
    clearTimeout(timeout);
    conn.end();
    let errorMessage = '连接失败';

    if (err.message.includes('ECONNREFUSED')) {
      errorMessage = '连接被拒绝，请检查主机地址和端口';
    } else if (err.message.includes('ETIMEDOUT')) {
      errorMessage = '连接超时，请检查网络或主机地址';
    } else if (err.message.includes('ENOTFOUND')) {
      errorMessage = '找不到主机，请检查主机地址';
    } else if (err.message.includes('Authentication failed')) {
      errorMessage = '认证失败，请检查用户名和密码';
    } else {
      errorMessage = `连接失败: ${err.message}`;
    }

    reply({ success: false, message: errorMessage, error: err.message });
  });

  try {
    conn.connect({
      host: config.host,
      port: config.port || 22,
      username: config.username,
      password: config.password,
      readyTimeout: 10000,
      keepaliveInterval: 2000,
      keepaliveCountMax: 2
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (!replied) {
      reply({ success: false, message: `连接异常：${err.message}`, error: err.message });
    }
  }
});

ipcMain.handle('save-ssh-config', async (_event, config) => {
  try {
    await saveSSHConfig(config);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-all-ssh-configs', async () => {
  try {
    const configs = await loadAllSSHConfigs();
    return { success: true, configs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-ssh-config', async (_event, id) => {
  try {
    await deleteSSHConfig(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ssh-connect', async (_event, { sessionId, config }) => {
  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn.on('ready', () => {
      // Use a larger default size to ensure proper line wrapping
      conn.shell({ cols: 120, rows: 40 }, (err, stream) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }

        // Create SFTP session for file operations
        conn.sftp((sftpErr, sftp) => {
          if (sftpErr) {
            console.warn('SFTP connection failed:', sftpErr);
          }

          sshSessions.set(sessionId, { client: conn, stream, sftp: sftpErr ? undefined : sftp });
          resolve({ success: true });
        });

        stream.on('data', (data: Buffer) => {
          if (mainWindow) {
            mainWindow.webContents.send(`ssh-data-${sessionId}`, data.toString('utf8'));
          }
        });

        stream.on('close', () => {
          conn.end();
          sshSessions.delete(sessionId);
          if (mainWindow) {
            mainWindow.webContents.send(`ssh-close-${sessionId}`);
          }
        });
      });
    });

    conn.on('error', (err) => {
      reject(err);
    });

    conn.on('end', () => {
      sshSessions.delete(sessionId);
      if (mainWindow) {
        mainWindow.webContents.send(`ssh-close-${sessionId}`);
      }
    });

    conn.on('timeout', () => {
      reject(new Error('连接超时'));
    });

    conn.connect({
      host: config.host,
      port: config.port || 22,
      username: config.username,
      password: config.password,
      readyTimeout: 10000,
      keepaliveInterval: 2000,
      keepaliveCountMax: 2
    });
  });
});

// SFTP File Operations
ipcMain.handle('sftp-list-dir', async (_event, { sessionId, remotePath }) => {
  const session = sshSessions.get(sessionId);
  if (!session || !session.sftp) {
    return { success: false, error: 'SFTP session not available' };
  }

  // Handle ~ path - use current directory if path is ~
  const targetPath = remotePath === '~' ? '.' : remotePath;

  return new Promise((resolve) => {
    session.sftp!.readdir(targetPath, (err, list) => {
      if (err) {
        // If . also fails, try absolute root /
        if (targetPath === '.' || targetPath === '~') {
          session.sftp!.readdir('/', (err2, list2) => {
            if (err2) {
              resolve({ success: false, error: err2.message });
            } else {
              const files = list2?.map(item => ({
                name: item.filename,
                type: item.longname.startsWith('d') ? 'directory' : 'file',
                size: item.attrs.size,
                modifiedAt: new Date(item.attrs.mtime * 1000).toISOString()
              })) || [];
              resolve({ success: true, files, path: '/' });
            }
          });
        } else {
          resolve({ success: false, error: err.message });
        }
      } else {
        const files = list?.map(item => ({
          name: item.filename,
          type: item.longname.startsWith('d') ? 'directory' : 'file',
          size: item.attrs.size,
          modifiedAt: new Date(item.attrs.mtime * 1000).toISOString()
        })) || [];
        resolve({ success: true, files, path: remotePath === '~' ? '/' : remotePath });
      }
    });
  });
});

ipcMain.handle('sftp-download-file', async (event, { sessionId, remotePath, localPath, taskId, resumePosition = 0 }) => {
  const session = sshSessions.get(sessionId);
  if (!session || !session.sftp) {
    return { success: false, error: 'SFTP session not available' };
  }

  let fileSize = 0;

  return new Promise((resolve) => {
    session.sftp!.stat(remotePath, (err, stats) => {
      if (err) {
        resolve({ success: false, error: err.message });
        return;
      }

      fileSize = stats.size;

      const options: any = {
        step: (transferred: number) => {
          const actualTransferred = resumePosition + transferred;
          const progress = Math.round((actualTransferred / fileSize) * 100);
          event.sender.send(`transfer-progress-${taskId}`, {
            progress,
            transferred: actualTransferred,
            total: fileSize
          });
        }
      };

      if (resumePosition > 0) {
        options.start = resumePosition;
      }

      session.sftp!.fastGet(remotePath, localPath, options, (err) => {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          event.sender.send(`transfer-progress-${taskId}`, {
            progress: 100,
            transferred: fileSize,
            total: fileSize
          });
          resolve({ success: true, localPath });
        }
      });
    });
  });
});

ipcMain.handle('sftp-upload-file', async (event, { sessionId, localPath, remotePath, taskId, resumePosition = 0 }) => {
  const session = sshSessions.get(sessionId);
  if (!session || !session.sftp) {
    return { success: false, error: 'SFTP session not available' };
  }

  const fs = require('fs');
  const stats = fs.statSync(localPath);
  const fileSize = stats.size;

  return new Promise((resolve) => {
    const options: any = {
      step: (transferred: number) => {
        const actualTransferred = resumePosition + transferred;
        const progress = Math.round((actualTransferred / fileSize) * 100);
        event.sender.send(`transfer-progress-${taskId}`, {
          progress,
          transferred: actualTransferred,
          total: fileSize
        });
      }
    };

    if (resumePosition > 0) {
      options.start = resumePosition;
    }

    session.sftp!.fastPut(localPath, remotePath, options, (err) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        event.sender.send(`transfer-progress-${taskId}`, {
          progress: 100,
          transferred: fileSize,
          total: fileSize
        });
        resolve({ success: true, remotePath });
      }
    });
  });
});

ipcMain.handle('sftp-delete-file', async (_event, { sessionId, remotePath }) => {
  const session = sshSessions.get(sessionId);
  if (!session || !session.sftp) {
    return { success: false, error: 'SFTP session not available' };
  }

  return new Promise((resolve) => {
    session.sftp!.unlink(remotePath, (err) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('sftp-create-dir', async (_event, { sessionId, remotePath }) => {
  const session = sshSessions.get(sessionId);
  if (!session || !session.sftp) {
    return { success: false, error: 'SFTP session not available' };
  }

  return new Promise((resolve) => {
    session.sftp!.mkdir(remotePath, (err) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('select-local-file', async () => {
  if (!mainWindow) return { success: false, error: 'Window not found' };

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: '选择要上传的文件'
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true };
  }

  return { success: true, filePath: result.filePaths[0] };
});

ipcMain.handle('select-save-path', async (_event, { defaultName }) => {
  if (!mainWindow) return { success: false, error: 'Window not found' };

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    title: '保存文件'
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  return { success: true, filePath: result.filePath };
});

ipcMain.on('ssh-send-data', (_event, { sessionId, data }) => {
  const session = sshSessions.get(sessionId);
  if (session && session.stream) {
    // Ensure data is a string and handle multi-line input properly
    const inputData = typeof data === 'string' ? data : String(data);
    // Write all data to the stream, including newlines for multi-line paste
    session.stream.write(inputData);
  }
});

ipcMain.on('ssh-resize', (_event, { sessionId, cols, rows }) => {
  const session = sshSessions.get(sessionId);
  if (session && session.stream) {
    session.stream.setWindow(rows, cols, 0, 0);
  }
});

ipcMain.on('ssh-disconnect', (_event, { sessionId }) => {
  const session = sshSessions.get(sessionId);
  if (session) {
    if (session.stream) {
      session.stream.end();
    }
    session.client.end();
    sshSessions.delete(sessionId);
  }
});

ipcMain.handle('ssh-get-cwd', async (_event, { sessionId }) => {
  const session = sshSessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  return new Promise((resolve) => {
    session.client.exec('pwd', (err, channel) => {
      if (err) {
        resolve({ success: false, error: err.message });
        return;
      }

      let output = '';
      channel.on('data', (data: Buffer) => {
        output += data.toString();
      });

      channel.stderr.on('data', (data: Buffer) => {
        console.error('pwd stderr:', data.toString());
      });

      channel.on('close', () => {
        let cwd = output
          .replace(/\x1b\[[0-9;]*m/g, '')
          .replace(/[\r\n]+/g, '\n')
          .trim();

        if (!cwd.startsWith('/')) {
          cwd = '/' + cwd;
        }

        resolve({ success: true, path: cwd });
      });
    });
  });
});

// Clipboard API for renderer process
ipcMain.handle('get-clipboard-text', () => {
  return clipboard.readText();
});
