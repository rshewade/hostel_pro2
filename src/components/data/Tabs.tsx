'use client';

import { useState, createContext, useContext } from 'react';
import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps extends BaseComponentProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

// Context for tab state management
const TabsContext = createContext<{
  activeTab: string;
  onTabChange: (tabId: string) => void;
} | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs component');
  }
  return context;
};

// Main Tabs component
const Tabs = ({
  className,
  tabs,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  ...props
}: TabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || controlledActiveTab || tabs[0]?.id || ''
  );

  const activeTab = controlledActiveTab || internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const tabsClasses = cn(
    // Base tabs styles
    'flex',

    // Full width
    fullWidth && 'w-full',

    // Custom classes
    className
  );

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div {...props}>
        <div className={tabsClasses}>
          {tabs.map((tab) => (
            <TabTrigger
              key={tab.id}
              tab={tab}
              variant={variant}
              size={size}
              fullWidth={fullWidth}
            />
          ))}
        </div>

        <div className="mt-4">
          {tabs.map((tab) => (
            <TabContent key={tab.id} tab={tab} />
          ))}
        </div>
      </div>
    </TabsContext.Provider>
  );
};

// Tab trigger component
interface TabTriggerProps {
  tab: TabItem;
  variant: 'default' | 'pills' | 'underline';
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
}

const TabTrigger = ({ tab, variant, size, fullWidth }: TabTriggerProps) => {
  const { activeTab, onTabChange } = useTabs();
  const isActive = activeTab === tab.id;

  const triggerClasses = cn(
    // Base trigger styles
    'inline-flex items-center justify-center font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',

    // Size variants
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    },

    // Full width
    fullWidth && 'flex-1',

    // Variant styles
    variant === 'default' && !isActive && 'border-b-2 text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300',
    variant === 'default' && isActive && 'border-b-2 text-navy-900 border-gold-500',
    variant === 'pills' && !isActive && 'rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    variant === 'pills' && isActive && 'rounded-md text-white bg-navy-900',
    variant === 'underline' && !isActive && 'border-b-2 text-gray-500 hover:text-gray-700 border-transparent',
    variant === 'underline' && isActive && 'border-b-2 text-navy-900 border-gold-500'
  );

  return (
    <button
      className={triggerClasses}
      onClick={() => !tab.disabled && onTabChange(tab.id)}
      disabled={tab.disabled}
      aria-selected={isActive}
      role="tab"
    >
      {tab.icon && (
        <span className="mr-2 inline-flex items-center">
          {tab.icon}
        </span>
      )}
      {tab.label}
    </button>
  );
};

// Tab content component
interface TabContentProps {
  tab: TabItem;
}

const TabContent = ({ tab }: TabContentProps) => {
  const { activeTab } = useTabs();
  const isActive = activeTab === tab.id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      aria-labelledby={tab.id}
      className="focus:outline-none"
    >
      {tab.content}
    </div>
  );
};

Tabs.displayName = 'Tabs';

export { Tabs };