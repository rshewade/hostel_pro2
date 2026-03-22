import { type ClassValue, clsx } from 'clsx';

/**
 * Merge CSS class names. Supports strings, objects, arrays (via clsx).
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Generate unique IDs for non-SSR contexts.
 * For React components, use React's useId() hook instead.
 */
let counter = 0;
export function uniqueId(prefix = 'id'): string {
  counter++;
  return `${prefix}-${counter}-${Date.now()}`;
}
