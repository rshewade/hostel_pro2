import type { NavigationItemProps } from '../types';

// Minimal navigation data without React components
export const navigationData = {
  accounts: [
    {
      id: 'receivables',
      label: 'Receivables Dashboard',
      path: '/receivables',
      role: ['Accounts' as const]
    },
    {
      id: 'payments',
      label: 'Payment Processing',
      path: '/payments',
      role: ['Accounts' as const]
    }
  ],
  parent: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      role: ['Parent' as const],
      active: true
    }
  ],
  student: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      role: ['Student' as const],
      active: true
    }
  ],
  superintendent: [
    {
      id: 'applications',
      label: 'Applications',
      path: '/applications',
      role: ['Superintendent' as const],
      badge: '12'
    }
  ],
  trustee: [
    {
      id: 'applications-review',
      label: 'Applications Review',
      path: '/applications-review',
      role: ['Trustee' as const]
    }
  ]
};