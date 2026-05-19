import React, { useState } from 'react';

const Header: React.FC = () => {
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const iconStyle = {
    background: 'none' as const,
    border: 'none' as const,
    color: '#858585' as const,
    cursor: 'pointer' as const,
    fontSize: 16 as const,
    padding: '4px 8px' as const,
    borderRadius: 4 as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 24 as const,
    height: 24 as const,
    transition: 'background-color 0.1s' as const
  };

  const getButtonStyle = (btnId: string, customColor?: string, customBg?: string) => {
    const isHovered = hoveredBtn === btnId;
    let bgColor = customBg || 'transparent';

    if (isHovered && !customBg) {
      bgColor = '#3c3c3c';
    }

    return {
      ...iconStyle,
      color: customColor || '#858585',
      backgroundColor: bgColor
    };
  };

  const headerStyle: any = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
    backgroundColor: '#252526',
    borderBottom: '1px solid #3c3c3c',
    padding: '0 8px',
    WebkitAppRegion: 'drag',
    cursor: 'default'
  };

  const buttonsStyle: any = {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    WebkitAppRegion: 'no-drag'
  };

  return (
    <div style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#569cd6', fontSize: 14, fontWeight: 600 }}>XRTL Terminal</span>
      </div>

      <div style={buttonsStyle}>
        <button
          style={getButtonStyle('search', '#4ec9b0')}
          title="搜索 (Ctrl+Shift+F)"
          onMouseEnter={() => setHoveredBtn('search')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          🔍
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          backgroundColor: '#007acc',
          padding: '2px 8px',
          borderRadius: 4,
          marginLeft: 4
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>⊕</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>Plus</span>
        </div>

        <div style={{ width: 1, height: 16, backgroundColor: '#3c3c3c', margin: '0 4px' }} />

        <button
          style={getButtonStyle('git')}
          title="源代码管理"
          onMouseEnter={() => setHoveredBtn('git')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          ⑂
        </button>

        <button
          style={getButtonStyle('run')}
          title="运行和调试 (Ctrl+Shift+D)"
          onMouseEnter={() => setHoveredBtn('run')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          ▷
        </button>

        <button
          style={getButtonStyle('ext')}
          title="扩展 (Ctrl+Shift+X)"
          onMouseEnter={() => setHoveredBtn('ext')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          ≡
        </button>

        <div style={{ width: 1, height: 16, backgroundColor: '#3c3c3c', margin: '0 4px' }} />

        <button
          style={getButtonStyle('view')}
          title="打开视图"
          onMouseEnter={() => setHoveredBtn('view')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          :
        </button>

        <div style={{ width: 1, height: 16, backgroundColor: '#3c3c3c', margin: '0 4px' }} />

        <button
          style={getButtonStyle('new')}
          title="新建终端"
          onMouseEnter={() => setHoveredBtn('new')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          +
        </button>

        <button
          style={getButtonStyle('menu')}
          title="窗口控制"
          onMouseEnter={() => setHoveredBtn('menu')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          ⋮
        </button>
      </div>
    </div>
  );
};

export default Header;
