import { forwardRef, useId, useState } from 'react';
import { cn } from '../utils';
import type { FormFieldProps } from '../types';

export interface CheckboxProps extends Omit<FormFieldProps, 'children'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  value?: string | number | readonly string[];
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className,
  checked,
  defaultChecked = false,
  onChange,
  onBlur,
  onFocus,
  value,
  name,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  indeterminate = false,
  id,
  'data-testid': testId,
  ...props
}, ref) => {
  const generatedId = useId();
  const checkboxId = id || `checkbox-${generatedId}`;
  const errorId = error ? `${checkboxId}-error` : undefined;
  const helperId = helperText ? `${checkboxId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const actualChecked = isControlled ? checked : internalChecked;

  const checkboxClasses = cn(
    // Base checkbox styles (hidden input, custom styling)
    'sr-only', // Screen reader only, we'll style custom checkbox

    // Custom classes
    className
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  };

  const customCheckboxClasses = cn(
    // Custom checkbox appearance
    'inline-flex items-center justify-center border-2 rounded transition-colors',
    'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold-500',

    // Size variants
    {
      'w-4 h-4': size === 'sm',
      'w-5 h-5': size === 'md',
      'w-6 h-6': size === 'lg',
    },

    // State styles
    disabled
      ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
      : actualChecked || indeterminate
        ? 'bg-gold-500 border-gold-500 text-navy-950'
        : 'border-gray-300 bg-white hover:border-gray-400',

    // Error state
    error && !disabled && 'border-red-500 focus-within:ring-red-500'
  );

  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={actualChecked}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            value={value}
            name={name}
            disabled={disabled}
            required={required}
            className={checkboxClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            data-testid={testId}
            {...props}
          />

          <label
            htmlFor={checkboxId}
            className={customCheckboxClasses}
          >
            {(checked || indeterminate) && (
              <svg
                className={cn(
                  'transition-opacity',
                  size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {indeterminate ? (
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            )}
          </label>
        </div>

        {label && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={checkboxId}
              className={cn(
                'font-medium cursor-pointer select-none',
                disabled ? 'text-gray-400 cursor-not-allowed' : 'text-navy-900'
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600 ml-7" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500 ml-7">
          {helperText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };