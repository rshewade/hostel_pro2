'use client';

import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

/**
 * A4Page - A4-sized container optimized for print
 *
 * Standard A4 dimensions: 210mm x 297mm (8.27" x 11.69")
 * With 20mm margins: 170mm x 257mm content area
 *
 * Usage: Use for official letters, undertakings, and formal documents.
 */

export interface A4PageProps extends BaseComponentProps {
  /** Header content (appears at top of each page) */
  header?: React.ReactNode;
  /** Footer content (appears at bottom of each page) */
  footer?: React.ReactNode;
  /** Margin size */
  margin?: 'sm' | 'md' | 'lg';
  /** Show border on screen (hidden when printing) */
  showBorder?: boolean;
  /** Page number (for multi-page documents) */
  pageNumber?: number;
  /** Total pages (for multi-page documents) */
  totalPages?: number;
}

const A4Page = ({
  children,
  className,
  header,
  footer,
  margin = 'md',
  showBorder = true,
  pageNumber,
  totalPages,
  ...props
}: A4PageProps) => {
  // Margin classes
  const marginClasses = {
    sm: 'p-6 print:p-[15mm]',
    md: 'p-8 print:p-[20mm]',
    lg: 'p-10 print:p-[25mm]',
  };

  return (
    <div
      className={cn(
        // A4 dimensions (screen simulation)
        'w-full max-w-[210mm] min-h-[297mm]',
        'mx-auto',

        // Background and shadow for screen display
        'bg-white',
        showBorder && 'shadow-lg border border-gray-200 print:shadow-none print:border-none',

        // Print-specific styles
        'print:max-w-none print:w-full print:min-h-0',
        'print:shadow-none print:border-none',
        'print:break-after-page',

        // Typography optimized for print
        'text-sm leading-relaxed print:text-[11pt] print:leading-[1.4]',
        'font-sans text-gray-900 print:text-black',

        className
      )}
      {...props}
    >
      {/* Page wrapper with margins */}
      <div className={cn('flex flex-col min-h-[297mm]', marginClasses[margin])}>
        {/* Header */}
        {header && (
          <header className="flex-shrink-0 mb-6 pb-4 border-b border-gray-200 print:border-gray-400">
            {header}
          </header>
        )}

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        {(footer || pageNumber) && (
          <footer className="flex-shrink-0 mt-6 pt-4 border-t border-gray-200 print:border-gray-400">
            <div className="flex items-center justify-between text-xs text-gray-500 print:text-gray-700">
              <div>{footer}</div>
              {pageNumber && totalPages && (
                <div>Page {pageNumber} of {totalPages}</div>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

A4Page.displayName = 'A4Page';

export { A4Page };
