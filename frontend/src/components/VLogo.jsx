import React from 'react';

const VLogo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { width: 44, height: 44 },
    md: { width: 64, height: 64 },
    lg: { width: 120, height: 120 },
    xl: { width: 180, height: 180 },
    hero: { width: 280, height: 280 }
  };

  const { width, height } = sizes[size] || sizes.md;

  return (
    <img 
      src="/ventura-logo.png" 
      alt="Ventura" 
      width={width} 
      height={height}
      className={className}
      data-testid="v-logo"
      style={{ 
        objectFit: 'contain',
        imageRendering: 'crisp-edges'
      }}
    />
  );
};

export default VLogo;
