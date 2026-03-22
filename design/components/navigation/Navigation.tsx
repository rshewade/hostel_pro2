import { cn } from '../utils';
import { USER_ROLES, HOSTEL_VERTICALS } from '../constants';

interface NavigationItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
  role?: string[];
  vertical?: string[];
  children?: NavigationItemProps[];
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface NavigationProps {
  role: string;
  vertical: string;
  items: NavigationItemProps[];
  variant: 'top' | 'side' | 'breadcrumbs';
  className?: string;
  onVerticalChange?: (vertical: string) => void;
  onRoleChange?: (role: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  role,
  vertical,
  items,
  variant,
  className,
  onVerticalChange,
  onRoleChange
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'top':
        return 'top-nav';
      case 'side':
        return `side-nav ${role}-nav ${vertical}-context`;
      case 'breadcrumbs':
        return 'breadcrumbs';
      default:
        return '';
    }
  };

  const renderNavigation = () => {
    switch (variant) {
      case 'top':
        return <TopNavigation items={items} role={role} vertical={vertical} />;
      case 'side':
        return <SideNavigation items={items} role={role} vertical={vertical} />;
      case 'breadcrumbs':
        return <Breadcrumbs items={items} />;
      default:
        return null;
    }
  };

  return (
    <nav className={cn(getVariantClasses(), className)}>
      {renderNavigation()}
    </nav>
  );
};

// Top Navigation Component
const TopNavigation: React.FC<{ items: NavigationItemProps[]; role: string; vertical: string }> = ({
  items,
  role,
  vertical
}) => {
  return (
    <header className="top-nav">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Vertical Selector */}
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-navy-950">Hostel Management</div>
            <VerticalSelector currentVertical={vertical} />
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {items.map(item => (
              <NavigationLink
                key={item.id}
                item={item}
                role={role}
                vertical={vertical}
              />
            ))}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

// Side Navigation Component
const SideNavigation: React.FC<{ items: NavigationItemProps[]; role: string; vertical: string }> = ({
  items,
  role,
  vertical
}) => {
  return (
    <aside className={`side-nav ${role}-nav ${vertical}-context`}>
      <nav className="py-6">
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id}>
              <NavigationItem
                item={item}
                role={role}
                vertical={vertical}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

// Breadcrumbs Component
const Breadcrumbs: React.FC<{ items: NavigationItemProps[] }> = ({ items }) => {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((path, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
            <NavigationLink
              item={path}
              active={index === items.length - 1}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Navigation Link Component
const NavigationLink: React.FC<{ item: NavigationItemProps; role?: string; vertical?: string; active?: boolean }> = ({
  item,
  role,
  vertical,
  active
}) => {
  const isAccessible = item.role && role ? item.role.includes(role) : true;
  const isVerticalAccessible = item.vertical && vertical ? item.vertical.includes(vertical) : true;
  
  if (!isAccessible || !isVerticalAccessible) {
    return null;
  }

  return (
    <button
      onClick={item.onClick}
      disabled={item.disabled}
      className={cn(
        'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        active 
          ? 'bg-gold-100 text-gold-800' 
          : 'text-navy-700 hover:bg-gray-100',
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {item.icon && <span className="w-4 h-4">{item.icon}</span>}
      <span>{item.label}</span>
      {item.badge && (
        <span className={cn(
          'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full',
          item.badgeColor === 'success' && 'bg-green-100 text-green-800',
          item.badgeColor === 'warning' && 'bg-yellow-100 text-yellow-800',
          item.badgeColor === 'error' && 'bg-red-100 text-red-800',
          item.badgeColor === 'info' && 'bg-blue-100 text-blue-800',
          'bg-gray-100 text-gray-800'
        )}>
          {item.badge}
        </span>
      )}
    </button>
  );
};

// Navigation Item Component (for side nav with children)
const NavigationItem: React.FC<{ item: NavigationItemProps; role: string; vertical: string }> = ({
  item,
  role,
  vertical
}) => {
  const isAccessible = item.role ? item.role.includes(role) : true;
  const isVerticalAccessible = item.vertical ? item.vertical.includes(vertical) : true;
  
  if (!isAccessible || !isVerticalAccessible) {
    return null;
  }

  return (
    <div>
      <button
        onClick={item.onClick}
        disabled={item.disabled}
        className={cn(
          'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          item.active 
            ? 'bg-gold-100 text-gold-800' 
            : 'text-navy-700 hover:bg-gray-100',
          item.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {item.icon && <span className="w-5 h-5">{item.icon}</span>}
        <span className="flex-1 text-left">{item.label}</span>
        {item.children && <ChevronRight className="w-4 h-4" />}
        {item.badge && (
          <span className={cn(
            'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full',
            item.badgeColor === 'success' && 'bg-green-100 text-green-800',
            item.badgeColor === 'warning' && 'bg-yellow-100 text-yellow-800',
            item.badgeColor === 'error' && 'bg-red-100 text-red-800',
            item.badgeColor === 'info' && 'bg-blue-100 text-blue-800',
            'bg-gray-100 text-gray-800'
          )}>
            {item.badge}
          </span>
        )}
      </button>
      
      {item.children && item.active && (
        <ul className="ml-8 mt-2 space-y-1">
          {item.children.map(child => (
            <NavigationLink
              key={child.id}
              item={child}
              role={role}
              vertical={vertical}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

// Vertical Selector Component
const VerticalSelector: React.FC<{ currentVertical: string }> = ({ currentVertical }) => {
  const verticals = Object.values(HOSTEL_VERTICALS);
  
  return (
    <select 
      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
      defaultValue={currentVertical}
    >
      {verticals.map(vertical => (
        <option key={vertical} value={vertical}>
          {vertical}
        </option>
      ))}
    </select>
  );
};

// User Menu Component
const UserMenu: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <button className="text-navy-700 hover:text-navy-900">
        <Bell className="w-5 h-5" />
      </button>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
        <span className="text-sm font-medium text-navy-700">User</span>
      </div>
      <button className="text-navy-700 hover:text-navy-900">
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

// Helper Components (would be imported from icons library)
const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Bell = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const LogOut = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);