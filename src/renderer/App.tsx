import React from 'react';
import { TerminalProvider } from './stores/terminalStore';
import { ThemeProvider } from './styles/ThemeContext';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TerminalProvider>
        <MainLayout />
      </TerminalProvider>
    </ThemeProvider>
  );
};

export default App;