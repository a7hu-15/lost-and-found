import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  titleText?: string;
  subtitleText?: string;
  variant?: 'dark' | 'light' | 'monochrome';
}

export const LogoIcon: React.FC<{ sizeClass?: string; idPrefix?: string }> = ({ sizeClass = 'w-7 h-7', idPrefix = 'lf' }) => {
  const mainGradientId = `${idPrefix}-main-grad`;
  const foldGradientId = `${idPrefix}-fold-grad`;

  return (
    <svg
      className={`${sizeClass} shrink-0`}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Primary Orange Gradient */}
        <linearGradient id={mainGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="45%" stopColor="#FF8A00" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>

        {/* Ribbon Fold Overlay Gradient for 3D Overlap Shadow Effect */}
        <linearGradient id={foldGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E65100" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF8A00" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* 
        LF Monogram Ribbon Path:
        Left L-stem, rounded bottom curve, F-stem, F-top wing, and middle F-crossbar
      */}

      {/* Main Continuous LF Ribbon */}
      <path
        d="M 28 35 
           C 28 20, 55 18, 62 38 
           V 145 
           C 62 185, 95 200, 115 200 
           C 142 200, 155 182, 155 152 
           V 135 
           H 190 
           C 202 135, 202 110, 190 110 
           H 155 
           V 80 
           C 155 60, 175 56, 195 56 
           C 205 56, 205 38, 195 38 
           H 175 
           C 138 38, 115 62, 115 95 
           V 148 
           C 115 162, 105 166, 92 166 
           C 78 166, 68 158, 68 142 
           V 35 Z"
        fill={`url(#${mainGradientId})`}
      />

      {/* Middle F Crossbar */}
      <path
        d="M 115 135 H 180 C 190 135, 190 110, 180 110 H 115 V 135 Z"
        fill={`url(#${mainGradientId})`}
      />

      {/* Ribbon Shadow Overlap Fold Effect */}
      <path
        d="M 68 142 C 68 158, 78 166, 92 166 C 105 166, 115 162, 115 148 V 160 C 115 178, 98 190, 80 178 C 68 170, 68 155, 68 142 Z"
        fill={`url(#${foldGradientId})`}
      />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  titleText = 'Cloud',
  subtitleText = 'Lost & Found',
  variant = 'dark'
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm sm:text-base',
    lg: 'text-lg sm:text-xl'
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs sm:text-sm'
  };

  const isLight = variant === 'light';
  const isMono = variant === 'monochrome';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Orange Gradient LF Monogram Icon */}
      <LogoIcon sizeClass={iconSizes[size]} idPrefix={`logo-${size}`} />

      {/* Brand Text Lockup */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-extrabold tracking-tight ${titleSizes[size]} ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            {titleText}
          </span>
          <span className={`font-semibold tracking-wide ${subtitleSizes[size]} ${isMono ? (isLight ? 'text-zinc-700' : 'text-zinc-300') : 'text-[#FF8A00]'}`}>
            {subtitleText}
          </span>
        </div>
      )}
    </div>
  );
};
