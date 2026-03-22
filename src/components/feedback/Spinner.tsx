import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends BaseComponentProps {
  size?: SpinnerSize;
  color?: string;
  showText?: boolean;
  text?: string;
}

const Spinner = ({
  className,
  size = 'md',
  color = 'text-gold-500',
  showText = false,
  text = 'Loading...',
  ...props
}: SpinnerProps) => {
  const spinnerClasses = cn(
    'animate-spin rounded-full border-2 border-gray-300',
    color,
    {
      'w-3 h-3 border-2': size === 'xs',
      'w-4 h-4 border-2': size === 'sm',
      'w-6 h-6 border-2': size === 'md',
      'w-8 h-8 border-2': size === 'lg',
      'w-12 h-12 border-3': size === 'xl',
    },

    // Custom classes
    className
  );

  if (showText) {
    return (
      <div className="flex items-center space-x-2" {...props}>
        <div
          className={spinnerClasses}
          style={{
            borderTopColor: 'currentColor',
            borderRightColor: 'currentColor',
          }}
        />
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    );
  }

  return (
    <div
      className={spinnerClasses}
      style={{
        borderTopColor: 'currentColor',
        borderRightColor: 'currentColor',
      }}
      {...props}
    />
  );
};

Spinner.displayName = 'Spinner';

export { Spinner };