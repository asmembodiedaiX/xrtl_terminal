import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import TerminalPanel from './TerminalPanel';
import StatusBar from './StatusBar';
import { useTheme } from '../styles/ThemeContext';

const MainLayout: React.FC = () => {
  const { currentTheme } = useTheme();
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [bgImageEnabled, setBgImageEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
  };

  useEffect(() => {
    const checkBgImage = () => {
      const enabled = document.documentElement.style.getPropertyValue('--bg-image-enabled');
      setBgImageEnabled(enabled === 'true');
    };
    
    checkBgImage();
    
    const observer = new MutationObserver(checkBgImage);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      let newWidth = startWidthRef.current + deltaX;

      newWidth = Math.max(180, Math.min(500, newWidth));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background image layer */}
      {bgImageEnabled && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'var(--bg-image)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(var(--bg-blur)) brightness(var(--bg-brightness))',
            opacity: 'var(--bg-opacity)',
            zIndex: 0
          }}
        />
      )}
      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header />
        <div ref={containerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: sidebarWidth, minWidth: 180, maxWidth: 500 }}>
          <Sidebar />
        </div>

        <div
          onMouseDown={handleMouseDown}
          style={{
            width: 6,
            backgroundColor: isDragging ? 'var(--accent-color)' : 'var(--border-color)',
            cursor: 'col-resize',
            transition: isDragging ? 'none' : 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: isDragging ? 'var(--accent-color)' : 'var(--text-secondary)',
                  transition: isDragging ? 'none' : 'background-color 0.2s'
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TerminalPanel />
          <StatusBar />
        </div>
      </div>
      </div>
    </div>
  );
};

export default MainLayout;