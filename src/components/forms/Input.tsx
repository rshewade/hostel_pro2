import { forwardRef, useId } from 'react';
import { cn } from '../utils';
import { INPUT_VARIANT_CLASSES, ANIMATIONS } from '../constants';
import type { FormFieldProps } from '../types';

export interface InputProps extends Omit<FormFieldProps, 'children'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  placeholder,
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
  leftIcon,
  rightIcon,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  inputMode,
  id,
  'data-testid': testId,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const inputClasses = cn(
    // Base input styles
    'w-full font-sans transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',

    // Size variants
    {
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-3 text-base': size === 'md',
      'px-4 py-4 text-lg': size === 'lg',
    },

    // Variant styles
    INPUT_VARIANT_CLASSES[variant],

    // Icon padding adjustments
    {
      'pl-10': leftIcon,
      'pr-10': rightIcon,
    },

    // State styles
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
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
          className="text-label block mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          inputMode={inputMode}
          className={inputClasses}
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)'
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          data-testid={testId}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm" style={{ color: 'var(--color-red-600)' }} role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };