"use client";

import { useState, useEffect } from 'react';

/**
 * Hook to detect media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Listen for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);

    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Common breakpoint hooks
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsLarge = () => useMediaQuery('(min-width: 1280px)');
export const useIsXLarge = () => useMediaQuery('(min-width: 1536px)');

/**
 * Dark mode detection
 */
export const usePrefersDark = () => useMediaQuery('(prefers-color-scheme: dark)');

/**
 * Reduced motion detection
 */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');