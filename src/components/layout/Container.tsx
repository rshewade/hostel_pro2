import { cn } from '../utils';
import { CONTAINER_WIDTHS } from '../constants';
import type { BaseComponentProps } from '../types';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';

export interface ContainerProps extends BaseComponentProps {
  size?: ContainerSize;
  centerContent?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  children: React.ReactNode;
}

const Container = ({
  className,
  size = 'lg',
  centerContent = false,
  padding = 'md',
  children,
  ...props
}: ContainerProps) => {
  const containerClasses = cn(
    // Base container styles
    'w-full mx-auto',

    // Size variants
    CONTAINER_WIDTHS[size],

    // Padding variants
    {
      'px-4': padding === 'sm',
      'px-6': padding === 'md',
      'px-8': padding === 'lg',
      'px-0': padding === 'none',
    },

    // Responsive padding adjustments
    'sm:px-6 md:px-8 lg:px-12',

    // Center content
    centerContent && 'flex items-center justify-center min-h-screen',

    // Custom classes
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

Container.displayName = 'Container';

export { Container };