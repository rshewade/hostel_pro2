'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

export interface SidePanelProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const SidePanel = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  size = 'md',
  closable = true,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  header,
  footer,
  children,
  className,
  ...props
}: SidePanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // Focus management and escape key
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the panel
      panelRef.current?.focus();

      // Add escape key listener
      document.addEventListener('keydown', handleEscape);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';

      // Return focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const panelContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        position === 'right' ? 'justify-end' : 'justify-start'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sidepanel-title' : undefined}
    >
      {/* Overlay */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative w-full flex flex-col',
          'bg-white shadow-xl',
          'transform transition-transform duration-300 ease-in-out',
          sizeClasses[size],
          position === 'right'
            ? 'animate-slide-in-right'
            : 'animate-slide-in-left',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          {header || (
            title && (
              <h2
                id="sidepanel-title"
                className="text-lg font-semibold text-navy-900"
              >
                {title}
              </h2>
            )
          )}

          {closable && (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'rounded-md p-2 text-gray-400',
                'hover:text-gray-500 hover:bg-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
                'transition-colors'
              )}
              aria-label="Close panel"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal
  if (typeof window !== 'undefined') {
    return createPortal(panelContent, document.body);
  }

  return null;
};

SidePanel.displayName = 'SidePanel';

export { SidePanel };
