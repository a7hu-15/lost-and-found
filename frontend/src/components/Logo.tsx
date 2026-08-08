import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  titleText?: string;
  subtitleText?: string;
  variant?: 'dark' | 'light' | 'monochrome';
}

export const LogoIcon: React.FC<{ sizeClass?: string }> = ({ sizeClass = 'w-8 h-8' }) => {
  return (
    <img
      src="/brand/lf-logo.png"
      alt="LF Monogram Logo"
      className={`${sizeClass} rounded-lg object-contain shrink-0`}
    />
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
    sm: 'w-7 h-7',
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
      {/* Master LF Logo Image Asset */}
      <LogoIcon sizeClass={iconSizes[size]} />

      {/* Separate Text Lockup */}
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
