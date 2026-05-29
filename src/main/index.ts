import { app, BrowserWindow, Menu, ipcMain, screen, clipboard, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// 必须在所有 Electron 代码之前设置，否则 Windows 任务栏显示 "Electron"
app.setName('XRTL Terminal');
app.setAppUserModelId('com.xrtl.terminal');

const cacheDir = path.join(app.getPath('userData'), 'Cache');
try {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  app.setPath('cache', cacheDir);
} catch (err) {
  console.error('Failed to set cache directory:', err);
}

let mainWindow: BrowserWindow | null = null;
const sshSessions: Map<string, { client: any; stream: any; sftp?: any }> = new Map();

function getIconPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'icons', 'logo.ico');
  }
  return path.join(__dirname, '../../resources/icons/logo.ico');
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.floor(width),
    height: Math.floor(height),
    minWidth: 900,
    minHeight: 600,
    title: 'XRTL Terminal',
    icon: getIconPath(),
    titleBarStyle: 'hidden',
    frame: false,
    backgroundColor: '#1e1e1e',
    show: false,
    paintWhenInitiallyHidden: true,
    enableLargerThanScreen: true,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false,
      backgroundThrottling: false
    }
  });

  // VSCode 风格：解决最大化/最小化时的白色闪烁问题
  let isResizing = false;
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  mainWindow.on('maximize', () => {
    isResizing = true;
    if (mainWindow) {
      mainWindow.setBackgroundColor('#1e1e1e');
    }
    mainWindow?.webContents.send('window-maximized', true);
  });

  mainWindow.on('unmaximize', () => {
    isResizing = true;
    if (mainWindow) {
      mainWindow.setBackgroundColor('#1e1e1e');
    }
    mainWindow?.webContents.send('window-maximized', false);
  });

  mainWindow.on('resize', () => {
    isResizing = true;
    if (mainWindow) {
      mainWindow.setBackgroundColor('#1e1e1e');
    }

    // 防抖处理：resize 结束后恢复
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      isResizing = false;
    }, 100);
  });

  mainWindow.on('minimize', () => {
    isResizing = false;
  });

  // 窗口显示前确保背景色已设置
  mainWindow.webContents.on('did-finish-load', () => {
    if (mainWindow) {
      mainWindow.setBackgroundColor('#1e1e1e');
    }
  });

  const isPackaged = app.isPackaged;

  let rendererPath: string;

  if (!isPackaged) {
    rendererPath = 'http://localhost:3100';
  } else {
    rendererPath = path.join(__dirname, '..', 'renderer', 'index.html');
  }

  // 使用标准的 ready-to-show 事件显示窗口
  // 添加超时后备以防窗口卡住
  let showWindowTimeout: ReturnType<typeof setTimeout> | null = null;

  // 超时后备：如果 5 秒后还没显示，强制显示窗口
  showWindowTimeout = setTimeout(() => {
    console.log('Force showing window due to timeout');
    mainWindow?.show();
  }, 5000);

  mainWindow.once('ready-to-show', () => {
    if (showWindowTimeout) {
      clearTimeout(showWindowTimeout);
    }
    // 微小延迟确保渲染完成
    setTimeout(() => {
      mainWindow?.show();
    }, 50);
  });

  if (!isPackaged) {
    mainWindow.loadURL(rendererPath);
  } else {
    mainWindow.loadFile(rendererPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isPackaged) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }
}

// 优化启动性能和窗口渲染（参考 VSCode 实现）
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('force-gpu-rasterization');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');

// VSCode 风格的渲染优化
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('enable-gpu-memory-buffer-compositor');

// 禁用某些可能导致闪烁的特性
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-windows10-custom-titlebar');

// 启用平滑滚动和动画
app.commandLine.appendSwitch('enable-smooth-scrolling');
app.commandLine.appendSwitch('enable-experimental-web-platform-features');

// 禁用 GPU 磁盘缓存以解决访问被拒绝错误
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-cache');

app.whenReady().then(() => {
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
  const { Client } = require('ssh2');
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

  conn.on('error', (err: any) => {
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
  const { saveSSHConfig } = require('./configStore');
  try {
    await saveSSHConfig(config);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-all-ssh-configs', async () => {
  const { loadAllSSHConfigs } = require('./configStore');
  try {
    const configs = await loadAllSSHConfigs();
    return { success: true, configs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-ssh-config', async (_event, id) => {
  const { deleteSSHConfig } = require('./configStore');
  try {
    await deleteSSHConfig(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 弱连接增强配置
const WEAK_CONNECTION_CONFIG = {
  maxRetries: 3,                    // 最大重试次数
  baseRetryDelay: 2000,             // 基础重试延迟(ms)
  maxRetryDelay: 15000,             // 最大重试延迟(ms)
  readyTimeout: 30000,              // 连接超时时间(ms) - 增加到30秒
  handshakeTimeout: 15000,          // 握手超时时间(ms)
  keepaliveInterval: 5000,          // 心跳间隔(ms)
  keepaliveCountMax: 5,             // 最大心跳失败次数
  algorithms: {
    kex: [
      'curve25519-sha256@libssh.org',
      'ecdh-sha2-nistp256',
      'ecdh-sha2-nistp384',
      'ecdh-sha2-nistp521',
      'diffie-hellman-group-exchange-sha256',
      'diffie-hellman-group14-sha256',
      'diffie-hellman-group14-sha1'
    ],
    cipher: [
      'aes128-gcm@openssh.com',
      'aes256-gcm@openssh.com',
      'aes128-ctr',
      'aes192-ctr',
      'aes256-ctr',
      'aes128-cbc',
      'aes192-cbc',
      'aes256-cbc'
    ],
    hmac: [
      'hmac-sha2-256',
      'hmac-sha2-512',
      'hmac-sha1'
    ],
    compress: [
      'none'
    ]
  }
};

// 指数退避算法
function getRetryDelay(attempt: number): number {
  const delay = WEAK_CONNECTION_CONFIG.baseRetryDelay * Math.pow(2, attempt);
  // 添加随机抖动，避免重试风暴
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return Math.min(delay + jitter, WEAK_CONNECTION_CONFIG.maxRetryDelay);
}

// 带重试机制的SSH连接
async function connectWithRetry(sessionId: string, config: any, attempt: number = 0): Promise<any> {
  const { Client } = require('ssh2');
  const conn = new Client();
  const maxRetries = WEAK_CONNECTION_CONFIG.maxRetries;

  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    conn.on('ready', () => {
      if (timeoutId) clearTimeout(timeoutId);

      conn.shell({ cols: 200, rows: 100, term: 'xterm-256color' }, (err: any, stream: any) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }

        conn.sftp((sftpErr: any, sftp: any) => {
          if (sftpErr) {
            console.warn('SFTP connection failed:', sftpErr);
          }

          sshSessions.set(sessionId, { client: conn, stream, sftp: sftpErr ? undefined : sftp });
          resolve({ success: true, retries: attempt });
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

        // 设置 PS1 + PROMPT_COMMAND + TERM
        // PROMPT_COMMAND 输出 OSC 777 序列携带 $PWD，用于文件浏览器同步
        // TERM=xterm-256color 确保正确的颜色支持
        setTimeout(() => {
          try {
            stream.write(
              "export TERM=xterm-256color ; " +
              "export PS1='\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '" +
              "; PROMPT_COMMAND='printf \"\\\\033]777;CWD;%s\\\\033\\\\\\\\\" \"$PWD\"'" +
              " && printf '\\033[1A\\033[2K'\n"
            );
          } catch (e) {
            // 流可能已关闭
          }
        }, 800);
      });
    });

    conn.on('error', (err: any) => {
      if (timeoutId) clearTimeout(timeoutId);

      // 判断是否需要重试
      const shouldRetry = attempt < maxRetries &&
        (err.message.includes('ETIMEDOUT') ||
          err.message.includes('ECONNRESET') ||
          err.message.includes('ECONNREFUSED') ||
          err.message.includes('ENETUNREACH') ||
          err.message.includes('EHOSTUNREACH') ||
          err.message.includes('EPIPE') ||
          err.message.includes('handshake failed'));

      if (shouldRetry) {
        const delay = getRetryDelay(attempt);
        console.log(`SSH连接失败，正在进行第 ${attempt + 1} 次重试，延迟 ${delay.toFixed(0)}ms...`);

        setTimeout(() => {
          connectWithRetry(sessionId, config, attempt + 1)
            .then(resolve)
            .catch(reject);
        }, delay);
      } else {
        reject(err);
      }
    });

    conn.on('end', () => {
      if (timeoutId) clearTimeout(timeoutId);
      sshSessions.delete(sessionId);
      if (mainWindow) {
        mainWindow.webContents.send(`ssh-close-${sessionId}`);
      }
    });

    conn.on('timeout', () => {
      if (timeoutId) clearTimeout(timeoutId);

      if (attempt < maxRetries) {
        const delay = getRetryDelay(attempt);
        console.log(`SSH连接超时，正在进行第 ${attempt + 1} 次重试，延迟 ${delay.toFixed(0)}ms...`);

        setTimeout(() => {
          connectWithRetry(sessionId, config, attempt + 1)
            .then(resolve)
            .catch(reject);
        }, delay);
      } else {
        reject(new Error('连接超时'));
      }
    });

    conn.connect({
      host: config.host,
      port: config.port || 22,
      username: config.username,
      password: config.password,
      readyTimeout: WEAK_CONNECTION_CONFIG.readyTimeout,
      handshakeTimeout: WEAK_CONNECTION_CONFIG.handshakeTimeout,
      keepaliveInterval: WEAK_CONNECTION_CONFIG.keepaliveInterval,
      keepaliveCountMax: WEAK_CONNECTION_CONFIG.keepaliveCountMax,
      algorithms: WEAK_CONNECTION_CONFIG.algorithms,
      debug: (msg: string) => {
        // 可选：开启调试日志
        // console.log('SSH Debug:', msg);
      }
    });
  });
}

ipcMain.handle('ssh-connect', async (_event, { sessionId, config }) => {
  return connectWithRetry(sessionId, config, 0);
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
    session.sftp!.readdir(targetPath, (err: any, list: any) => {
      if (err) {
        // If . also fails, try absolute root /
        if (targetPath === '.' || targetPath === '~') {
          session.sftp!.readdir('/', (err2: any, list2: any) => {
            if (err2) {
              resolve({ success: false, error: err2.message });
            } else {
              const files = list2?.map((item: any) => ({
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
        const files = list?.map((item: any) => ({
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
    session.sftp!.stat(remotePath, (err: any, stats: any) => {
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

      session.sftp!.fastGet(remotePath, localPath, options, (err: any) => {
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

    session.sftp!.fastPut(localPath, remotePath, options, (err: any) => {
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
    session.sftp!.unlink(remotePath, (err: any) => {
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
    session.sftp!.mkdir(remotePath, (err: any) => {
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
  if (!session || !session.stream) {
    return { success: false, error: 'Session not found' };
  }

  return new Promise((resolve) => {
    const marker = `CWD${Date.now().toString(36)}`;
    // stty -echo 关闭回显 → printf 清除 "stty -echo" 行 →
    // echo 输出 CWD → printf 清除 CWD 输出行 → stty echo 恢复
    const cmd =
      `printf '\\033[1A\\033[2K' && ` +
      `echo "${marker}$PWD" && ` +
      `printf '\\033[1A\\033[2K' && ` +
      `stty echo\n`;

    let resolved = false;

    const dataHandler = (data: Buffer) => {
      if (resolved) return;
      const text = data.toString();
      const idx = text.indexOf(marker);
      if (idx === -1) return;

      // stty -echo 已抑制命令回显，这里直接是 echo 的实际输出
      resolved = true;
      session.stream.removeListener('data', dataHandler);

      const pathMatch = text.substring(idx + marker.length).match(/^([^\r\n\x1b]*)/);
      let cwd = pathMatch ? pathMatch[1].trim() : '/';
      if (!cwd.startsWith('/')) cwd = '/' + cwd;
      resolve({ success: true, path: cwd });
    };

    session.stream.on('data', dataHandler);

    // Step 1: 关闭回显（仅 "stty -echo" 11 字符可见，绝不换行）
    session.stream.write('stty -echo\n');
    setTimeout(() => {
      if (!resolved) {
        session.stream.write(cmd);
      }
    }, 200);

    // 3 秒超时
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        session.stream.removeListener('data', dataHandler);
        resolve({ success: false, error: 'CWD query timed out' });
      }
    }, 3000);
  });
});

// Clipboard API for renderer process
ipcMain.handle('get-clipboard-text', () => {
  return clipboard.readText();
});

// Open URL in default browser
ipcMain.on('open-url', (_event, url: string) => {
  try {
    // Validate URL before opening
    new URL(url);
    shell.openExternal(url);
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
});
