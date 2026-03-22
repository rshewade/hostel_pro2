import { forwardRef, useId } from 'react';
import { cn } from '../utils';
import { INPUT_VARIANT_CLASSES, ANIMATIONS } from '../constants';
import type { FormFieldProps } from '../types';

export interface TextareaProps extends Omit<FormFieldProps, 'children'> {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
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
  rows = 3,
  resize = 'vertical',
  readOnly = false,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  id,
  'data-testid': testId,
  ...props
}, ref) => {
  const generatedId = useId();
  const textareaId = id || `textarea-${generatedId}`;
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText ? `${textareaId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const textareaClasses = cn(
    // Base textarea styles
    'w-full bg-white border rounded-md font-sans transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'resize-none', // Default to no resize, can be overridden

    // Size variants
    {
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-4 py-3 text-lg': size === 'lg',
    },

    // Resize variants
    {
      'resize-none': resize === 'none',
      'resize-y': resize === 'vertical',
      'resize-x': resize === 'horizontal',
      'resize': resize === 'both',
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

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-navy-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        maxLength={maxLength}
        minLength={minLength}
        className={textareaClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        data-testid={testId}
        {...props}
      />

      <div className="flex justify-between">
        {error ? (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        ) : (
          <div />
        )}

        {maxLength && (
          <p className="text-xs text-gray-400" data-testid="character-count">
            {value?.length || 0} / {maxLength} characters
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };