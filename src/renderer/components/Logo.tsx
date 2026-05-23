import React from 'react';

const Logo: React.FC<{ size?: number }> = ({ size = 16 }) => {
  return (
    <img
      src="../icons/logo.png"
      alt="XRTL"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '4px'
      }}
    />
  );
};

export default Logo;