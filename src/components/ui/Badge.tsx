import { cn } from '@/components/utils';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const sizeClasses = { sm: 'text-xs px-1.5 py-0.5', md: 'px-2 py-0.5', lg: 'px-3 py-1' };

export function Badge({ variant = 'neutral', size = 'md', children, className }: BadgeProps) {
  const v = variant === 'default' ? 'neutral' : variant;
  return (
    <span className={cn('badge', `badge-${v}`, sizeClasses[size], className)}>
      {children}
    </span>
  );
}
