import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ipcRenderer } from 'electron';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
  permissions?: number;
}

interface TransferTask {
  id: string;
  name: string;
  type: 'upload' | 'download';
  sessionId: string;
  localPath: string;
  remotePath: string;
  status: 'pending' | 'transferring' | 'paused' | 'completed' | 'failed';
  progress: number;
  size: number;
  transferred: number;
  startTime: number;
  speed: number;
  error?: string;
}

interface FileBrowserProps {
  sessionId: string;
  transferTasks: TransferTask[];
  addTransferTask: (task: TransferTask) => void;
  updateTransferTask: (taskId: string, updates: Partial<TransferTask>) => void;
  deleteTransferTask: (taskId: string) => void;
  setShowTransferManager: (show: boolean) => void;
  currentPath?: string;
}

const FileBrowser: React.FC<FileBrowserProps> = ({
  sessionId,
  transferTasks,
  addTransferTask,
  updateTransferTask,
  deleteTransferTask,
  setShowTransferManager,
  currentPath: terminalPath
}) => {
  const [browserPath, setBrowserPath] = useState('/');
  const [inputPath, setInputPath] = useState('/');
  const [userHasManuallyNavigated, setUserHasManuallyNavigated] = useState(false);
  const [lastTerminalPath, setLastTerminalPath] = useState<string | undefined>(undefined);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTransferringRef = useRef(false);
  const currentTaskRef = useRef<TransferTask | null>(null);
  const isPausedRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const loadDirectory = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ipcRenderer.invoke('sftp-list-dir', {
        sessionId,
        remotePath: path
      });

      if (result.success) {
        const sorted = [...result.files].sort((a: FileItem, b: FileItem) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'directory' ? -1 : 1;
        });
        setFiles(sorted);
        setBrowserPath(result.path);
        setInputPath(result.path);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadDirectory('/');
  }, [loadDirectory]);

  useEffect(() => {
    if (terminalPath) {
      if (terminalPath !== lastTerminalPath) {
        setUserHasManuallyNavigated(false);
        setLastTerminalPath(terminalPath);
        if (terminalPath !== browserPath) {
          loadDirectory(terminalPath);
        }
      } else if (!userHasManuallyNavigated && terminalPath !== browserPath) {
        loadDirectory(terminalPath);
      }
    }
  }, [terminalPath, browserPath, userHasManuallyNavigated, lastTerminalPath, loadDirectory]);

  const handleDirectoryClick = (file: FileItem) => {
    if (file.type === 'directory') {
      setUserHasManuallyNavigated(true);
      const newPath = browserPath === '/' ? `/${file.name}` : `${browserPath}/${file.name}`;
      loadDirectory(newPath);
    }
  };

  const goBack = () => {
    if (browserPath === '/') return;
    setUserHasManuallyNavigated(true);
    const parentPath = browserPath.substring(0, browserPath.lastIndexOf('/')) || '/';
    loadDirectory(parentPath);
  };

  const handlePathInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setUserHasManuallyNavigated(true);
      loadDirectory(inputPath);
    }
  };

  const processQueueRef = useRef<(() => Promise<void>) | null>(null);

  const processQueue = useCallback(async () => {
    if (isTransferringRef.current || isPausedRef.current) return;

    const pendingTasks = transferTasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      isTransferringRef.current = false;
      return;
    }

    isTransferringRef.current = true;
    const task = pendingTasks[0];
    currentTaskRef.current = task;

    updateTransferTask(task.id, {
      status: 'transferring',
      startTime: Date.now(),
      speed: 0
    });

    let lastTime = Date.now();
    let lastTransferred = task.transferred || 0;

    progressIntervalRef.current = setInterval(() => {
      if (!currentTaskRef.current) return;
      
      const currentTask = transferTasks.find(t => t.id === currentTaskRef.current?.id);
      if (currentTask) {
        const now = Date.now();
        const timeDiff = now - lastTime;
        if (timeDiff > 0) {
          const speed = ((currentTask.transferred - lastTransferred) * 1000) / timeDiff;
          updateTransferTask(currentTask.id, {
            speed: Math.round(speed)
          });
          lastTime = now;
          lastTransferred = currentTask.transferred;
        }
      }
    }, 500);

    try {
      let result;
      if (task.type === 'download') {
        result = await ipcRenderer.invoke('sftp-download-file', {
          sessionId: task.sessionId,
          remotePath: task.remotePath,
          localPath: task.localPath,
          taskId: task.id,
          resumePosition: task.transferred || 0
        });
      } else {
        result = await ipcRenderer.invoke('sftp-upload-file', {
          sessionId: task.sessionId,
          localPath: task.localPath,
          remotePath: task.remotePath,
          taskId: task.id,
          resumePosition: task.transferred || 0
        });
      }

      if (!isPausedRef.current) {
        if (result.success) {
          updateTransferTask(task.id, {
            status: 'completed',
            progress: 100,
            transferred: task.size,
            speed: 0
          });
        } else {
          updateTransferTask(task.id, {
            status: 'failed',
            error: result.error
          });
        }
      }
    } catch (err: any) {
      if (!isPausedRef.current) {
        updateTransferTask(task.id, {
          status: 'failed',
          error: err.message
        });
      }
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      ipcRenderer.removeAllListeners(`transfer-progress-${task.id}`);
      isTransferringRef.current = false;
      currentTaskRef.current = null;
      
      if (!isPausedRef.current) {
        setTimeout(() => {
          if (processQueueRef.current) {
            processQueueRef.current();
          }
        }, 100);
      }
    }
  }, [transferTasks, updateTransferTask]);

  processQueueRef.current = processQueue;

  useEffect(() => {
    if (transferTasks.some(t => t.status === 'pending') && !isTransferringRef.current && !isPausedRef.current) {
      processQueue();
    }
  }, [transferTasks, processQueue]);

  const handlePauseTask = useCallback((taskId: string) => {
    const task = transferTasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'transferring' && currentTaskRef.current?.id === taskId) {
      isPausedRef.current = true;
      ipcRenderer.send('cancel-transfer', { taskId });
    }

    updateTransferTask(taskId, {
      status: 'paused'
    });
  }, [transferTasks, updateTransferTask]);

  const handleResumeTask = useCallback((taskId: string) => {
    const task = transferTasks.find(t => t.id === taskId);
    if (!task || task.status !== 'paused') return;

    isPausedRef.current = false;

    updateTransferTask(taskId, {
      status: 'pending'
    });

    setTimeout(processQueue, 100);
  }, [transferTasks, updateTransferTask, processQueue]);

  const handleDeleteTask = useCallback((taskId: string) => {
    const task = transferTasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'transferring' && currentTaskRef.current?.id === taskId) {
      ipcRenderer.send('cancel-transfer', { taskId });
      isPausedRef.current = true;
      isTransferringRef.current = false;
      currentTaskRef.current = null;
    }

    deleteTransferTask(taskId);
  }, [transferTasks, deleteTransferTask]);

  useEffect(() => {
    const handleProgress = (taskId: string) => (event: any, data: { progress: number; transferred: number; total: number }) => {
      const task = transferTasks.find(t => t.id === taskId);
      if (!task || task.status !== 'transferring') return;
      
      updateTransferTask(taskId, {
        progress: data.progress,
        transferred: data.transferred
      });
    };

    transferTasks.forEach(task => {
      ipcRenderer.on(`transfer-progress-${task.id}`, handleProgress(task.id));
    });

    return () => {
      transferTasks.forEach(task => {
        ipcRenderer.removeAllListeners(`transfer-progress-${task.id}`);
      });
    };
  }, [transferTasks, updateTransferTask]);

  const handleDownload = async (file: FileItem) => {
    try {
      const saveResult = await ipcRenderer.invoke('select-save-path', {
        defaultName: file.name
      });

      if (saveResult.canceled) return;

      const remotePath = browserPath === '/' ? `/${file.name}` : `${browserPath}/${file.name}`;

      const task: TransferTask = {
        id: `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: 'download',
        sessionId,
        localPath: saveResult.filePath,
        remotePath,
        status: 'pending',
        progress: 0,
        size: file.size,
        transferred: 0,
        startTime: Date.now(),
        speed: 0
      };

      addTransferTask(task);
      setShowTransferManager(true);
    } catch (err: any) {
      alert(`下载错误: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    try {
      const selectResult = await ipcRenderer.invoke('select-local-file');

      if (selectResult.canceled) return;

      const fileName = selectResult.filePath.split(/[/\\]/).pop();
      const remotePath = browserPath === '/' ? `/${fileName}` : `${browserPath}/${fileName}`;

      const fs = window.require('fs');
      const stats = fs.statSync(selectResult.filePath);

      const task: TransferTask = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: fileName,
        type: 'upload',
        sessionId,
        localPath: selectResult.filePath,
        remotePath,
        status: 'pending',
        progress: 0,
        size: stats.size,
        transferred: 0,
        startTime: Date.now(),
        speed: 0
      };

      addTransferTask(task);
      setShowTransferManager(true);
    } catch (err: any) {
      alert(`上传错误: ${err.message}`);
    }
  };

  const handleDownloadFolder = async () => {
    try {
      const saveResult = await ipcRenderer.invoke('select-save-path', {
        defaultName: browserPath.split('/').pop() || 'download'
      });

      if (saveResult.canceled) return;

      const folderSize = files.filter(f => f.type === 'file').reduce((sum, f) => sum + f.size, 0);

      const task: TransferTask = {
        id: `download-folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: browserPath.split('/').pop() || '/',
        type: 'download',
        sessionId,
        localPath: saveResult.filePath,
        remotePath: browserPath,
        status: 'pending',
        progress: 0,
        size: folderSize,
        transferred: 0,
        startTime: Date.now(),
        speed: 0
      };

      addTransferTask(task);
      setShowTransferManager(true);

      let totalProgress = 0;
      const totalFiles = files.filter(f => f.type === 'file').length;
      let completedFiles = 0;

      for (const file of files.filter(f => f.type === 'file')) {
        const fileRemotePath = browserPath === '/' ? `/${file.name}` : `${browserPath}/${file.name}`;

        updateTransferTask(task.id, { status: 'transferring' });

        try {
          const result = await ipcRenderer.invoke('sftp-download-file', {
            sessionId,
            remotePath: fileRemotePath,
            localPath: `${saveResult.filePath}\\${file.name}`,
            taskId: task.id
          });

          if (result.success) {
            completedFiles++;
            totalProgress = (completedFiles / totalFiles) * 100;
            const transferred = files.filter(f => f.type === 'file').slice(0, completedFiles).reduce((sum, f) => sum + f.size, 0);

            updateTransferTask(task.id, {
              progress: Math.round(totalProgress),
              transferred
            });
          } else {
            updateTransferTask(task.id, {
              status: 'failed',
              error: `下载 ${file.name} 失败: ${result.error}`
            });
            return;
          }
        } catch (err: any) {
          updateTransferTask(task.id, {
            status: 'failed',
            error: `下载 ${file.name} 失败: ${err.message}`
          });
          return;
        }
      }

      updateTransferTask(task.id, {
        status: 'completed',
        progress: 100,
        transferred: folderSize
      });
    } catch (err: any) {
      alert(`下载文件夹错误: ${err.message}`);
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '350px',
        minWidth: '350px',
        maxWidth: '350px',
        backgroundColor: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          gap: '8px'
        }}>
          <button
            onClick={goBack}
            disabled={browserPath === '/'}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: browserPath === '/' ? 'not-allowed' : 'pointer',
              opacity: browserPath === '/' ? 0.5 : 1,
              flexShrink: 0
            }}
          >
            ← 返回上级
          </button>
          <button
            onClick={handleUpload}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            上传文件
          </button>
          <button
            onClick={handleDownloadFolder}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            下载文件夹
          </button>
        </div>

        <div style={{
          padding: '8px 12px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', flexShrink: 0 }}>📁</span>
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              onKeyDown={handlePathInputKeyDown}
              style={{
                flex: 1,
                padding: '6px 8px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                outline: 'none'
              }}
              placeholder="输入路径并按回车跳转"
            />
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto'
        }} className="file-browser-scrollbar">
          {loading ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              加载中...
            </div>
          ) : error ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--danger-color)'
            }}>
              {error}
              <br />
              <button
                onClick={() => loadDirectory(browserPath)}
                style={{
                  marginTop: '16px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                重试
              </button>
            </div>
          ) : (
            <div>
              <div style={{
                padding: '8px 12px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                共 {files.length} 个文件，
                {files.filter(f => f.type === 'directory').length} 个文件夹，
                {formatFileSize(files.filter(f => f.type === 'file').reduce((sum, f) => sum + f.size, 0))}
              </div>

              {files.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    cursor: file.type === 'directory' ? 'pointer' : 'default',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                  onDoubleClick={() => handleDirectoryClick(file)}
                  className="file-item-hover"
                >
                  <span style={{
                    marginRight: '8px',
                    fontSize: '14px'
                  }}>
                    {file.type === 'directory' ? '📁' : '📄'}
                  </span>
                  <div style={{
                    flex: 1,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      color: file.type === 'directory' ? 'var(--accent-color)' : '#ffffff',
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {file.name}
                    </div>
                    <div style={{
                      color: 'var(--text-secondary)',
                      fontSize: '11px'
                    }}>
                      {file.type === 'directory' ? '文件夹' : formatFileSize(file.size)}
                      {' · '}
                      {new Date(file.modifiedAt).toLocaleString()}
                    </div>
                  </div>
                  {file.type === 'file' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      下载
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .file-item-hover:hover {
          background-color: var(--bg-hover) !important;
        }

        .file-browser-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .file-browser-scrollbar::-webkit-scrollbar-track {
          background: var(--bg-primary);
        }

        .file-browser-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }

        .file-browser-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--bg-hover);
        }
      `}</style>
    </>
  );
};

export default FileBrowser;