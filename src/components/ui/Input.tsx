import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/components/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, help, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div>
        {label && <label htmlFor={inputId} className="input-label">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={cn('input-field', error && 'input-field-error', className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : help ? `${inputId}-help` : undefined}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="input-error">{error}</p>}
        {help && !error && <p id={`${inputId}-help`} className="input-help">{help}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
