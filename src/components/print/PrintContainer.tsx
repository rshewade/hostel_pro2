'use client';

import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

/**
 * PrintContainer - Base container for print-optimized layouts
 *
 * Usage: Wrap content that needs to be printed with proper formatting.
 * Applies print-specific styles that simplify colors and ensure legibility.
 */

export interface PrintContainerProps extends BaseComponentProps {
  /** Hide the container on screen, show only when printing */
  printOnly?: boolean;
  /** Add page break before this container when printing */
  pageBreakBefore?: boolean;
  /** Add page break after this container when printing */
  pageBreakAfter?: boolean;
  /** Prevent page breaks inside this container */
  avoidBreak?: boolean;
}

const PrintContainer = ({
  children,
  className,
  printOnly = false,
  pageBreakBefore = false,
  pageBreakAfter = false,
  avoidBreak = false,
  ...props
}: PrintContainerProps) => {
  return (
    <div
      className={cn(
        // Base print styles
        'print:bg-white print:text-black',
        'print:shadow-none print:border-none',

        // Print visibility
        printOnly && 'hidden print:block',

        // Page break controls
        pageBreakBefore && 'print:break-before-page',
        pageBreakAfter && 'print:break-after-page',
        avoidBreak && 'print:break-inside-avoid',

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

PrintContainer.displayName = 'PrintContainer';

export { PrintContainer };
