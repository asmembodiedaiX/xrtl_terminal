import { app, BrowserWindow, Menu, ipcMain, screen, clipboard } from 'electron';
import * as path from 'path';
import { Client } from 'ssh2';
import { saveSSHConfig, loadAllSSHConfigs, deleteSSHConfig } from './configStore';

let mainWindow: BrowserWindow | null = null;
const sshSessions: Map<string, { client: Client; stream: any }> = new Map();

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.8),
    height: Math.floor(height * 0.8),
    minWidth: 900,
    minHeight: 600,
    title: 'XRTL Terminal',
    icon: path.join(__dirname, '../../resources/icons/logo.ico'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#252526',
      symbolColor: '#858585',
      height: 32
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
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
      keepaliveInterval: 0
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (!replied) {
      reply({ success: false, message: `连接异常: ${err.message}`, error: err.message });
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
      conn.shell({ cols: 80, rows: 24 }, (err, stream) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }

        sshSessions.set(sessionId, { client: conn, stream });
        resolve({ success: true });

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

    conn.connect({
      host: config.host,
      port: config.port || 22,
      username: config.username,
      password: config.password
    });
  });
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

// Clipboard API for renderer process
ipcMain.handle('get-clipboard-text', () => {
  return clipboard.readText();
});
