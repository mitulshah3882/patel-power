import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function PatelPowerLogo({ className = '', size = 48, showText = false }: LogoProps) {
  if (showText) {
    return (
      <svg 
        viewBox="0 0 200 200" 
        width={size} 
        height={size} 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="boltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <polygon 
          points="110,20 70,95 95,95 85,180 140,85 110,85" 
          fill="url(#boltGradient)" 
        />
        <text 
          x="55" 
          y="175" 
          textAnchor="middle" 
          fontSize="14" 
          fontWeight="800" 
          fill="#1f2937" 
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          PATEL
        </text>
        <text 
          x="130" 
          y="175" 
          textAnchor="middle" 
          fontSize="14" 
          fontWeight="800" 
          fill="#f97316" 
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          POWER
        </text>
      </svg>
    );
  }

  return (
    <svg 
      viewBox="0 0 512 512" 
      width={size} 
      height={size} 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="boltGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <polygon 
        points="282,46 180,242 244,242 218,466 358,218 282,218" 
        fill="url(#boltGradientIcon)" 
      />
    </svg>
  );
}

export function PatelPowerIcon({ className = '', size = 32 }: Omit<LogoProps, 'showText'>) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      width={size} 
      height={size} 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="boltGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <polygon 
        points="282,46 180,242 244,242 218,466 358,218 282,218" 
        fill="url(#boltGradientSmall)" 
      />
    </svg>
  );
}

export default PatelPowerLogo;
