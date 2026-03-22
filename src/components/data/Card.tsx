import { cn } from '../utils';
import { SHADOWS, BORDER_RADIUS } from '../constants';
import type { BaseComponentProps } from '../types';

interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'card';
  rounded?: boolean;
  border?: boolean;
  hover?: boolean;
  children: React.ReactNode;
}

const Card = ({
  className,
  title,
  subtitle,
  actions,
  padding = 'md',
  shadow = 'card',
  rounded = true,
  border = false,
  hover = false,
  children,
  ...props
}: CardProps) => {
  const cardClasses = cn(
    // Base card styles
    'bg-white',

    // Padding variants
    {
      'p-3': padding === 'sm',
      'p-4': padding === 'md',
      'p-6': padding === 'lg',
      'p-0': padding === 'none',
    },

    // Shadow variants
    shadow && SHADOWS[shadow],

    // Border and rounding
    border && 'border border-gray-200',
    rounded && BORDER_RADIUS.lg,
    !rounded && BORDER_RADIUS.none,

    // Hover effects
    hover && 'transition-shadow duration-200 hover:shadow-lg',

    // Custom classes
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-navy-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={cn(
        (title || subtitle || actions) && padding !== 'none' && 'mt-4'
      )}>
        {children}
      </div>
    </div>
  );
};

Card.displayName = 'Card';

export { Card };