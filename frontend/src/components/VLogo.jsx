import React from 'react';

const VLogo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 80, height: 80 },
    xl: { width: 120, height: 120 },
    hero: { width: 180, height: 180 }
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
      style={{ objectFit: 'contain' }}
    />
  );
};

export default VLogo;
