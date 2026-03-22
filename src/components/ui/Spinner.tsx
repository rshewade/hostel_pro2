import { cn } from '@/components/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className={cn(sizes[size], 'animate-spin rounded-full border-2 border-current border-t-transparent', className)} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
