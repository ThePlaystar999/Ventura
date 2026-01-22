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
      viewBox="0 0 120 105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="v-logo"
    >
      <defs>
        <linearGradient id="vGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B4DBB" />
          <stop offset="50%" stopColor="#1E6AE1" />
          <stop offset="100%" stopColor="#A7C8FF" />
        </linearGradient>
        <linearGradient id="vGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#093c96" />
          <stop offset="100%" stopColor="#0B4DBB" />
        </linearGradient>
      </defs>
      {/* Main V shape */}
      <path
        d="M60 95L10 10H35L60 55L85 10H110L60 95Z"
        fill="url(#vGradient)"
      />
      {/* Inner highlight */}
      <path
        d="M60 75L30 20H42L60 50L78 20H90L60 75Z"
        fill="url(#vGradientDark)"
        opacity="0.3"
      />
      {/* Accent line */}
      <path
        d="M60 85L25 15H32L60 65L88 15H95L60 85Z"
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity="0.2"
      />
    </svg>
  );
};

export default VLogo;
