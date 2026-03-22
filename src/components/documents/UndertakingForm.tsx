'use client';

import { forwardRef, useState } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { Checkbox } from '../forms/Checkbox';
import { Input } from '../forms/Input';
import { Textarea } from '../forms/Textarea';
import { Badge } from '../ui/Badge';
import { 
  AlertCircle, 
  CheckCircle2,
  User,
  FileText,
  Lock
} from 'lucide-react';
import type { BaseComponentProps, FormFieldProps } from '../types';

export interface ConsentItem {
  id: string;
  text: string;
  required: boolean;
  checked: boolean;
  onToggle: (id: string) => void;
}

export interface SignatureField {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export interface UndertakingFormProps extends BaseComponentProps {
  title: string;
  description: string;
  content?: React.ReactNode;
  consentItems: ConsentItem[];
  signatureFields?: SignatureField[];
  showTerms?: boolean;
  termsContent?: React.ReactNode;
  termsScrollable?: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  showSignature?: boolean;
  showCheckboxOnly?: boolean;
  minRequiredConsents?: number;
}

const UndertakingForm = forwardRef<HTMLDivElement, UndertakingFormProps>(({
  className,
  title,
  description,
  content,
  consentItems,
  signatureFields,
  showTerms = true,
  termsContent,
  termsScrollable = true,
  onSubmit,
  onCancel,
  submitLabel = 'I Acknowledge',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
  showSignature = true,
  showCheckboxOnly = false,
  minRequiredConsents = 0,
  'data-testid': testId,
}, ref) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [allRequiredChecked, setAllRequiredChecked] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setHasScrolledToBottom(isAtBottom);
  };

  const requiredCheckedCount = consentItems.filter(
    item => item.required && item.checked
  ).length;

  const requiredConsentsCount = consentItems.filter(item => item.required).length;

  const canSubmit = 
    requiredCheckedCount >= requiredConsentsCount &&
    (!showSignature || !signatureFields || signatureFields.length === 0 ||
      signatureFields.every(field => !field.required || field.value.trim().length > 0)) &&
    (!termsScrollable || hasScrolledToBottom);

  const signatureSectionRequired = showSignature && signatureFields && signatureFields.length > 0;

  return (
    <div
      ref={ref}
      className={cn('space-y-6', className)}
      data-testid={testId}
    >
      {/* Header */}
      <div className="border-b pb-4" style={{ borderColor: 'var(--border-primary)' }}>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {description && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
      </div>

      {/* Content / Terms */}
      {showTerms && (content || termsContent) && (
        <div
          className={cn(
            'border rounded-lg p-4',
            termsScrollable && 'max-h-64 overflow-y-auto'
          )}
          style={{ 
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--color-gray-50)'
          }}
          onScroll={termsScrollable ? handleScroll : undefined}
        >
          <div className="prose prose-sm" style={{ color: 'var(--text-primary)' }}>
            {content || termsContent}
          </div>
          
          {termsScrollable && (
            <div className="mt-4 pt-4 border-t text-xs" style={{ borderColor: 'var(--border-primary)' }}>
              {hasScrolledToBottom ? (
                <p className="flex items-center gap-1" style={{ color: 'var(--color-green-600)' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  You have reviewed all the terms
                </p>
              ) : (
                <p className="flex items-center gap-1" style={{ color: 'var(--color-amber-600)' }}>
                  <AlertCircle className="w-3 h-3" />
                  Please scroll to the bottom to acknowledge
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Consent Items (Checkboxes) */}
      {consentItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Please review and acknowledge the following:
          </h3>
          
          <div className="space-y-2">
            {consentItems.map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onChange={() => item.onToggle(item.id)}
                  disabled={disabled}
                  label={item.text}
                  required={item.required}
                  className="pt-1"
                />
                {item.required && (
                  <Badge variant="warning" size="sm">
                    Required
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Progress Indicator */}
          {requiredConsentsCount > 0 && (
            <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-blue-50)' }}>
              <p className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <CheckCircle2 className="w-3 h-3" />
                {requiredCheckedCount} of {requiredConsentsCount} required items acknowledged
              </p>
            </div>
          )}
        </div>
      )}

      {/* Signature Fields */}
      {signatureSectionRequired && !showCheckboxOnly && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            {signatureFields.length === 1 ? 'Digital Signature' : 'Digital Signatures'}
          </h3>

          <div className="space-y-3">
            {signatureFields?.map(field => (
              <Input
                key={field.id}
                label={field.label}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required={field.required}
                disabled={disabled || field.disabled}
                helperText={
                  field.required
                    ? 'Please type your full name as it appears on official documents'
                    : 'Type your name to acknowledge (optional)'
                }
                leftIcon={<User className="w-4 h-4" />}
              />
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded text-xs" style={{ backgroundColor: 'var(--color-amber-50)' }}>
            <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-amber-600)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>
              Your typed name serves as a digital signature and is legally binding. 
              This action will be logged with a timestamp for audit purposes.
            </p>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-2 text-xs">
          {requiredConsentsCount > 0 && (
            <span style={{ color: 'var(--text-secondary)' }}>
              {requiredCheckedCount} / {requiredConsentsCount} required
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="secondary"
              size="md"
              onClick={onCancel}
              disabled={loading || disabled}
            >
              {cancelLabel}
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={onSubmit}
            disabled={!canSubmit || loading || disabled}
            loading={loading}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            {loading ? 'Submitting...' : submitLabel}
          </Button>
        </div>
      </div>

      {/* Validation Message */}
      {!canSubmit && !loading && (
        <div className="flex items-center gap-2 p-3 rounded text-sm" style={{ backgroundColor: 'var(--color-red-50)' }}>
          <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-red-600)' }} />
          <p style={{ color: 'var(--text-primary)' }}>
            {termsScrollable && !hasScrolledToBottom && 'Please review all terms by scrolling to the bottom. '}
            {requiredCheckedCount < requiredConsentsCount && 
              `${requiredConsentsCount - requiredCheckedCount} required consent(s) must be acknowledged. `
            }
            {signatureSectionRequired && signatureFields?.some(field => field.required && !field.value.trim()) &&
              'Please provide all required signatures. '
            }
          </p>
        </div>
      )}
    </div>
  );
});

UndertakingForm.displayName = 'UndertakingForm';

export { UndertakingForm };
