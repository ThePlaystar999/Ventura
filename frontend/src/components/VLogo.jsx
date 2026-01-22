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
        {/* Left arm gradient */}
        <linearGradient id="leftArm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1976D2" />
          <stop offset="60%" stopColor="#2196F3" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
        
        {/* Right arm dark section */}
        <linearGradient id="rightArmDark" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0D47A1" />
          <stop offset="50%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#1976D2" />
        </linearGradient>
        
        {/* Right arm light highlight plane */}
        <linearGradient id="rightArmLight" x1="50%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#42A5F5" />
          <stop offset="40%" stopColor="#64B5F6" />
          <stop offset="80%" stopColor="#90CAF9" />
          <stop offset="100%" stopColor="#BBDEFB" />
        </linearGradient>
        
        {/* Highlight edge */}
        <linearGradient id="highlightEdge" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#90CAF9" />
          <stop offset="100%" stopColor="#E3F2FD" />
        </linearGradient>
      </defs>
      
      {/* Left arm of the V */}
      <polygon
        points="12,5 46,5 50,95"
        fill="url(#leftArm)"
      />
      
      {/* Right arm - dark outer section */}
      <polygon
        points="54,5 88,5 50,95"
        fill="url(#rightArmDark)"
      />
      
      {/* Right arm - light highlight plane (the 3D cut) */}
      <polygon
        points="66,5 88,5 88,25 54,78"
        fill="url(#rightArmLight)"
      />
      
      {/* Diagonal highlight line edge */}
      <polygon
        points="66,5 68,5 88,27 88,25"
        fill="url(#highlightEdge)"
      />
    </svg>
  );
};

export default VLogo;
