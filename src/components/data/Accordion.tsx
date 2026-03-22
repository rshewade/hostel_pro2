'use client';

import { useState, createContext, useContext } from 'react';
import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface AccordionProps extends BaseComponentProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultExpanded?: string[];
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered';
}

// Context for accordion state management
const AccordionContext = createContext<{
  type: 'single' | 'multiple';
  expanded: string[];
  onItemToggle: (itemId: string) => void;
} | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion component');
  }
  return context;
};

// Main Accordion component
const Accordion = ({
  className,
  items,
  type = 'single',
  defaultExpanded = [],
  expanded: controlledExpanded,
  onExpandedChange,
  size = 'md',
  variant = 'default',
  ...props
}: AccordionProps) => {
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpanded);
  const expanded = controlledExpanded || internalExpanded;

  const handleItemToggle = (itemId: string) => {
    let newExpanded: string[];

    if (type === 'single') {
      newExpanded = expanded.includes(itemId) ? [] : [itemId];
    } else {
      newExpanded = expanded.includes(itemId)
        ? expanded.filter(id => id !== itemId)
        : [...expanded, itemId];
    }

    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded);
    }
    onExpandedChange?.(newExpanded);
  };

  const accordionClasses = cn(
    // Base accordion styles
    'space-y-2',

    // Variant styles
    {
      'divide-y divide-gray-200': variant === 'bordered',
    },

    // Custom classes
    className
  );

  return (
    <AccordionContext.Provider value={{ type, expanded, onItemToggle: handleItemToggle }}>
      <div className={accordionClasses} {...props}>
        {items.map((item) => (
          <AccordionItemComponent
            key={item.id}
            item={item}
            size={size}
            variant={variant}
          />
        ))}
      </div>
    </AccordionContext.Provider>
  );
};

// Individual accordion item component
interface AccordionItemProps {
  item: AccordionItem;
  size: 'sm' | 'md' | 'lg';
  variant: 'default' | 'bordered';
}

const AccordionItemComponent = ({ item, size, variant }: AccordionItemProps) => {
  const { expanded, onItemToggle } = useAccordion();
  const isExpanded = expanded.includes(item.id);

  const itemClasses = cn(
    // Base item styles
    'border border-gray-200 rounded-lg bg-white',
    'focus-within:ring-2 focus-within:ring-gold-500 focus-within:ring-offset-2',

    // Variant adjustments
    variant === 'bordered' && 'border-0 border-b border-gray-200 rounded-none first:rounded-t-lg last:rounded-b-lg'
  );

  const headerClasses = cn(
    // Base header styles
    'flex items-center justify-between w-full text-left',
    'focus:outline-none transition-colors',

    // Size variants
    {
      'px-4 py-3': size === 'sm',
      'px-6 py-4': size === 'md',
      'px-8 py-6': size === 'lg',
    },

    // Interactive styles
    !item.disabled && 'hover:bg-gray-50 cursor-pointer',

    // Disabled styles
    item.disabled && 'opacity-50 cursor-not-allowed'
  );

  const contentClasses = cn(
    // Base content styles
    'overflow-hidden transition-all duration-200',

    // Size variants
    {
      'px-4': size === 'sm',
      'px-6': size === 'md',
      'px-8': size === 'lg',
    },

    // Expanded state
    isExpanded ? 'max-h-96 pb-4' : 'max-h-0'
  );

  return (
    <div className={itemClasses}>
      <button
        className={headerClasses}
        onClick={() => !item.disabled && onItemToggle(item.id)}
        disabled={item.disabled}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${item.id}`}
      >
        <div className="flex items-center">
          {item.icon && (
            <span className="mr-3 inline-flex items-center">
              {item.icon}
            </span>
          )}
          <span className="font-medium text-navy-900">
            {item.title}
          </span>
        </div>

        <svg
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isExpanded && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={`accordion-content-${item.id}`}
        className={contentClasses}
        aria-labelledby={`accordion-header-${item.id}`}
      >
        <div className="text-gray-700">
          {item.content}
        </div>
      </div>
    </div>
  );
};

Accordion.displayName = 'Accordion';

export { Accordion };