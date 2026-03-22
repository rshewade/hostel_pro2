'use client';

import { forwardRef, useState } from 'react';
import { cn } from '../utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { UndertakingCard, UndertakingStatus, UndertakingType } from './UndertakingCard';
import { 
  Filter,
  SortDesc,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { BaseComponentProps } from '../types';

export type UndertakingSortOption = 'due_date' | 'priority' | 'status' | 'type';
export type UndertakingFilterOption = 'all' | 'pending' | 'completed' | 'required' | 'overdue';

export interface UndertakingItem {
  id: string;
  type: UndertakingType;
  title: string;
  description: string;
  status: UndertakingStatus;
  required: boolean;
  dueDate?: string;
  completedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  version?: string;
  isBlocking?: boolean;
  category?: string;
}

export interface UndertakingsListProps extends BaseComponentProps {
  items: UndertakingItem[];
  onItemClick?: (item: UndertakingItem) => void;
  loading?: boolean;
  emptyMessage?: string;
  sortBy?: UndertakingSortOption;
  filterBy?: UndertakingFilterOption;
  showFilters?: boolean;
  showSort?: boolean;
  onSortChange?: (sort: UndertakingSortOption) => void;
  onFilterChange?: (filter: UndertakingFilterOption) => void;
  showBlockingWarning?: boolean;
}

const UndertakingsList = forwardRef<HTMLDivElement, UndertakingsListProps>(({
  className,
  items,
  onItemClick,
  loading = false,
  emptyMessage = 'No undertakings to display',
  sortBy = 'due_date',
  filterBy = 'all',
  showFilters = true,
  showSort = true,
  onSortChange,
  onFilterChange,
  showBlockingWarning = true,
  'data-testid': testId,
}, ref) => {
  const [currentSort, setCurrentSort] = useState(sortBy);
  const [currentFilter, setCurrentFilter] = useState(filterBy);

  const filteredItems = items.filter(item => {
    switch (currentFilter) {
      case 'pending':
        return item.status === 'pending' || item.status === 'in_progress';
      case 'completed':
        return item.status === 'completed';
      case 'required':
        return item.status === 'required';
      case 'overdue':
        return item.status === 'overdue';
      default:
        return true;
    }
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (currentSort) {
      case 'due_date':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        if (a.isBlocking && !b.isBlocking) return -1;
        if (!a.isBlocking && b.isBlocking) return 1;
        if (a.required && !b.required) return -1;
        if (!a.required && b.required) return 1;
        return 0;
      case 'status':
        const statusOrder = ['overdue', 'required', 'pending', 'in_progress', 'completed'];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const blockingItems = items.filter(item => item.isBlocking);
  const requiredItems = items.filter(item => item.status === 'required');
  const completedItems = items.filter(item => item.status === 'completed');
  const pendingItems = items.filter(item => 
    item.status === 'pending' || item.status === 'in_progress'
  );

  const handleSortChange = (sort: UndertakingSortOption) => {
    setCurrentSort(sort);
    onSortChange?.(sort);
  };

  const handleFilterChange = (filter: UndertakingFilterOption) => {
    setCurrentFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      data-testid={testId}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Pending
            </span>
            <Clock className="w-4 h-4" style={{ color: 'var(--color-blue-600)' }} />
          </div>
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {pendingItems.length}
          </p>
        </div>

        <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Required
            </span>
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-amber-600)' }} />
          </div>
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {requiredItems.length}
          </p>
        </div>

        <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-green-600)' }} />
          </div>
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {completedItems.length}
          </p>
        </div>

        <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Total
            </span>
            <Badge variant="default" size="sm">
              {items.length}
            </Badge>
          </div>
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {items.length}
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      {(showFilters || showSort) && (
        <div className="flex items-center justify-between gap-3">
          {showFilters && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <select
                className="border rounded px-3 py-1.5 text-sm"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                value={currentFilter}
                onChange={(e) => handleFilterChange(e.target.value as UndertakingFilterOption)}
              >
                <option value="all">All Undertakings</option>
                <option value="pending">Pending</option>
                <option value="required">Required</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {showSort && (
            <div className="flex items-center gap-2">
              <SortDesc className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <select
                className="border rounded px-3 py-1.5 text-sm"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value as UndertakingSortOption)}
              >
                <option value="due_date">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Blocking Warning */}
      {showBlockingWarning && blockingItems.length > 0 && (
        <div className="p-3 rounded border-l-4" style={{ 
          backgroundColor: 'var(--color-red-50)',
          borderColor: 'var(--color-red-500)'
        }}>
          <p className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-red-900)' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>{blockingItems.length} action(s) required:</strong>{' '}
              Please complete the following undertaking(s) to access other features:
              <span className="font-medium">
                {' '}{blockingItems.map(item => item.title).join(', ')}
              </span>
            </span>
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">Loading undertakings...</span>
          </div>
        </div>
      ) : sortedItems.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="w-16 h-16 mb-3" style={{ color: 'var(--color-gray-300)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {currentFilter === 'completed' ? 'No completed undertakings yet' : 'No undertakings available'}
          </h3>
          <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        /* Undertakings Grid */
        <div className="space-y-3">
          {sortedItems.map((item, index) => (
            <UndertakingCard
              key={`${item.type}-${index}`}
              type={item.type}
              title={item.title}
              description={item.description}
              status={item.status}
              required={item.required}
              dueDate={item.dueDate}
              completedAt={item.completedAt}
              acknowledgedBy={item.acknowledgedBy}
              acknowledgedAt={item.acknowledgedAt}
              version={item.version}
              isBlocking={item.isBlocking}
              onAction={() => onItemClick?.(item)}
              onViewDetails={() => onItemClick?.(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

UndertakingsList.displayName = 'UndertakingsList';

export { UndertakingsList };
