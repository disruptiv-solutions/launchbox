// app/providers.tsx
"use client";

import { AuthProvider } from '../contexts/auth-context';
import { PageConfigProvider } from '../contexts/page-config-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <PageConfigProvider>
        {children}
      </PageConfigProvider>
    </AuthProvider>
  );
}