import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';
import { Client } from 'ssh2';
import { saveSSHConfig, loadAllSSHConfigs, deleteSSHConfig } from './configStore';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconPath = path.join(__dirname, '../../resources/icons/logo.png');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'XRTL Terminal',
    icon: iconPath,
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
