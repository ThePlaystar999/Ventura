import React from 'react';

const VLogo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { width: 40, height: 40 },
    md: { width: 56, height: 56 },
    lg: { width: 100, height: 100 },
    xl: { width: 150, height: 150 },
    hero: { width: 220, height: 220 }
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
