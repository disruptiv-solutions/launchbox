"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PageConfig } from '../types';

const defaultPageConfig: PageConfig = {
  enableLessons: true,
  enableApps: true,
  enableCommunity: true
};

interface PageConfigContextType {
  pageConfig: PageConfig;
  refreshPageConfig: () => Promise<void>;
}

const PageConfigContext = createContext<PageConfigContextType | undefined>(undefined);

export const usePageConfig = () => {
  const context = useContext(PageConfigContext);
  if (context === undefined) {
    throw new Error('usePageConfig must be used within a PageConfigProvider');
  }
  return context;
};

interface PageConfigProviderProps {
  children: React.ReactNode;
  config?: Partial<PageConfig>;
}

export const PageConfigProvider: React.FC<PageConfigProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    ...defaultPageConfig,
    ...config
  });

  const refreshPageConfig = async () => {
    try {
      // Import Firebase dynamically to avoid SSR issues
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase-config');

      const configDoc = await getDoc(doc(db, 'settings', 'pages'));
      if (configDoc.exists()) {
        const firestoreConfig = configDoc.data() as PageConfig;
        setPageConfig({ ...defaultPageConfig, ...firestoreConfig });
      }
    } catch (error) {
      console.error('Error loading page config:', error);
      // Keep current config if loading fails
    }
  };

  // Load config on mount
  useEffect(() => {
    refreshPageConfig();
  }, []);

  return (
    <PageConfigContext.Provider value={{ 
      pageConfig,
      refreshPageConfig
    }}>
      {children}
    </PageConfigContext.Provider>
  );
};