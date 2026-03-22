'use client';

import { forwardRef, useId, useState, useCallback } from 'react';
import { cn } from '../utils';
import { INPUT_VARIANT_CLASSES } from '../constants';
import type { FormFieldProps } from '../types';

export interface SearchFieldProps extends Omit<FormFieldProps, 'children'> {
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(({
  className,
  value,
  defaultValue,
  onChange,
  onSearch,
  onClear,
  onBlur,
  onFocus,
  placeholder = 'Search...',
  variant = 'default',
  size = 'md',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  showClearButton = true,
  autoComplete = 'off',
  autoFocus = false,
  id,
  'data-testid': testId,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || `search-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  // Track internal value for clear button visibility when uncontrolled
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  }, [value, onChange]);

  const handleClear = useCallback(() => {
    if (value === undefined) {
      setInternalValue('');
    }
    onClear?.();
    // Create a synthetic event for onChange
    const syntheticEvent = {
      target: { value: '' },
      currentTarget: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
  }, [value, onClear, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(currentValue);
    }
    if (e.key === 'Escape' && currentValue) {
      handleClear();
    }
  }, [currentValue, onSearch, handleClear]);

  const inputClasses = cn(
    // Base input styles
    'w-full bg-white border rounded-md font-sans transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'hover:border-gray-400',
    'pl-10', // Space for search icon
    showClearButton && currentValue ? 'pr-10' : 'pr-4', // Space for clear button

    // Size variants
    {
      'py-2 text-sm': size === 'sm',
      'py-2 text-base': size === 'md',
      'py-3 text-lg': size === 'lg',
    },

    // Variant styles
    INPUT_VARIANT_CLASSES[variant],

    // State styles
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50 hover:border-gray-300',
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
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={ref}
          id={inputId}
          type="search"
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          data-testid={testId}
          {...props}
        />

        {/* Clear button */}
        {showClearButton && currentValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute inset-y-0 right-0 pr-3 flex items-center',
              'text-gray-400 hover:text-gray-600',
              'focus:outline-none focus:text-gray-600'
            )}
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
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

SearchField.displayName = 'SearchField';

export { SearchField };
