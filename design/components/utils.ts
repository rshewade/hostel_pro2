// components/utils.ts - Utility functions for components
import { type ClassValue, clsx } from "clsx";

// Utility for merging Tailwind classes (fallback)
export function cn(...inputs: ClassValue[]) {
  if (inputs.length === 0) return '';
  
  return inputs
    .filter(Boolean)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Generate unique IDs for non-SSR contexts.
 *
 * WARNING: Do NOT use this for form elements that need SSR hydration!
 * For React components, use React's `useId()` hook instead to avoid
 * hydration mismatches between server and client.
 *
 * This function is only safe for:
 * - Client-only components (marked with 'use client')
 * - Dynamic content generated after initial render
 * - Non-critical IDs that don't affect accessibility
 *
 * @deprecated For form elements, use React's useId() hook instead
 */
export function generateId(prefix = 'component') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function for search inputs, etc.
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format currency for Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  // Assuming Indian phone numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Get status color classes
export function getStatusColorClasses(status: string): string {
  const statusMap: Record<string, string> = {
    'approved': 'bg-green-50 text-green-700 border-green-200',
    'rejected': 'bg-red-50 text-red-700 border-red-200',
    'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'review': 'bg-blue-50 text-blue-700 border-blue-200',
    'submitted': 'bg-gray-50 text-gray-700 border-gray-200',
    'draft': 'bg-gray-50 text-gray-600 border-gray-300',
    'paid': 'bg-green-50 text-green-700 border-green-200',
    'unpaid': 'bg-red-50 text-red-700 border-red-200',
    'overdue': 'bg-red-50 text-red-800 border-red-300',
    'active': 'bg-green-50 text-green-700 border-green-200',
    'inactive': 'bg-gray-50 text-gray-600 border-gray-300',
    'verified': 'bg-green-50 text-green-700 border-green-200',
    'unverified': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return statusMap[status.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
}

// Get priority color classes
export function getPriorityColorClasses(priority: string): string {
  const priorityMap: Record<string, string> = {
    'high': 'bg-red-50 text-red-700 border-red-200',
    'medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'low': 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return priorityMap[priority.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
}

// Sort function for tables
export function sortData<T>(
  data: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}