import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../styles/ThemeContext';

interface BackgroundSelectorProps {
  onClose: () => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ onClose }) => {
  const { updateBackground } = useTheme();
  const [currentBackground, setCurrentBackground] = useState<string>('./default.png');
  const [backgrounds, setBackgrounds] = useState<string[]>([
    './background_pictures/FragPunk游戏海报3840_2160.jpg',
    './background_pictures/拾光_中转站_685a0dd18fb6a08a.jpg',
    './background_pictures/拾光_中转站_b05b9d5ad24f4333.jpg',
    './background_pictures/拾光_中转站_cd0db773eb2dc1b0.jpg',
    './background_pictures/拾光_中转站_e05ebd93369ce542.jpg',
    './background_pictures/拾光_周度精选_0f31d889bd773c2e.jpg',
    './background_pictures/拾光_周度精选_165c1f99d53d37d5.jpg',
    './background_pictures/拾光_周度精选_1c65880ded50f92e.jpg',
    './background_pictures/拾光_周度精选_2190e97d1adc6259.jpg',
    './background_pictures/拾光_周度精选_32be392dd7964f94.jpg',
    './background_pictures/拾光_周度精选_371351206c419e50.jpg',
    './background_pictures/拾光_周度精选_4768f506b8331305.jpg',
    './background_pictures/拾光_周度精选_59a4c624eee8318a.jpg',
    './background_pictures/拾光_周度精选_62b1522c475ac8fc.jpg',
    './background_pictures/拾光_周度精选_84d955e3913f1a3e.jpg',
    './background_pictures/拾光_周度精选_ab50601615cbad2b.jpg',
    './background_pictures/拾光_周度精选_d45dd55bed75f892.jpg',
    './background_pictures/拾光_周度精选_e2189124fdd8f467.jpg',
    './background_pictures/拾光_周度精选_e5b75945c042bfb1.jpg',
    './background_pictures/拾光_周度精选_f6c40597f933a2d6.jpg',
    './background_pictures/拾光_周度精选_fe85a21ba86081db.jpg',
    './background_pictures/拾光_壁纸汇_e16f6202eb5bd42f.jpg',   
    './background_pictures/拾光_彼岸图网_6b17e2152a7fe9f2.jpg',
    './background_pictures/拾光_轻壁纸_b506c02718d4b29b.jpg',
    './background_pictures/拾光_轻壁纸_f87de1fd3d3c7a01.jpg',
    './background_pictures/由内而外2字符海报超宽m.jpg'
  ]);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const saved = localStorage.getItem('app-background');
    if (saved) {
      try {
        const bg = JSON.parse(saved);
        if (bg.image) {
          setCurrentBackground(bg.image);
        }
      } catch (e) {
        console.error('Failed to parse saved background:', e);
      }
    }
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: var(--bg-tertiary);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--accent-color);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary);
      }
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: var(--accent-color) var(--bg-tertiary);
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
      }
    };
  }, []);

  const handleBackgroundChange = (imagePath: string) => {
    setCurrentBackground(imagePath);
    updateBackground({
      image: imagePath,
      blur: 0,
      opacity: 1,
      brightness: 1
    });
  };

  return (
    <div ref={containerRef} style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '320px',
      maxWidth: '480px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <span style={{
          color: 'var(--text-primary)',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          背景图片
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>

      <div className="custom-scrollbar" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '8px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            onClick={() => handleBackgroundChange(bg)}
            style={{
              position: 'relative',
              aspectRatio: '16/9',
              borderRadius: '4px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: currentBackground === bg
                ? '2px solid var(--accent-color)'
                : '2px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img
              src={bg}
              alt={`背景 ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {currentBackground === bg && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '12px',
        paddingTop: '8px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        点击图片切换背景
      </div>
    </div>
  );
};

export default BackgroundSelector;