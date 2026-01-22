import React from 'react';

const VLogo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { width: 32, height: 28 },
    md: { width: 48, height: 42 },
    lg: { width: 80, height: 70 },
    xl: { width: 120, height: 105 },
    hero: { width: 180, height: 157 }
  };

  const { width, height } = sizes[size] || sizes.md;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 87"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="v-logo"
    >
      <defs>
        {/* Main gradient - deep blue to bright blue */}
        <linearGradient id="vMainGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0B4DBB" />
          <stop offset="40%" stopColor="#1565C0" />
          <stop offset="70%" stopColor="#1E88E5" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
        {/* Left side darker gradient */}
        <linearGradient id="vLeftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="50%" stopColor="#0D47A1" />
          <stop offset="100%" stopColor="#0B4DBB" />
        </linearGradient>
        {/* Right side lighter gradient */}
        <linearGradient id="vRightGradient" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#42A5F5" />
          <stop offset="30%" stopColor="#2196F3" />
          <stop offset="70%" stopColor="#1976D2" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
        {/* Accent gradient for the cut line area */}
        <linearGradient id="vAccentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
      </defs>
      
      {/* Left arm of the V */}
      <path
        d="M5 5L50 82L35 82L5 25L5 5Z"
        fill="url(#vLeftGradient)"
      />
      
      {/* Main body - left side */}
      <path
        d="M5 5L35 5L50 32L35 82L5 25L5 5Z"
        fill="url(#vMainGradient)"
      />
      
      {/* Right arm of the V - lower part */}
      <path
        d="M50 82L65 82L95 25L95 5L75 5L50 45L50 82Z"
        fill="url(#vRightGradient)"
      />
      
      {/* Right arm upper accent - creates the diagonal cut effect */}
      <path
        d="M75 5L95 5L95 25L67 25L75 5Z"
        fill="url(#vAccentGradient)"
      />
      
      {/* Diagonal accent line - the sharp white cut */}
      <path
        d="M72 8L93 22L91 25L68 25L65 20L72 8Z"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
      />
      
      {/* Highlight on the left edge */}
      <path
        d="M8 8L32 8L30 12L8 12Z"
        fill="rgba(255,255,255,0.15)"
      />
    </svg>
  );
};

export default VLogo;
