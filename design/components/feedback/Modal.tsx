'use client';

import { useEffect, forwardRef, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { ANIMATIONS, Z_INDEX } from '../constants';
import type { ModalProps } from '../types';

const Modal = forwardRef<HTMLDivElement, ModalProps>(({
  className,
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
  footer,
  variant = 'default',
  onConfirm,
  confirmText,
  cancelText,
  confirmLoading = false,
  confirmDisabled = false,
  ...props
}, ref) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const isConfirmationMode = variant === 'confirmation' || variant === 'destructive';
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closable && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closable, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closable && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalClasses = cn(
    // Base modal styles
    'fixed inset-0 z-50 flex items-center justify-center',
    'animate-in fade-in duration-200',

    // Backdrop
    'bg-black bg-opacity-50',

    // Custom classes
    className
  );

  const dialogClasses = cn(
    // Dialog styles
    'relative bg-white shadow-xl',
    'animate-in zoom-in-95 duration-200',

    // Size variants
    size === 'full' ? [
      'w-screen h-screen max-w-none max-h-none',
      'rounded-none',
    ] : [
      'rounded-lg',
      'max-h-[90vh] overflow-auto',
      {
        'max-w-sm w-full mx-4': size === 'sm',
        'max-w-md w-full mx-4': size === 'md',
        'max-w-lg w-full mx-4': size === 'lg',
        'max-w-xl w-full mx-4': size === 'xl',
      }
    ]
  );

  const contentClasses = cn(
    // Content padding
    'p-6',

    // If title exists, add top padding to content
    title && 'pt-0'
  );

  return createPortal(
    <div
      ref={ref}
      className={modalClasses}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      {...props}
    >
      <div className={dialogClasses}>
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between p-6 pb-0">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-navy-900 pr-4"
              >
                {title}
              </h2>
            )}

            {closable && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'p-1 rounded-md text-gray-400 hover:text-gray-600',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500',
                  'transition-colors duration-200'
                )}
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={contentClasses}>
          {children}
        </div>

        {/* Footer - either custom footer or confirmation mode buttons */}
        {(footer || isConfirmationMode) && (
          <div className="flex items-center justify-end gap-3 p-6 pt-0 border-t-0">
            {footer ? (
              footer
            ) : isConfirmationMode ? (
              <>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={confirmLoading}
                >
                  {cancelText || 'Cancel'}
                </Button>
                <Button
                  ref={confirmButtonRef}
                  variant={variant === 'destructive' ? 'destructive' : 'primary'}
                  onClick={onConfirm}
                  loading={confirmLoading}
                  disabled={confirmDisabled}
                >
                  {confirmText || (variant === 'destructive' ? 'Delete' : 'Confirm')}
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
});

Modal.displayName = 'Modal';

export { Modal };