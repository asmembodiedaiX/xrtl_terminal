import React from 'react';
import { useTerminalStore } from '../stores/terminalStore';

const StatusBar: React.FC = () => {
  const { sessions, activeSessionId } = useTerminalStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const getStatusText = () => {
    if (!activeSession) return 'No Session';
    switch (activeSession.status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    if (!activeSession) return '#858585';
    switch (activeSession.status) {
      case 'connected': return '#6a9955';
      case 'connecting': return '#cca700';
      default: return '#f14c4c';
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 22,
      backgroundColor: '#252526',
      padding: '0 16px',
      fontSize: 12,
      color: '#858585'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getStatusColor()
          }} />
          <span>{getStatusText()}</span>
        </div>
        {activeSession && (
          <span>SSH: {activeSession.name}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>UTF-8</span>
        <span>120x40</span>
        <span>XRTL Terminal v1.0.0</span>
      </div>
    </div>
  );
};

export default StatusBar;
