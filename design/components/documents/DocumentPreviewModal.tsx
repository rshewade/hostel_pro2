'use client';

import { useState, useCallback, useEffect } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { BaseComponentProps } from '../types';

export interface DocumentPreviewModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  onDownload?: () => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
}

const DocumentPreviewModal = forwardRef<HTMLDivElement, DocumentPreviewModalProps>(({
  className,
  isOpen,
  onClose,
  file,
  fileName,
  fileType,
  fileUrl,
  onDownload,
  onPageChange,
  currentPage = 1,
  totalPages,
  isLoading = false,
  'data-testid': testId,
}, ref) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isPdf = fileType === 'application/pdf';
  const isImage = fileType?.startsWith('image/');

  // Reset zoom and rotation when file changes
  useEffect(() => {
    if (file || fileUrl) {
      setZoom(100);
      setRotation(0);
    }
  }, [file, fileUrl]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (totalPages && currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
        handleRotate();
        break;
      case 'ArrowLeft':
        handlePreviousPage();
        break;
      case 'ArrowRight':
        handleNextPage();
        break;
    }
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleRotate, handlePreviousPage, handleNextPage]);

  if (!isOpen) return null;

  const transformStyle = {
    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
    transformOrigin: 'center',
    transition: 'transform 0.2s ease-in-out'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75',
        className
      )}
      onKeyDown={handleKeyDown}
      data-testid={testId}
    >
      {/* Modal Content */}
      <div
        className={cn(
          'bg-white rounded-lg shadow-2xl flex flex-col',
          isFullscreen ? 'fixed inset-0 rounded-none' : 'w-full h-full max-w-6xl max-h-[90vh] m-4'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Badge variant="info" size="sm">
              {isPdf ? 'PDF' : 'Image'}
            </Badge>
            <h3 
              className="font-medium text-sm truncate"
              style={{ color: 'var(--text-primary)' }}
              title={fileName || file?.name}
            >
              {fileName || file?.name}
            </h3>
            {totalPages && (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              iconOnly
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconOnly
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div 
          className={cn(
            'flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4',
            isFullscreen && 'p-8'
          )}
          style={{ backgroundColor: 'var(--color-gray-100)' }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Loading preview...
              </span>
            </div>
          ) : isImage && (file || fileUrl) ? (
            <div style={transformStyle} className="max-w-full max-h-full">
              <img
                src={fileUrl || URL.createObjectURL(file!)}
                alt={fileName || file?.name}
                className="max-w-full max-h-full object-contain shadow-lg"
              />
            </div>
          ) : isPdf ? (
            <div style={transformStyle} className="max-w-full max-h-full">
              <div className="bg-white p-8 shadow-lg" style={{ minWidth: '595px', minHeight: '842px' }}>
                <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  PDF Preview
                </p>
                <p className="text-center text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Page {currentPage} of {totalPages || '?'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Preview not available for this file type
              </p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="border-t p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                iconOnly
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Badge variant="default" size="md">
                {zoom}%
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                iconOnly
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                iconOnly
                aria-label="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Page Controls (PDF only) */}
            {isPdf && totalPages && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  iconOnly
                  aria-label="Previous page"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  iconOnly
                  aria-label="Next page"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Download Button */}
            {onDownload && (
              <Button
                variant="primary"
                size="sm"
                onClick={onDownload}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
            )}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            <span>Shortcuts: </span>
            <span className="font-medium">+</span>
            <span>/</span>
            <span className="font-medium">-</span>
            <span> zoom, </span>
            <span className="font-medium">R</span>
            <span> rotate, </span>
            <span className="font-medium">Esc</span>
            <span> close, </span>
            {isPdf && (
              <>
                <span className="font-medium">←</span>
                <span>/</span>
                <span className="font-medium">→</span>
                <span> pages</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

DocumentPreviewModal.displayName = 'DocumentPreviewModal';

export { DocumentPreviewModal };
