//app/[tenantId]/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '../../../contexts/tenant-context';
import { useAuth } from '../../../contexts/auth-context';
import DashboardPage from '../../dashboard/page';
import { Card, CardContent } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';

interface TenantDashboardProps {
  params: {
    tenantId: string;
  };
}

export default function TenantDashboard({ params }: TenantDashboardProps) {
  const { tenantId } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { tenantInfo, loading: tenantLoading, hasAccess, accessDeniedReason } = useTenant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for hydration
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication and tenant
  if (authLoading || tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Loading tenant information...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  // Check if user has access to this tenant
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-6xl">🚫</div>
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              {accessDeniedReason || 'You do not have access to this tenant workspace.'}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Requested tenant: <strong>{tenantId}</strong></p>
              <p>Your tenant: <strong>{user.tenantId}</strong></p>
              <p>Your role: <strong>{user.role}</strong></p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Your Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validate tenant exists
  if (!tenantInfo || !tenantInfo.isValid) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-6xl">❓</div>
            <h1 className="text-2xl font-bold">Tenant Not Found</h1>
            <p className="text-muted-foreground">
              The workspace "{tenantId}" could not be found or is not valid.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Main Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log(`✅ [TENANT-DASHBOARD] Rendering dashboard for tenant: ${tenantId}`);
  console.log(`✅ [TENANT-DASHBOARD] User: ${user.displayName} (${user.role})`);
  console.log(`✅ [TENANT-DASHBOARD] Tenant info:`, tenantInfo);

  // Render the main dashboard component
  return <DashboardPage />;
}