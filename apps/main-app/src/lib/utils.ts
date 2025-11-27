import type { ClassValue } from 'clsx';
import clsx from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 * 
 * @example
 * ```tsx
 * <div className={cn('px-4 py-2', error && 'border-red-500', className)} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
