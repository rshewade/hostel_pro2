import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface SpacerProps extends BaseComponentProps {
  size?: SpacerSize;
  axis?: 'horizontal' | 'vertical';
}

const Spacer = ({
  className,
  size = 'md',
  axis = 'vertical',
  ...props
}: SpacerProps) => {
  const spacerClasses = cn(
    // Base spacer styles
    {
      // Vertical spacers
      'h-1': axis === 'vertical' && size === 'xs',
      'h-2': axis === 'vertical' && size === 'sm',
      'h-4': axis === 'vertical' && size === 'md',
      'h-6': axis === 'vertical' && size === 'lg',
      'h-8': axis === 'vertical' && size === 'xl',
      'h-12': axis === 'vertical' && size === '2xl',
      'h-16': axis === 'vertical' && size === '3xl',

      // Horizontal spacers
      'w-1': axis === 'horizontal' && size === 'xs',
      'w-2': axis === 'horizontal' && size === 'sm',
      'w-4': axis === 'horizontal' && size === 'md',
      'w-6': axis === 'horizontal' && size === 'lg',
      'w-8': axis === 'horizontal' && size === 'xl',
      'w-12': axis === 'horizontal' && size === '2xl',
      'w-16': axis === 'horizontal' && size === '3xl',
    },

    // Custom classes
    className
  );

  return <div className={spacerClasses} {...props} />;
};

Spacer.displayName = 'Spacer';

export { Spacer };