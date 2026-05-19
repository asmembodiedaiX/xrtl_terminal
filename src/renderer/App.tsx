import React from 'react';
import { TerminalProvider } from './stores/terminalStore';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  return (
    <TerminalProvider>
      <MainLayout />
    </TerminalProvider>
  );
};

export default App;
