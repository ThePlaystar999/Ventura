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
        {/* Left arm gradient - darker outer edge to lighter inner */}
        <linearGradient id="leftArmGrad" x1="0%" y1="0%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#1976D2" />
          <stop offset="50%" stopColor="#2196F3" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
        
        {/* Right arm main body gradient */}
        <linearGradient id="rightArmGrad" x1="100%" y1="0%" x2="20%" y2="80%">
          <stop offset="0%" stopColor="#0D47A1" />
          <stop offset="40%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#1E88E5" />
        </linearGradient>
        
        {/* Right arm highlight section - the lighter inner plane */}
        <linearGradient id="highlightPlaneGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="50%" stopColor="#90CAF9" />
          <stop offset="100%" stopColor="#BBDEFB" />
        </linearGradient>
      </defs>
      
      {/* Left arm of the V */}
      <polygon
        points="15,8 45,8 50,92 50,92"
        fill="url(#leftArmGrad)"
      />
      
      {/* Right arm main body */}
      <polygon
        points="55,8 85,8 50,92"
        fill="url(#rightArmGrad)"
      />
      
      {/* Right arm highlight plane - creates the 3D cut effect */}
      <polygon
        points="62,8 85,8 85,22 53,72"
        fill="url(#highlightPlaneGrad)"
      />
    </svg>
  );
};

export default VLogo;
