import { forwardRef, useId } from 'react';
import { cn } from '../utils';
import type { FormFieldProps } from '../types';

export interface ToggleProps extends Omit<FormFieldProps, 'children'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(({
  className,
  checked,
  defaultChecked,
  onChange,
  onBlur,
  onFocus,
  size = 'md',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  name,
  id,
  'data-testid': testId,
  ...props
}, ref) => {
  const generatedId = useId();
  const toggleId = id || `toggle-${generatedId}`;
  const errorId = error ? `${toggleId}-error` : undefined;
  const helperId = helperText ? `${toggleId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  // Size configurations
  const sizeConfig = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const config = sizeConfig[size];

  const trackClasses = cn(
    // Base track styles
    'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
    'transition-colors duration-200 ease-in-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2',

    // Size
    config.track,

    // State styles
    checked
      ? 'bg-gold-500'
      : 'bg-gray-300',

    // Disabled
    disabled && 'opacity-50 cursor-not-allowed',

    // Error
    error && 'ring-2 ring-red-500 ring-offset-1',

    // Custom classes
    className
  );

  const thumbClasses = cn(
    // Base thumb styles
    'pointer-events-none inline-block rounded-full bg-white shadow-lg',
    'transform ring-0 transition duration-200 ease-in-out',

    // Size
    config.thumb,

    // Position
    checked ? config.translate : 'translate-x-0'
  );

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <button
          ref={ref}
          id={toggleId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          className={trackClasses}
          data-testid={testId}
          {...props}
        >
          <span className={thumbClasses} />
        </button>

        {label && (
          <label
            htmlFor={toggleId}
            className={cn(
              'ml-3 text-sm font-medium cursor-pointer select-none',
              disabled ? 'text-gray-400 cursor-not-allowed' : 'text-navy-900'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Toggle.displayName = 'Toggle';

// Alias for semantic naming
const Switch = Toggle;
Switch.displayName = 'Switch';

export { Toggle, Switch };
