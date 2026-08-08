import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Badge */}
      <div className={`${dimensions[size]} rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:border-zinc-500 transition-colors`}>
        <svg
          className={`${iconSizes[size]} text-blue-400`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Location Pin Outer */}
          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
          {/* Key Inner Hole */}
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>

      {/* Brand Text Header */}
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white tracking-tight leading-none">
          Lost &amp; Found
        </span>
        <span className="text-[10px] font-mono text-zinc-400 tracking-wider leading-tight mt-0.5">
          Campus Recovery
        </span>
      </div>
    </div>
  );
};
