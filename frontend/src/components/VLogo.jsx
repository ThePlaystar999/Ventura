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
        {/* Left arm gradient - dark blue outer to mid blue inner */}
        <linearGradient id="leftArmGrad" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="40%" stopColor="#1976D2" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
        
        {/* Right arm outer gradient - dark blue to medium */}
        <linearGradient id="rightArmOuterGrad" x1="100%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#0D47A1" />
          <stop offset="50%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#1E88E5" />
        </linearGradient>
        
        {/* Right arm inner/highlight gradient - bright blue to light */}
        <linearGradient id="rightArmInnerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#42A5F5" />
          <stop offset="40%" stopColor="#64B5F6" />
          <stop offset="100%" stopColor="#90CAF9" />
        </linearGradient>
        
        {/* Highlight line gradient - almost white */}
        <linearGradient id="highlightGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BBDEFB" />
          <stop offset="100%" stopColor="#E3F2FD" />
        </linearGradient>
      </defs>
      
      {/* Left arm of the V - solid darker plane */}
      <polygon
        points="10,12 42,12 50,90 50,90"
        fill="url(#leftArmGrad)"
      />
      
      {/* Right arm outer plane - darker section */}
      <polygon
        points="58,12 90,12 50,90 50,90"
        fill="url(#rightArmOuterGrad)"
      />
      
      {/* Right arm inner plane - brighter highlight section */}
      {/* This creates the diagonal cut effect */}
      <polygon
        points="68,12 90,12 90,28 56,75"
        fill="url(#rightArmInnerGrad)"
      />
      
      {/* Diagonal highlight line - the bright edge */}
      <path
        d="M68,12 L90,28 L88,32 L66,16 Z"
        fill="url(#highlightGrad)"
      />
    </svg>
  );
};

export default VLogo;
