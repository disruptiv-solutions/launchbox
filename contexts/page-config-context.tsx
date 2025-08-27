"use client";

import React, { createContext, useContext } from 'react';
import { PageConfig } from '../types';

const defaultPageConfig: PageConfig = {
  enableLessons: true,
  enableApps: true,
  enableCommunity: true
};

const PageConfigContext = createContext<{ pageConfig: PageConfig } | undefined>(undefined);

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
  const pageConfig = { ...defaultPageConfig, ...config };

  return (
    <PageConfigContext.Provider value={{ pageConfig }}>
      {children}
    </PageConfigContext.Provider>
  );
};