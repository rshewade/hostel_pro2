// navigation/utils.ts - Navigation utilities

import type { NavigationItemProps, HostelVertical, UserRole } from './types';
import { navigationData } from './data';

export const getNavigationItems = (role: UserRole, vertical: HostelVertical): NavigationItemProps[] => {
  switch (role) {
    case 'Student':
      return navigationData.student;
    case 'Superintendent':
      return navigationData.superintendent;
    case 'Trustee':
      return navigationData.trustee;
    case 'Accounts':
      return navigationData.accounts;
    case 'Parent':
      return navigationData.parent;
    default:
      return [];
  }
};

export const getRoleSpecificNavigation = (role: UserRole): NavigationItemProps[] => {
  switch (role) {
    case 'Student':
      return navigationData.student;
    case 'Superintendent':
      return navigationData.superintendent;
    case 'Trustee':
      return navigationData.trustee;
    case 'Accounts':
      return navigationData.accounts;
    case 'Parent':
      return navigationData.parent;
    default:
      return [];
  }
};

export const getVerticalSpecificNavigation = (vertical: HostelVertical): NavigationItemProps[] => {
  // For now, return the same navigation for all verticals
  // This can be customized per vertical later
  return navigationData.student;
};

export const getRoleVerticalNavigation = (role: UserRole, vertical: HostelVertical): NavigationItemProps[] => {
  const roleNav = getNavigationItems(role, vertical);
  const verticalNav = getVerticalSpecificNavigation(vertical);
  
  // Combine role and vertical specific navigation
  return [...roleNav, ...verticalNav];
};