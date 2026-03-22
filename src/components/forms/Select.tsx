'use client';

import { forwardRef, useState, useId } from 'react';
import { cn } from '../utils';
import { INPUT_VARIANT_CLASSES } from '../constants';
import type { FormFieldProps } from '../types';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<FormFieldProps, 'children'> {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  multiple?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  options = [],
  value,
  defaultValue,
  placeholder,
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
  multiple = false,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  id,
  'data-testid': testId,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const selectClasses = cn(
    // Base select styles
    'w-full bg-white border rounded-md font-sans transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'appearance-none', // Remove default browser styling
    'bg-no-repeat', // For custom dropdown arrow
    'pr-10', // Space for dropdown arrow

    // Size variants
    {
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-4 py-3 text-lg': size === 'lg',
    },

    // Background positioning for dropdown arrow
    {
      'bg-[right_0.75rem_center]': size === 'sm',
      'bg-[right_1rem_center]': size === 'md' || size === 'lg',
    },

    // Variant styles
    INPUT_VARIANT_CLASSES[variant],

    // State styles
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
    readOnly && 'bg-gray-50 cursor-default',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',

    // Custom classes
    className
  );

  // Custom dropdown arrow (using CSS)
  const arrowStyles = `
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-size: 1.5rem 1.5rem;
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-navy-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled || readOnly}
          required={required}
          multiple={multiple}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={selectClasses}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")" }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          data-testid={testId}
          {...props}
        >
          {placeholder && !multiple && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

export { Select };