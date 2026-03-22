import { forwardRef, useId } from 'react';
import { cn } from '../utils';
import { INPUT_VARIANT_CLASSES } from '../constants';
import type { FormFieldProps } from '../types';

export interface TimePickerProps extends Omit<FormFieldProps, 'children'> {
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  min?: string;
  max?: string;
  step?: number;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(({
  className,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  variant = 'default',
  size = 'md',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  min,
  max,
  step,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  id,
  'data-testid': testId,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || `timepicker-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const inputClasses = cn(
    // Base input styles
    'w-full bg-white border rounded-md font-sans transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'hover:border-gray-400',
    'pr-10', // Space for clock icon

    // Size variants
    {
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-4 py-3 text-lg': size === 'lg',
    },

    // Variant styles
    INPUT_VARIANT_CLASSES[variant],

    // State styles
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50 hover:border-gray-300',
    readOnly && 'bg-gray-50 cursor-default',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',

    // Custom classes
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-navy-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type="time"
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          data-testid={testId}
          {...props}
        />

        {/* Clock icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
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

TimePicker.displayName = 'TimePicker';

export { TimePicker };
