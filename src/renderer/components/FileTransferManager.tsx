import React, { useState, useRef, useEffect, memo, useMemo } from 'react';

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

interface FileTransferManagerProps {
  onClose: () => void;
  transferTasks: TransferTask[];
  onPauseTask: (taskId: string) => void;
  onResumeTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

type TabType = 'active' | 'queue' | 'paused' | 'failed' | 'completed';

const FileTransferManager: React.FC<FileTransferManagerProps> = ({
  onClose,
  transferTasks,
  onPauseTask,
  onResumeTask,
  onDeleteTask
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const [isCentered, setIsCentered] = useState(true);

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'active':
        return transferTasks.filter(t => t.status === 'transferring');
      case 'queue':
        return transferTasks.filter(t => t.status === 'pending');
      case 'paused':
        return transferTasks.filter(t => t.status === 'paused');
      case 'failed':
        return transferTasks.filter(t => t.status === 'failed');
      case 'completed':
        return transferTasks.filter(t => t.status === 'completed');
      default:
        return [];
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return '-';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const TransferTaskItem = memo(({
    task,
    onPause,
    onResume,
    onDelete
  }: {
    task: TransferTask;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
    const buttonStyle = {
      padding: '4px 8px',
      backgroundColor: '#3c3c3c',
      color: '#d4d4d4',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '11px',
      marginRight: '4px'
    };

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
        padding: '12px 16px',
        borderBottom: '1px solid #2a2d2e',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: '16px' }}>
              {task.type === 'upload' ? '↑' : '↓'}
            </span>
            <span style={{
              color: '#d4d4d4',
              fontSize: '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {task.name}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#3c3c3c',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '6px'
          }}>
            {(task.status === 'transferring' || task.status === 'paused') && (
              <div style={{
                height: '100%',
                width: `${task.progress}%`,
                backgroundColor: task.status === 'paused' ? '#cca700' : '#0e639c',
                transition: 'width 0.3s ease-out'
              }} />
            )}
          </div>
        </div>
        <div style={{
          color: '#858585',
          fontSize: '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {task.sessionId.slice(0, 8)}...
        </div>
        <div style={{
          color: task.status === 'transferring' ? '#0e639c' :
                 task.status === 'paused' ? '#cca700' :
                 task.status === 'completed' ? '#3e8e3e' :
                 task.status === 'failed' ? '#f14c4c' : '#858585',
          fontSize: '12px'
        }}>
          {task.status === 'pending' ? '等待中' :
           task.status === 'transferring' ? '传输中' :
           task.status === 'paused' ? '已暂停' :
           task.status === 'completed' ? '已完成' : '失败'}
        </div>
        <div style={{
          color: '#858585',
          fontSize: '12px'
        }}>
          {task.status === 'transferring' && (
            <div>
              <span>{formatFileSize(task.transferred)}</span>
              <span style={{ margin: '0 4px' }}>/</span>
              <span>{formatFileSize(task.size)}</span>
              <br />
              <span style={{ color: '#0e639c' }}>{formatSpeed(task.speed)}</span>
            </div>
          )}
          {task.status === 'completed' && (
            <div>
              {formatFileSize(task.size)}
              <br />
              {formatTime(task.startTime)}
            </div>
          )}
          {task.status === 'failed' && task.error && (
            <div style={{ color: '#f14c4c', fontSize: '11px' }}>
              {task.error}
            </div>
          )}
          {task.status === 'paused' && (
            <div>
              {formatFileSize(task.transferred)}
              <span style={{ margin: '0 4px' }}>/</span>
              {formatFileSize(task.size)}
              <br />
              <span style={{ color: '#cca700' }}>已暂停</span>
            </div>
          )}
          {task.status === 'pending' && (
            <div>
              {formatFileSize(task.size)}
            </div>
          )}
        </div>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {(task.status === 'transferring' || task.status === 'pending') && (
              <button style={buttonStyle} onClick={() => onPause(task.id)} title="暂停">
                ⏸
              </button>
            )}
            {task.status === 'paused' && (
              <button style={buttonStyle} onClick={() => onResume(task.id)} title="恢复">
                ▶
              </button>
            )}
            {task.status !== 'transferring' && (
              <button
                style={{ ...buttonStyle, backgroundColor: '#f14c4c' }}
                onClick={() => onDelete(task.id)}
                title="删除"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    setIsCentered(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const centerWindow = () => {
      const width = 800;
      const height = 520;
      const x = (window.innerWidth - width) / 2;
      const y = (window.innerHeight - height) / 2;
      setPosition({ x: Math.max(0, x), y: Math.max(0, y) });
    };

    if (isCentered) {
      centerWindow();
    }

    window.addEventListener('resize', centerWindow);

    return () => {
      window.removeEventListener('resize', centerWindow);
    };
  }, [isCentered]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '800px',
        height: '520px',
        backgroundColor: '#1e1e1e',
        border: '1px solid #3c3c3c',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        userSelect: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #3c3c3c',
          backgroundColor: '#252526',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>📤</span>
          <span style={{
            color: '#d4d4d4',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>文件传输</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#858585',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#d4d4d4';
            e.currentTarget.style.backgroundColor = '#3c3c3c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#858585';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>
      </div>

      <div style={{
        display: 'flex',
        borderBottom: '1px solid #3c3c3c',
        backgroundColor: '#252526'
      }}>
        {(['active', 'queue', 'paused', 'failed', 'completed'] as TabType[]).map((tab) => {
          const tabLabels = {
            active: '进行中',
            queue: '队列中',
            paused: '已暂停',
            failed: '失败',
            completed: '已完成'
          };
          const count = tab === 'active'
            ? transferTasks.filter(t => t.status === 'transferring').length
            : tab === 'queue'
            ? transferTasks.filter(t => t.status === 'pending').length
            : tab === 'paused'
            ? transferTasks.filter(t => t.status === 'paused').length
            : tab === 'failed'
            ? transferTasks.filter(t => t.status === 'failed').length
            : transferTasks.filter(t => t.status === 'completed').length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#0e639c' : '#858585',
                cursor: 'pointer',
                fontSize: '13px',
                borderBottom: activeTab === tab ? '2px solid #0e639c' : '2px solid transparent',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tabLabels[tab]}
              {count > 0 && (
                <span style={{
                  backgroundColor: activeTab === tab ? '#0e639c' : '#3c3c3c',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }} className="file-browser-scrollbar">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
          padding: '10px 16px',
          borderBottom: '1px solid #3c3c3c',
          backgroundColor: '#252526',
          color: '#858585',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          <div>名称</div>
          <div>连接</div>
          <div>状态</div>
          <div>信息</div>
          <div>操作</div>
        </div>

        {getFilteredTasks().length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#858585',
            padding: '40px'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>
              🌤️
            </div>
            <div style={{ fontSize: '14px' }}>
              暂无数据
            </div>
          </div>
        ) : (
          getFilteredTasks().map((task) => (
            <TransferTaskItem
              key={task.id}
              task={task}
              onPause={onPauseTask}
              onResume={onResumeTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

      <style>{`
        .file-item-hover:hover {
          background-color: #2a2d2e !important;
        }

        .file-browser-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .file-browser-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .file-browser-scrollbar::-webkit-scrollbar-thumb {
          background: #3c3c3c;
          border-radius: 5px;
        }

        .file-browser-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4c4c4c;
        }
      `}</style>
    </div>
  );
};

export default FileTransferManager;