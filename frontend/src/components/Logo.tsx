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
  const gradientId = `${idPrefix}-brand-gradient`;

  return (
    <svg
      className={`${sizeClass} shrink-0`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="50%" stopColor="#FF8A00" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      
      {/* 
        LF Monogram Path:
        Continuous geometric ribbon forming 'L' on the left and 'F' on the right
      */}
      <path
        d="M22 18 C22 14, 28 14, 32 18 V64 C32 78, 44 84, 52 84 C64 84, 68 76, 68 64 V56 H90 C95 56, 95 44, 90 44 H68 V38 C68 28, 76 26, 86 26 H92 C96 26, 96 16, 92 16 H84 C66 16, 52 28, 52 44 V64 C52 70, 48 72, 42 72 C36 72, 32 68, 32 62 V18 Z"
        fill={`url(#${gradientId})`}
      />
      {/* Middle F Crossbar */}
      <path
        d="M52 56 H82 C86 56, 86 46, 82 46 H52 V56 Z"
        fill={`url(#${gradientId})`}
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
      {/* Geometric Orange Gradient LF Monogram Icon */}
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
