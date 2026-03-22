import { forwardRef, useId } from 'react';
import { cn } from '../utils';
import type { FormFieldProps } from '../types';

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps extends Omit<FormFieldProps, 'children'> {
  options: RadioOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
}

export interface RadioProps extends Omit<FormFieldProps, 'children'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  value?: string | number;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Individual Radio component
const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  className,
  checked,
  defaultChecked,
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
  id,
  'data-testid': testId,
  ...props
}, ref) => {
  const generatedId = useId();
  const radioId = id || `radio-${generatedId}`;
  const errorId = error ? `${radioId}-error` : undefined;
  const helperId = helperText ? `${radioId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const radioClasses = cn(
    // Base radio styles (hidden input, custom styling)
    'sr-only', // Screen reader only, we'll style the custom radio

    // Custom classes
    className
  );

  const customRadioClasses = cn(
    // Custom radio appearance
    'inline-flex items-center justify-center border-2 rounded-full transition-colors',
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
      : checked
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
            id={radioId}
            type="radio"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            value={value}
            name={name}
            disabled={disabled}
            required={required}
            className={radioClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            data-testid={testId}
            {...props}
          />

          <label
            htmlFor={radioId}
            className={customRadioClasses}
          >
            {checked && (
              <div
                className={cn(
                  'rounded-full bg-current transition-opacity',
                  {
                    'w-1.5 h-1.5': size === 'sm',
                    'w-2 h-2': size === 'md',
                    'w-2.5 h-2.5': size === 'lg',
                  }
                )}
              />
            )}
          </label>
        </div>

        {label && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={radioId}
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

Radio.displayName = 'Radio';

// RadioGroup component for managing multiple radios
function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  name,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  orientation = 'vertical',
  id,
  'data-testid': testId,
  className,
}: RadioGroupProps) {
  const generatedId = useId();
  const groupId = id || `radio-group-${generatedId}`;
  const errorId = error ? `${groupId}-error` : undefined;
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const generatedName = useId();
  const groupName = name || `radio-group-${generatedName}`;

  return (
    <fieldset className={cn('space-y-1', className)}>
      {label && (
        <legend className="text-sm font-medium text-navy-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}

      <div
        className={cn(
          'space-y-3',
          orientation === 'horizontal' && 'flex space-y-0 space-x-6'
        )}
        role="radiogroup"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        data-testid={testId}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${groupId}-${option.value}`}
            name={groupName}
            value={option.value}
            checked={value !== undefined ? value === option.value : undefined}
            defaultChecked={defaultValue !== undefined ? defaultValue === option.value : undefined}
            onChange={(e) => onChange?.(option.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            label={option.label}
            disabled={disabled || option.disabled}
            size={size}
            required={required}
          />
        ))}
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
    </fieldset>
  );
}

export { Radio, RadioGroup };