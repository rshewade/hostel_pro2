import { forwardRef } from 'react';
import { cn } from '../utils';
import { BUTTON_VARIANT_CLASSES } from '../constants';
import type { BaseComponentProps, ButtonVariant } from '../types';

// Extended button sizes including xs
export type ExtendedButtonSize = 'xs' | 'sm' | 'md' | 'lg';

// Size classes with xs added
const BUTTON_SIZE_CLASSES: Record<ExtendedButtonSize, string> = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};

// Icon-only size classes (square buttons)
const ICON_ONLY_SIZE_CLASSES: Record<ExtendedButtonSize, string> = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
};

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ExtendedButtonSize;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  truncate?: boolean;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  'aria-label'?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  active = false,
  iconOnly = false,
  fullWidth = false,
  truncate = false,
  type = 'button',
  leftIcon,
  rightIcon,
  icon,
  onClick,
  children,
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  // Determine if this is an icon-only button
  const isIconOnly = iconOnly || (icon && !children);

  const buttonClasses = cn(
    // Base button styles
    'inline-flex items-center justify-center font-medium rounded-md border border-transparent',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'transition-colors duration-200',

    // Active/pressed state
    active && 'ring-2 ring-offset-1',

    // Size variants
    isIconOnly ? ICON_ONLY_SIZE_CLASSES[size] : BUTTON_SIZE_CLASSES[size],

    // Variant styles
    BUTTON_VARIANT_CLASSES[variant],

    // Active ring color based on variant
    active && variant === 'primary' && 'ring-gold-600',
    active && variant === 'secondary' && 'ring-navy-500',
    active && variant === 'ghost' && 'ring-navy-400',
    active && variant === 'destructive' && 'ring-red-600',

    // Loading state
    loading && 'cursor-wait',

    // Full width
    fullWidth && 'w-full',

    // Custom classes
    className
  );

  const isDisabled = disabled || loading;

  // Icon size based on button size
  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={buttonClasses}
      aria-label={ariaLabel}
      aria-pressed={active ? 'true' : undefined}
      {...props}
    >
      {loading && (
        <svg
          className={cn('animate-spin', iconSizeClasses[size], !isIconOnly && '-ml-1 mr-2')}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Icon-only mode */}
      {!loading && isIconOnly && icon && (
        <span className={cn('inline-flex items-center', iconSizeClasses[size])}>
          {icon}
        </span>
      )}

      {/* Regular button with optional icons */}
      {!loading && !isIconOnly && (
        <>
          {leftIcon && (
            <span className={cn('mr-2 inline-flex items-center', iconSizeClasses[size])}>
              {leftIcon}
            </span>
          )}

          <span className={cn(
            'inline-flex items-center',
            truncate && 'truncate max-w-[200px]'
          )}>
            {children}
          </span>

          {rightIcon && (
            <span className={cn('ml-2 inline-flex items-center', iconSizeClasses[size])}>
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };