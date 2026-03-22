'use client';

import { useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils';
import { ANIMATIONS, Z_INDEX } from '../constants';
import type { ToastProps } from '../types';

const Toast = forwardRef<HTMLDivElement, ToastProps>(({
  className,
  type = 'default',
  message,
  duration = 5000,
  onClose,
  ...props
}, ref) => {
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const toastClasses = cn(
    // Base toast styles
    'flex items-start space-x-3 p-4 rounded-md border',
    'animate-in slide-in-from-right-2 fade-in duration-300',

    // Type variants
    {
      'bg-gray-50 border-gray-200 text-gray-900': type === 'default',
      'bg-green-50 border-green-200 text-green-900': type === 'success',
      'bg-yellow-50 border-yellow-200 text-yellow-900': type === 'warning',
      'bg-red-50 border-red-200 text-red-900': type === 'error',
      'bg-blue-50 border-blue-200 text-blue-900': type === 'info',
    },

    // Custom classes
    className
  );

  const iconClasses = cn(
    'flex-shrink-0 w-5 h-5',
    {
      'text-gray-400': type === 'default',
      'text-green-400': type === 'success',
      'text-yellow-400': type === 'warning',
      'text-red-400': type === 'error',
      'text-blue-400': type === 'info',
    }
  );

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return createPortal(
    <div
      ref={ref}
      className={toastClasses}
      role="alert"
      {...props}
    >
      {getIcon()}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'flex-shrink-0 ml-4 p-1 rounded-md',
            'text-gray-400 hover:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-gold-500',
            'transition-colors duration-200'
          )}
          aria-label="Close toast"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>,
    document.body
  );
});

Toast.displayName = 'Toast';

export { Toast };