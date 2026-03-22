'use client';

import { forwardRef, useState, useCallback, useRef } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Upload, 
  X, 
  FileText, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  PauseCircle
} from 'lucide-react';
import type { FormFieldProps } from '../types';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface EnhancedFileUploadProps extends Omit<FormFieldProps, 'children'> {
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  onValidationError?: (error: string) => void;
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (file: File, progress: number) => void;
  onUploadSuccess?: (file: File) => void;
  onUploadError?: (file: File, error: string) => void;
  onCancelUpload?: (file: File) => void;
  onRetryUpload?: (file: File) => void;
  onDelete?: (file: File) => void;
  uploadProgress?: number;
  uploadStatus?: UploadStatus;
  uploadError?: string;
  showPreview?: boolean;
  allowMultiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'application/pdf'];

const EnhancedFileUpload = forwardRef<HTMLDivElement, EnhancedFileUploadProps>(({
  className,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  value,
  onChange,
  accept = '.jpg,.jpeg,.pdf',
  maxSize = MAX_FILE_SIZE,
  onValidationError,
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
  onCancelUpload,
  onRetryUpload,
  onDelete,
  uploadProgress = 0,
  uploadStatus = 'idle',
  uploadError,
  showPreview = true,
  allowMultiple = false,
  id,
  'data-testid': testId,
}, ref) => {
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
      onValidationError?.(validationError);
      return;
    }

    onChange?.(file);

    // Create preview
    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setPreviewUrl('pdf');
    }
  }, [validateFile, onChange, showPreview, onValidationError]);

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
      onUploadStart?.(file);
    }
  }, [handleFile, onUploadStart]);

  const handleRemove = useCallback(() => {
    onChange?.(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (value) {
      onDelete?.(value);
    }
  }, [onChange, onDelete, value]);

  const handleCancelUpload = useCallback(() => {
    if (value) {
      onCancelUpload?.(value);
    }
  }, [value, onCancelUpload]);

  const handleRetryUpload = useCallback(() => {
    if (value) {
      onRetryUpload?.(value);
      onUploadStart?.(value);
    }
  }, [value, onRetryUpload, onUploadStart]);

  const getUploadStatusBadge = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Uploading...
            </span>
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="success" size="sm">
            Uploaded
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="error" size="sm">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Failed
            </span>
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="default" size="sm">
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

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
        <label htmlFor={id} className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {!value ? (
        <div
          ref={ref}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : '',
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 cursor-pointer',
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
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
          />
          <label htmlFor={id} className="cursor-pointer">
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
        <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-primary)' }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {getPreviewContent()}
            </div>
            
            {/* Status Badge */}
            {getUploadStatusBadge()}
          </div>

          {/* Upload Progress Bar */}
          {uploadStatus === 'uploading' && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-gray-200)' }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundColor: 'var(--color-blue-500)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Upload Error Message */}
          {uploadStatus === 'error' && uploadError && (
            <div className="mb-3 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-red-50)' }}>
              <p className="flex items-center gap-1 font-medium" style={{ color: 'var(--color-red-700)' }}>
                <AlertCircle className="w-3 h-3" />
                Upload failed:
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>{uploadError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {uploadStatus === 'uploading' && onCancelUpload && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelUpload}
                leftIcon={<PauseCircle className="w-4 h-4" />}
              >
                Cancel
              </Button>
            )}

            {uploadStatus === 'error' && onRetryUpload && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRetryUpload}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Retry Upload
              </Button>
            )}

            {(uploadStatus === 'idle' || uploadStatus === 'success' || uploadStatus === 'error') && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                leftIcon={<Trash2 className="w-4 h-4" />}
                disabled={loading}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-red-600)' }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {helperText && !error && !uploadError && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {helperText}
        </p>
      )}
    </div>
  );
});

EnhancedFileUpload.displayName = 'EnhancedFileUpload';

export { EnhancedFileUpload };
