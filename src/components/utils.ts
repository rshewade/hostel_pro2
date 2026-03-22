/**
 * Merge CSS class names. Filters out falsy values and joins.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}
