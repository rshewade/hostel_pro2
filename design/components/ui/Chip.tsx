import { cn } from '../utils';
import { STATUS_BADGE_CLASSES } from '../constants';
import type { BaseComponentProps } from '../types';

export type ChipVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface ChipProps extends BaseComponentProps {
  variant?: ChipVariant;
  size?: 'sm' | 'md' | 'lg';
  onClose?: () => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Chip = ({
  className,
  variant = 'default',
  size = 'md',
  onClose,
  disabled = false,
  leftIcon,
  children,
  ...props
}: ChipProps) => {
  const chipClasses = cn(
    // Base chip styles
    'inline-flex items-center font-medium',
    'border border-transparent rounded-full',
    'transition-colors duration-200',

    // Size variants
    {
      'px-2 py-1 text-xs gap-1': size === 'sm',
      'px-2.5 py-1 text-sm gap-1.5': size === 'md',
      'px-3 py-1.5 text-base gap-2': size === 'lg',
    },

    // Interactive states
    !disabled && !onClose && 'cursor-default',
    !disabled && onClose && 'cursor-pointer hover:opacity-80',

    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed',

    // Variant styles
    STATUS_BADGE_CLASSES[variant],

    // Custom classes
    className
  );

  return (
    <span className={chipClasses} {...props}>
      {leftIcon && (
        <span className="inline-flex items-center">
          {leftIcon}
        </span>
      )}

      <span className="inline-flex items-center">
        {children}
      </span>

      {onClose && !disabled && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'hover:bg-black hover:bg-opacity-10',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500',
            {
              'w-3 h-3': size === 'sm',
              'w-4 h-4': size === 'md',
              'w-5 h-5': size === 'lg',
            }
          )}
          aria-label="Remove"
        >
          <svg
            className={cn({
              'w-2.5 h-2.5': size === 'sm',
              'w-3 h-3': size === 'md',
              'w-3.5 h-3.5': size === 'lg',
            })}
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
    </span>
  );
};

Chip.displayName = 'Chip';

export { Chip };