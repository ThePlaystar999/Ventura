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
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="v-logo"
    >
      <defs>
        {/* Left wing gradient - dark to bright blue */}
        <linearGradient id="leftWingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0D47A1" />
          <stop offset="50%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#1E88E5" />
        </linearGradient>
        
        {/* Right wing upper gradient */}
        <linearGradient id="rightWingUpperGrad" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="50%" stopColor="#1976D2" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
        
        {/* Right wing inner highlight - white to light blue */}
        <linearGradient id="innerHighlightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E3F2FD" />
          <stop offset="70%" stopColor="#BBDEFB" />
          <stop offset="100%" stopColor="#90CAF9" />
        </linearGradient>
      </defs>
      
      {/* Shape 1: Left Wing - larger dark blue trapezoid */}
      <polygon
        points="8,10 44,10 50,90 50,90"
        fill="url(#leftWingGrad)"
      />
      
      {/* Shape 2: Right Wing Upper - upper part of right arm */}
      <polygon
        points="56,10 92,10 50,90"
        fill="url(#rightWingUpperGrad)"
      />
      
      {/* Shape 3: Right Wing Inner - the bright white/light blue elongated highlight */}
      <polygon
        points="70,10 92,10 92,30 55,80"
        fill="url(#innerHighlightGrad)"
      />
    </svg>
  );
};

export default VLogo;
