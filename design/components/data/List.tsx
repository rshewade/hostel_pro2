import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

export interface ListItem {
  id: string | number;
  content: React.ReactNode;
  actions?: React.ReactNode;
  disabled?: boolean;
}

export interface ListProps extends BaseComponentProps {
  items: ListItem[];
  variant?: 'default' | 'bordered' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  onItemClick?: (item: ListItem) => void;
  emptyMessage?: string;
}

const List = ({
  className,
  items,
  variant = 'default',
  size = 'md',
  onItemClick,
  emptyMessage = 'No items to display',
  ...props
}: ListProps) => {
  const listClasses = cn(
    // Base list styles
    'divide-y divide-gray-200',

    // Variant styles
    {
      'border border-gray-200 rounded-lg': variant === 'bordered',
      'border border-gray-200 rounded-lg divide-y-0': variant === 'striped',
    },

    // Custom classes
    className
  );

  const getItemClasses = (item: ListItem, index: number) => cn(
    // Base item styles
    'flex items-center justify-between',
    'transition-colors duration-200',

    // Size variants
    {
      'px-3 py-2': size === 'sm',
      'px-4 py-3': size === 'md',
      'px-6 py-4': size === 'lg',
    },

    // Variant-specific styles
    {
      'hover:bg-gray-50': variant === 'default' || variant === 'bordered',
      'bg-white': variant === 'striped' && index % 2 === 0,
      'bg-gray-50': variant === 'striped' && index % 2 === 1,
      'hover:bg-gray-100': variant === 'striped',
    },

    // Interactive styles
    onItemClick && !item.disabled && 'cursor-pointer',

    // Disabled styles
    item.disabled && 'opacity-50 cursor-not-allowed'
  );

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className={listClasses} {...props}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className={getItemClasses(item, index)}
          onClick={() => !item.disabled && onItemClick?.(item)}
        >
          <div className="flex-1 min-w-0">
            {item.content}
          </div>
          {item.actions && (
            <div className="flex items-center space-x-2 ml-4">
              {item.actions}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

List.displayName = 'List';

export { List };