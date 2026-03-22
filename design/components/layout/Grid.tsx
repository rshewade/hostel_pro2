import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps extends BaseComponentProps {
  cols?: {
    default?: GridCols;
    sm?: GridCols;
    md?: GridCols;
    lg?: GridCols;
    xl?: GridCols;
    '2xl'?: GridCols;
  };
  gap?: GridGap;
  children: React.ReactNode;
}

const Grid = ({
  className,
  cols = { default: 1 },
  gap = 'md',
  children,
  ...props
}: GridProps) => {
  const gridClasses = cn(
    // Base grid styles
    'grid',

    // Column variants
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,

    // Gap variants
    {
      'gap-0': gap === 'none',
      'gap-1': gap === 'xs',
      'gap-3': gap === 'sm',
      'gap-4': gap === 'md',
      'gap-6': gap === 'lg',
      'gap-8': gap === 'xl',
    },

    // Custom classes
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

Grid.displayName = 'Grid';

export { Grid };