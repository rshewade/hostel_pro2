import { cn } from '../utils';
import { STATUS_BADGE_CLASSES } from '../constants';
import type { BaseComponentProps } from '../types';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  children: React.ReactNode;
}

const Badge = ({
  className,
  variant = 'default',
  size = 'md',
  rounded = false,
  children,
  ...props
}: BadgeProps) => {
  const badgeClasses = cn(
    // Base badge styles
    'inline-flex items-center font-medium',
    'border border-transparent',

    // Size variants
    {
      'px-2 py-0.5 text-xs': size === 'sm',
      'px-2.5 py-0.5 text-sm': size === 'md',
      'px-3 py-1 text-base': size === 'lg',
    },

    // Shape variants
    rounded ? 'rounded-full' : 'rounded-md',

    // Variant styles
    STATUS_BADGE_CLASSES[variant],

    // Custom classes
    className
  );

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export { Badge };