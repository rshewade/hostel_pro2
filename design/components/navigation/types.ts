// navigation/types.ts - Type definitions for navigation components

import { HOSTEL_VERTICALS, USER_ROLES } from '../constants';

export type HostelVertical = typeof HOSTEL_VERTICALS[keyof typeof HOSTEL_VERTICALS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface NavigationItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
  role?: UserRole[];
  vertical?: HostelVertical[];
  children?: NavigationItemProps[];
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export interface NavigationProps {
  role: UserRole;
  vertical: HostelVertical;
  items: NavigationItemProps[];
}

export interface NavigationProps {
  role: UserRole;
  vertical: HostelVertical;
  items: NavigationItemProps[];
  variant: 'top' | 'side' | 'breadcrumbs';
  className?: string;
  onVerticalChange?: (vertical: HostelVertical) => void;
  onRoleChange?: (role: UserRole) => void;
}

export interface TopNavigationProps extends Omit<NavigationProps, 'variant'> {
  variant: 'top';
}

export interface SideNavigationProps extends Omit<NavigationProps, 'variant'> {
  variant: 'side';
}

export interface BreadcrumbsProps extends Omit<NavigationProps, 'variant'> {
  variant: 'breadcrumbs';
}