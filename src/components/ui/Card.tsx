import { cn } from '@/components/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div className={cn('card', hover && 'transition-shadow cursor-pointer', className)}>
      {children}
    </div>
  );
}

export function StatCard({ value, label, className }: { value: string | number; label: string; className?: string }) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
