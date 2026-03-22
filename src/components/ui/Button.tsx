import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/components/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  destructive: 'bg-red-500 text-white hover:bg-red-600 inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm cursor-pointer border-none',
};

const sizeClasses: Record<Size, string> = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-xs px-3 py-1.5',
  md: '',
  lg: 'text-base px-6 py-3',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  truncate?: boolean;
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, loading, leftIcon, rightIcon, truncate, iconOnly, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', loading && 'opacity-70 cursor-wait', truncate && 'truncate', iconOnly && 'p-2', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            {leftIcon}
            {children}
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
