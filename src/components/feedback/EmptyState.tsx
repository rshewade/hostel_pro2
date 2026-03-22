import { cn } from '../utils';
import { Button } from '../ui/Button';
import type { BaseComponentProps } from '../types';

export interface EmptyStateProps extends BaseComponentProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  };
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState = ({
  className,
  icon,
  title,
  description,
  action,
  size = 'md',
  ...props
}: EmptyStateProps) => {
  const containerClasses = cn(
    // Base container styles
    'flex flex-col items-center justify-center text-center',
    'py-12 px-4',

    // Size variants
    {
      'py-8 px-3': size === 'sm',
      'py-12 px-4': size === 'md',
      'py-16 px-6': size === 'lg',
    },

    // Custom classes
    className
  );

  const iconClasses = cn(
    'text-gray-400 mb-4',
    {
      'w-8 h-8': size === 'sm',
      'w-12 h-12': size === 'md',
      'w-16 h-16': size === 'lg',
    }
  );

  const titleClasses = cn(
    'text-gray-900 font-medium mb-2',
    {
      'text-sm': size === 'sm',
      'text-base': size === 'md',
      'text-lg': size === 'lg',
    }
  );

  const descriptionClasses = cn(
    'text-gray-500 mb-6 max-w-sm',
    {
      'text-xs': size === 'sm',
      'text-sm': size === 'md',
      'text-base': size === 'lg',
    }
  );

  const defaultIcon = (
    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m-4-2v2m4-2H8" />
    </svg>
  );

  return (
    <div className={containerClasses} {...props}>
      <div className="flex-shrink-0">
        {icon || defaultIcon}
      </div>

      <h3 className={titleClasses}>
        {title}
      </h3>

      {description && (
        <p className={descriptionClasses}>
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          size={size === 'sm' ? 'sm' : 'md'}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

export { EmptyState };