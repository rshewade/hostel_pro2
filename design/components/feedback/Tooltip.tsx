'use client';

import { useState } from 'react';
import { cn } from '../utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 w-64 p-3 rounded-lg shadow-lg text-xs',
            'bg-gray-900 text-white',
            'animate-in fade-in slide-in-from-bottom-2 duration-200',
            getPositionClasses()
          )}
          role="tooltip"
          aria-live="polite"
        >
          {content}
          <div className={cn(
            'absolute w-2 h-2 bg-gray-900',
            position === 'top' ? '-bottom-1 left-1/2 transform -translate-x-1/2 rotate-45' : '',
            position === 'bottom' ? '-top-1 left-1/2 transform -translate-x-1/2 rotate-45' : '',
            position === 'left' ? '-right-1 top-1/2 transform -translate-y-1/2 rotate-45' : '',
            position === 'right' ? '-left-1 top-1/2 transform -translate-y-1/2 rotate-45' : ''
          )} />
        </div>
      )}
    </div>
  );
}

interface InfoIconProps {
  size?: 'sm' | 'md' | 'lg';
}

export function InfoIcon({ size = 'md' }: InfoIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <svg
      className={cn('text-gray-500 cursor-help', sizeClasses[size])}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-label="Information"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

interface InfoTooltipProps {
  content: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InfoTooltip({ content, label, size = 'md' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position="top">
      <span className="inline-flex items-center gap-1 ml-1">
        <InfoIcon size={size} />
        {label && <span className="sr-only">{label}</span>}
      </span>
    </Tooltip>
  );
}
