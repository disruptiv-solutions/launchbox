import { type ClassValue, clsx } from "clsx";

/**
 * Utility function to merge and deduplicate class names
 * Combines clsx functionality for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Utility to create theme-aware class names
 */
export function themeClass(base: string, variant?: string, size?: string) {
  return cn(
    base,
    variant && `${base}--${variant}`,
    size && `${base}--${size}`
  );
}

/**
 * Focus ring utility for accessibility
 */
export function focusRing(classes?: string) {
  return cn(
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    classes
  );
}