import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

export type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FlexProps extends BaseComponentProps {
  direction?: FlexDirection;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: FlexWrap;
  gap?: FlexGap;
  inline?: boolean;
  children: React.ReactNode;
}

const Flex = ({
  className,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  gap = 'none',
  inline = false,
  children,
  ...props
}: FlexProps) => {
  const flexClasses = cn(
    // Base flex styles
    inline ? 'inline-flex' : 'flex',

    // Direction variants
    {
      'flex-row': direction === 'row',
      'flex-row-reverse': direction === 'row-reverse',
      'flex-col': direction === 'col',
      'flex-col-reverse': direction === 'col-reverse',
    },

    // Align variants
    {
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
      'items-baseline': align === 'baseline',
    },

    // Justify variants
    {
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly',
    },

    // Wrap variants
    {
      'flex-nowrap': wrap === 'nowrap',
      'flex-wrap': wrap === 'wrap',
      'flex-wrap-reverse': wrap === 'wrap-reverse',
    },

    // Gap variants (using margin utilities for older Tailwind compatibility)
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
    <div className={flexClasses} {...props}>
      {children}
    </div>
  );
};

Flex.displayName = 'Flex';

export { Flex };