"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-config';
import { ThemeColors, ThemeConfig, BrandingConfig } from '../types';

interface ThemeContextType {
  theme: ThemeConfig;
  setThemeColors: (colors: Partial<ThemeColors>) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setBranding: (branding: BrandingConfig) => void;
  resetToPreset: (presetName: string) => void;
  loading: boolean;
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#3b82f6',    // Blue
    secondary: '#8b5cf6',  // Purple
    tertiary: '#10b981',   // Green
    quaternary: '#f59e0b', // Orange
    quinary: '#ef4444'     // Red
  },
  mode: 'system',
  branding: {
    title: 'Ian McDonald AI',
    logoUrl: ''
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [loading, setLoading] = useState(true);

  // Load theme from Firestore on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Apply theme to document root when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && theme.colors) {
      applyTheme(theme);
    }
  }, [theme, loading]);

  const resolveTenantId = async (): Promise<string> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return 'default';
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as Record<string, unknown>;
        const tenantId = (data && (data as any).tenantId) || 'default';
        return typeof tenantId === 'string' ? tenantId : 'default';
      }
      return 'default';
    } catch (_) {
      return 'default';
    }
  };

  const loadTheme = async () => {
    try {
      const tenantId = await resolveTenantId();
      const themeDoc = await getDoc(doc(db, 'settings', tenantId));
      if (themeDoc.exists()) {
        const themeData = themeDoc.data() as ThemeConfig;
        // Ensure the theme has the proper structure
        if (themeData.colors && typeof themeData.colors === 'object') {
          setTheme({
            colors: {
              primary: themeData.colors.primary || defaultTheme.colors.primary,
              secondary: themeData.colors.secondary || defaultTheme.colors.secondary,
              tertiary: themeData.colors.tertiary || defaultTheme.colors.tertiary,
              quaternary: themeData.colors.quaternary || defaultTheme.colors.quaternary,
              quinary: themeData.colors.quinary || defaultTheme.colors.quinary,
            },
            mode: themeData.mode || defaultTheme.mode,
            branding: {
              title: themeData.branding?.title || defaultTheme.branding.title,
              logoUrl: themeData.branding?.logoUrl || defaultTheme.branding.logoUrl,
            }
          });
        } else {
          // Fallback to default theme if structure is invalid
          setTheme(defaultTheme);
        }
      } else {
        // No theme document exists, use default
        setTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // On error, use default theme
      setTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (newTheme: ThemeConfig) => {
    try {
      const tenantId = await resolveTenantId();
      await setDoc(doc(db, 'settings', tenantId), newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const applyTheme = (config: ThemeConfig) => {
    if (typeof window === 'undefined') return;
    if (!config || !config.colors) return;

    const root = document.documentElement;

    // Apply color variables with fallbacks
    root.style.setProperty('--theme-primary', config.colors.primary || defaultTheme.colors.primary);
    root.style.setProperty('--theme-secondary', config.colors.secondary || defaultTheme.colors.secondary);
    root.style.setProperty('--theme-tertiary', config.colors.tertiary || defaultTheme.colors.tertiary);
    root.style.setProperty('--theme-quaternary', config.colors.quaternary || defaultTheme.colors.quaternary);
    root.style.setProperty('--theme-quinary', config.colors.quinary || defaultTheme.colors.quinary);

    // Apply dark mode
    if (config.mode === 'dark') {
      root.classList.add('dark');
    } else if (config.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const setThemeColors = async (colors: Partial<ThemeColors>) => {
    const newTheme = { 
      ...theme, 
      colors: { ...theme.colors, ...colors } 
    };
    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  const setThemeMode = async (mode: 'light' | 'dark' | 'system') => {
    const newTheme = { ...theme, mode };
    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  const setBranding = async (branding: BrandingConfig) => {
    const newTheme = { ...theme, branding };
    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  const resetToPreset = async (presetName: string) => {
    const presets: Record<string, ThemeColors> = {
      'ocean': {
        primary: '#0ea5e9',    // Sky blue
        secondary: '#3b82f6',  // Blue
        tertiary: '#1d4ed8',   // Blue dark
        quaternary: '#0f172a', // Slate dark
        quinary: '#64748b'     // Slate
      },
      'forest': {
        primary: '#059669',    // Emerald
        secondary: '#10b981',  // Emerald light
        tertiary: '#047857',   // Emerald dark
        quaternary: '#064e3b', // Emerald darker
        quinary: '#6b7280'     // Gray
      },
      'sunset': {
        primary: '#ea580c',    // Orange
        secondary: '#f97316',  // Orange light
        tertiary: '#dc2626',   // Red
        quaternary: '#7c2d12', // Orange dark
        quinary: '#fbbf24'     // Amber
      },
      'royal': {
        primary: '#7c3aed',    // Violet
        secondary: '#8b5cf6',  // Purple
        tertiary: '#ec4899',   // Pink
        quaternary: '#581c87', // Violet dark
        quinary: '#a855f7'     // Purple light
      },
      'crimson': {
        primary: '#dc2626',    // Red
        secondary: '#ef4444',  // Red light
        tertiary: '#f97316',   // Orange
        quaternary: '#7f1d1d', // Red dark
        quinary: '#fbbf24'     // Amber
      }
    };

    if (presets[presetName]) {
      await setThemeColors(presets[presetName]);
    }
  };

  const value: ThemeContextType = {
    theme,
    setThemeColors,
    setThemeMode,
    setBranding,
    resetToPreset,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};