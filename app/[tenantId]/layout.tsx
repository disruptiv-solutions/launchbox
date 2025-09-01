//app/[tenantId]/layout.tsx
"use client";

import React from 'react';
import { TenantProvider } from '../../contexts/tenant-context';
import { ThemeProvider } from '../../contexts/theme-context';
import DashboardLayout from '../dashboard/layout';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: {
    tenantId: string;
  };
}

export default function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenantId } = params;

  console.log(`🏗️ [TENANT-LAYOUT] Rendering layout for tenant: ${tenantId}`);

  return (
    <TenantProvider overrideTenantId={tenantId}>
      <ThemeProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ThemeProvider>
    </TenantProvider>
  );
}