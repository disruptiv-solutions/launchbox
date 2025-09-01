"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  resolveTenantFromHostname, 
  getCurrentTenantId, 
  DEFAULT_TENANT_ID,
  type TenantInfo 
} from '../lib/tenant-utils';

interface TenantContextType {
  tenantId: string;
  tenantInfo: TenantInfo | null;
  loading: boolean;
  isValidTenant: boolean;
  hasAccess: boolean;
  accessDeniedReason?: string;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: React.ReactNode;
  // Allow manual tenant ID override (useful for testing)
  overrideTenantId?: string;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ 
  children, 
  overrideTenantId 
}) => {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValidTenant, setIsValidTenant] = useState(false);
  const [userTenantId, setUserTenantId] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | undefined>();

  // Get tenant ID - priority: override > user's tenantId > domain > default
  const tenantId = overrideTenantId || userTenantId || getCurrentTenantId();

  const validateTenant = async (tenant: TenantInfo): Promise<boolean> => {
    try {
      console.log(`🔍 [TENANT] Validating tenant:`, tenant);

      // For default tenant, always valid (no need to check Firestore)
      if (tenant.id === DEFAULT_TENANT_ID) {
        console.log(`✅ [TENANT] Default tenant validated`);
        return true;
      }

      console.log(`🔍 [TENANT] Checking tenants/${tenant.id}`);

      // Check if tenant configuration exists in Firestore
      const configDoc = await getDoc(doc(db, 'tenants', tenant.id));

      console.log(`🔍 [TENANT] Config doc exists:`, configDoc.exists());

      if (configDoc.exists()) {
        console.log(`✅ [TENANT] Tenant ${tenant.id} validated - config found`);
        return true;
      }

      // For custom domains, check if they're registered
      if (tenant.customDomain) {
        // In a real implementation, you'd check a custom domains mapping
        // For now, we'll allow custom domains but mark them for validation
        console.warn(`⚠️ [TENANT] Custom domain ${tenant.customDomain} not validated`);
        return true; // Allow for now, but should be validated in production
      }

      console.log(`❌ [TENANT] Tenant ${tenant.id} validation failed - no config found`);
      return false;
    } catch (error) {
      console.error(`🚨 [TENANT] Error validating tenant ${tenant.id}:`, error);
      console.error(`🚨 [TENANT] Error details:`, {
        code: error.code,
        message: error.message,
        tenantId: tenant.id
      });
      return tenant.id === DEFAULT_TENANT_ID; // Fallback to default only
    }
  };

  const loadTenant = async () => {
    try {
      console.log(`🏢 [TENANT] Loading tenant context, ID: ${tenantId}`);
      setLoading(true);

      let resolvedTenantInfo: TenantInfo;

      if (overrideTenantId) {
        // Manual override (for testing)
        resolvedTenantInfo = {
          id: overrideTenantId,
          isValid: true
        };
      } else {
        // Use the resolved tenantId (from user document or hostname)
        resolvedTenantInfo = {
          id: tenantId,
          isValid: true
        };
      }

      // Validate tenant exists and is accessible
      const isValid = await validateTenant(resolvedTenantInfo);

      setTenantInfo(resolvedTenantInfo);
      setIsValidTenant(isValid);

      // If invalid tenant, you might want to redirect to default or show error
      if (!isValid && resolvedTenantInfo.id !== DEFAULT_TENANT_ID) {
        console.warn(`Invalid tenant: ${resolvedTenantInfo.id}, falling back to default`);
        // In production, you might want to redirect to the main platform
      }

    } catch (error) {
      console.error('Error loading tenant:', error);
      // Fallback to default tenant
      setTenantInfo({
        id: DEFAULT_TENANT_ID,
        isValid: true
      });
      setIsValidTenant(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshTenant = async () => {
    await loadTenant();
  };

  // Check if user has access to the requested tenant
  const checkTenantAccess = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // No user logged in - allow access (auth will handle this)
        console.log(`🔒 [TENANT] No user logged in, allowing access`);
        setHasAccess(true);
        setAccessDeniedReason(undefined);
        return;
      }

      // Get user data to check role and assigned tenant
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        console.warn(`🚨 [TENANT] User document not found for access check`);
        setHasAccess(true); // Allow access if user doc doesn't exist yet
        return;
      }

      const userData = userDoc.data();
      const userAssignedTenant = userData.tenantId || DEFAULT_TENANT_ID;
      const userRole = userData.role || 'free';

      console.log(`🔒 [TENANT] Access check details:`);
      console.log(`🔒 [TENANT]   - User assigned tenant: ${userAssignedTenant}`);
      console.log(`🔒 [TENANT]   - Requested tenant: ${tenantId}`);
      console.log(`🔒 [TENANT]   - User role: ${userRole}`);

      // Super admins can access any tenant
      if (userRole === 'superadmin') {
        console.log(`✅ [TENANT] Super admin access granted to ${tenantId}`);
        setHasAccess(true);
        setAccessDeniedReason(undefined);
        return;
      }

      // Regular users can only access their assigned tenant
      if (userAssignedTenant === tenantId) {
        console.log(`✅ [TENANT] User access granted to own tenant: ${tenantId}`);
        setHasAccess(true);
        setAccessDeniedReason(undefined);
      } else {
        console.log(`🚫 [TENANT] Access denied - User belongs to '${userAssignedTenant}', trying to access '${tenantId}'`);
        setHasAccess(false);
        setAccessDeniedReason(`You don't have access to this workspace. Your account is registered with a different tenant.`);
      }
    } catch (error) {
      console.error(`🚨 [TENANT] Error checking tenant access:`, error);
      // On error, deny access to be safe
      setHasAccess(false);
      setAccessDeniedReason('Error checking access permissions.');
    }
  };

  // Listen for auth state changes to get user's tenantId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(`🏢 [TENANT] Auth user detected: ${user.uid}`);
        setLoading(true); // Set loading while we fetch tenant
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userTenant = userData.tenantId || DEFAULT_TENANT_ID;
            console.log(`🏢 [TENANT] User's tenantId: ${userTenant}`);
            setUserTenantId(userTenant);
          } else {
            console.log(`🏢 [TENANT] No user document found, using default`);
            setUserTenantId(DEFAULT_TENANT_ID);
          }
        } catch (error) {
          console.error(`🚨 [TENANT] Error loading user tenantId:`, error);
          setUserTenantId(DEFAULT_TENANT_ID);
        } finally {
          // Loading will be set to false when loadTenant completes
        }
      } else {
        console.log(`🏢 [TENANT] No auth user, using default tenant`);
        setUserTenantId(DEFAULT_TENANT_ID);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load tenant on mount and when tenantId changes
  useEffect(() => {
    // Only load tenant if we have a tenantId and user auth has resolved
    if (tenantId && userTenantId !== null) {
      loadTenant();
    } else if (overrideTenantId) {
      // Handle override case immediately
      loadTenant();
    }
  }, [tenantId, overrideTenantId, userTenantId]);

  // Check tenant access when tenant or auth changes
  useEffect(() => {
    if (tenantId && userTenantId !== null) {
      checkTenantAccess();
    }
  }, [tenantId, userTenantId]);

  // Listen for hostname changes (if user navigates to different subdomain)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocationChange = () => {
      const newTenantInfo = resolveTenantFromHostname(window.location.hostname);
      if (newTenantInfo.id !== tenantInfo?.id) {
        loadTenant();
      }
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [tenantInfo?.id]);

  const value: TenantContextType = {
    tenantId,
    tenantInfo,
    loading,
    isValidTenant,
    hasAccess,
    accessDeniedReason,
    refreshTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

/**
 * Hook to get tenant-aware database collection name
 */
export const useTenantCollection = (baseCollection: string): string => {
  const { tenantId } = useTenant();

  if (tenantId === DEFAULT_TENANT_ID) {
    return baseCollection;
  }

  return `${baseCollection}_${tenantId}`;
};

/**
 * Hook to check if current user has tenant admin access
 */
export const useTenantAdmin = () => {
  const { tenantId, isValidTenant } = useTenant();
  // This would integrate with your auth system
  // For now, just return the tenant info
  return {
    canManageTenant: isValidTenant,
    tenantId
  };
};