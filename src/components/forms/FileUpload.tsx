'use client';

import { forwardRef, useId, useState, useCallback, useRef } from 'react';
import { cn } from '../utils';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import type { FormFieldProps } from '../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'application/pdf'];

export interface FileUploadProps extends Omit<FormFieldProps, 'children'> {
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  onValidationError?: (error: string) => void;
  showPreview?: boolean;
}

const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(({
  className,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  value,
  onChange,
  accept = '.jpg,.jpeg,.pdf',
  maxSize = MAX_FILE_SIZE,
  onValidationError,
  showPreview = true,
  id,
  'data-testid': testId,
}, ref) => {
  const generatedId = useId();
  const uploadId = id || `file-upload-${generatedId}`;
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG, JPEG, and PDF files are accepted';
    }
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    return null;
  }, [maxSize]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      if (onValidationError) {
        onValidationError(validationError);
      }
      return;
    }

    onChange?.(file);

    // Create preview
    if (showPreview) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setPreviewUrl('pdf');
      }
    }
  }, [validateFile, onChange, onValidationError, showPreview]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    onChange?.(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onChange]);

  const getPreviewContent = () => {
    if (!value) return null;

    if (previewUrl === 'pdf') {
      return (
        <div className="flex items-center justify-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-red-50)' }}>
          <FileText className="w-16 h-16" style={{ color: 'var(--color-red-600)' }} />
          <span className="ml-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            PDF Document
          </span>
        </div>
      );
    }

    if (previewUrl && value.type.startsWith('image/')) {
      return (
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-full max-h-48 object-contain rounded-lg"
        />
      );
    }

    return (
      <div className="flex items-center justify-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-blue-50)' }}>
        <FileText className="w-16 h-16" style={{ color: 'var(--color-blue-600)' }} />
        <div className="ml-3 text-left">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {value.name}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {Math.round(value.size / 1024)} KB
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={uploadId} className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {!value ? (
        <div
          ref={ref}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            isDragging ? 'border-blue-500 bg-blue-50' : '',
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500',
            error ? 'border-red-500' : ''
          )}
          style={{ borderColor: error ? 'var(--color-red-500)' : 'var(--border-primary)' }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          data-testid={testId}
        >
          <input
            ref={inputRef}
            id={uploadId}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
          />
          <label htmlFor={uploadId} className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-blue-600)' }} />
            <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Click to upload or drag and drop
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              JPG, JPEG or PDF (Max {Math.round(maxSize / (1024 * 1024))}MB)
            </p>
          </label>
        </div>
      ) : (
        <div className="card p-4 border-2" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {getPreviewContent()}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="ml-4 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" style={{ color: 'var(--color-red-600)' }} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-red-600)' }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {helperText}
        </p>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export { FileUpload };
