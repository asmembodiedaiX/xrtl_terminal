import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import TerminalPanel from './TerminalPanel';
import StatusBar from './StatusBar';

const MainLayout: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: '#1e1e1e',
      overflow: 'hidden'
    }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TerminalPanel />
          <StatusBar />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
