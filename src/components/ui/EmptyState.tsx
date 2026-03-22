interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12" data-testid="empty-state">
      {icon && <div className="mb-4 flex justify-center text-4xl opacity-50">{icon}</div>}
      <h3 className="text-heading-3 mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="text-body-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
