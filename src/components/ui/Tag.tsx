import { cn } from '../utils';
import { STATUS_BADGE_CLASSES } from '../constants';
import type { BaseComponentProps } from '../types';

export type TagVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface TagProps extends BaseComponentProps {
  variant?: TagVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Tag = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: TagProps) => {
  const tagClasses = cn(
    // Base tag styles
    'inline-flex items-center font-medium',
    'border border-transparent rounded-md',

    // Size variants
    {
      'px-2 py-0.5 text-xs': size === 'sm',
      'px-2.5 py-0.5 text-sm': size === 'md',
      'px-3 py-1 text-base': size === 'lg',
    },

    // Variant styles
    STATUS_BADGE_CLASSES[variant],

    // Custom classes
    className
  );

  return (
    <span className={tagClasses} {...props}>
      {children}
    </span>
  );
};

Tag.displayName = 'Tag';

export { Tag };