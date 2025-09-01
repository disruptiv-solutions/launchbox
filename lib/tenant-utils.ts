/**
 * Tenant Resolution Utilities
 * Handles tenant detection from domains, subdomains, and routing
 */

import { WhiteLabelConfig, TenantSignupData, UserRole } from '../types';

export interface TenantInfo {
  id: string;
  subdomain?: string;
  customDomain?: string;
  isValid: boolean;
  isPathBased?: boolean;
}

export const DEFAULT_TENANT_ID = 'default';

/**
 * Extract tenant information from URL path
 * Supports patterns like:
 * - /tenant-name/dashboard/... (path-based routing)
 * - /tenant-name/ (tenant root)
 * Returns null if no path-based tenant found
 */
export function resolveTenantFromPath(pathname: string): TenantInfo | null {
  // Skip if it's a default route (starts with /dashboard, /api, etc.)
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/_next') ||
      pathname === '/' ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup')) {
    return null;
  }

  // Extract tenant from path: /tenant-name/... 
  const pathMatch = pathname.match(/^\/([^\/]+)(?:\/|$)/);
  if (!pathMatch) return null;

  const tenantId = pathMatch[1];

  // Validate tenant ID format and check it's not reserved
  if (!isValidTenantId(tenantId) || isReservedSubdomain(tenantId)) {
    return null;
  }

  console.log(`🛤️ [TENANT-UTILS] Path-based tenant detected: ${tenantId} from ${pathname}`);

  return {
    id: tenantId,
    isValid: true,
    isPathBased: true
  };
}

/**
 * Extract tenant information from hostname
 * Supports patterns like:
 * - tenant1.yourplatform.com (subdomain)
 * - custom-domain.com (custom domain mapped to tenant)
 * - localhost:3000 (development - uses default)
 */
export function resolveTenantFromHostname(hostname: string): TenantInfo {
  // Handle localhost and IP addresses (development)
  if (hostname === 'localhost' || hostname.startsWith('localhost:') || 
      hostname.match(/^\d+\.\d+\.\d+\.\d+/)) {
    return {
      id: DEFAULT_TENANT_ID,
      isValid: true
    };
  }

  // Handle subdomains (tenant.yourplatform.com)
  const parts = hostname.split('.');

  // If it's a subdomain of your main platform
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const mainDomain = parts.slice(1).join('.');

    // List of your main platform domains
    const platformDomains = [
      'ianmcdonald.ai',
      'yourplatform.com', // Add your actual platform domain
      'vercel.app' // For Vercel deployments
    ];

    if (platformDomains.some(domain => mainDomain === domain || mainDomain.endsWith(`.${domain}`))) {
      // Validate subdomain (alphanumeric, hyphens allowed)
      if (/^[a-z0-9-]+$/.test(subdomain) && subdomain.length >= 2) {
        return {
          id: subdomain,
          subdomain,
          isValid: true
        };
      }
    }
  }

  // Handle custom domains
  // For custom domains, you'd typically have a mapping in your database
  // For now, we'll use the hostname as the tenant ID if it's not a platform domain
  const customDomainTenantId = hostname.replace(/[^a-z0-9-]/g, '-').toLowerCase();

  return {
    id: customDomainTenantId,
    customDomain: hostname,
    isValid: true // You should validate this against your tenant database
  };
}

/**
 * Get tenant ID from current window location (client-side)
 */
export function getCurrentTenantId(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_TENANT_ID;
  }

  // First try path-based resolution
  const pathTenantInfo = resolveTenantFromPath(window.location.pathname);
  if (pathTenantInfo) {
    console.log(`🛤️ [TENANT-UTILS] Using path-based tenant: ${pathTenantInfo.id}`);
    return pathTenantInfo.id;
  }

  // Fallback to hostname-based resolution
  const tenantInfo = resolveTenantFromHostname(window.location.hostname);
  return tenantInfo.id;
}

/**
 * Generate URLs for tenant-specific routes
 * In development, uses path-based routing; in production, uses subdomains
 */
export function generateTenantUrl(
  tenantId: string, 
  path: string = '/', 
  protocol: string = 'https',
  forcePathBased: boolean = false
): string {
  if (tenantId === DEFAULT_TENANT_ID) {
    // Use your main platform domain
    const baseUrl = typeof window !== 'undefined' && window.location.hostname.includes('localhost')
      ? `http://localhost:3000`
      : `${protocol}://ianmcdonald.ai`;
    return `${baseUrl}${path}`;
  }

  // Use path-based routing for development or when forced
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
  if (isDevelopment || forcePathBased) {
    const baseUrl = typeof window !== 'undefined' && window.location.hostname.includes('localhost')
      ? `http://localhost:3000`
      : `${protocol}://ianmcdonald.ai`;
    return `${baseUrl}/${tenantId}${path}`;
  }

  // For subdomains in production
  return `${protocol}://${tenantId}.ianmcdonald.ai${path}`;
}

/**
 * Validate tenant ID format
 */
export function isValidTenantId(tenantId: string): boolean {
  return /^[a-z0-9-]+$/.test(tenantId) && 
         tenantId.length >= 2 && 
         tenantId.length <= 50 &&
         !tenantId.startsWith('-') &&
         !tenantId.endsWith('-');
}

/**
 * Get tenant-specific collection name for Firestore
 */
export function getTenantCollection(tenantId: string, baseCollection: string): string {
  if (tenantId === DEFAULT_TENANT_ID) {
    return baseCollection;
  }
  return `${baseCollection}_${tenantId}`;
}

/**
 * Reserved subdomains that cannot be used as tenant IDs
 */
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'dashboard',
  'mail',
  'email',
  'support',
  'help',
  'docs',
  'blog',
  'dev',
  'staging',
  'test',
  'cdn',
  'static',
  'assets',
  'files',
  'uploads'
];

/**
 * Check if a subdomain is reserved
 */
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}

/**
 * Create a new tenant with default configuration
 */
export async function createTenant(
  tenantSignupData: TenantSignupData,
  ownerId: string
): Promise<WhiteLabelConfig> {
  const { doc, setDoc, Timestamp } = await import('firebase/firestore');
  const { db } = await import('./firebase-config');

  // Generate tenant ID from subdomain
  const tenantId = tenantSignupData.subdomain.toLowerCase();

  // Validate tenant ID
  if (!isValidTenantId(tenantId)) {
    throw new Error('Invalid tenant ID format');
  }

  if (isReservedSubdomain(tenantId)) {
    throw new Error('This subdomain is reserved and cannot be used');
  }

  // Create default white-label configuration
  const defaultConfig: WhiteLabelConfig = {
    tenantId,
    companyName: tenantSignupData.companyName,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ownerId,

    // Default branding
    branding: {
      companyName: tenantSignupData.companyName,
      colors: {
        primary: tenantSignupData.primaryColor || '#19afe2', // Nova Blue default
        secondary: '#64748b', // Slate-500
        accent: '#0ea5e9', // Sky-500
        background: '#ffffff',
        text: '#1f2937'
      }
    },

    // Default content
    content: {
      welcomeMessage: `Welcome to ${tenantSignupData.companyName}!`,
      supportEmail: tenantSignupData.ownerEmail
    },

    // Default features
    features: {
      enableLessons: tenantSignupData.features?.enableLessons ?? true,
      enableApps: tenantSignupData.features?.enableApps ?? true,
      enableCommunity: tenantSignupData.features?.enableCommunity ?? true,
      enableAnalytics: true,
      enableSubscriptions: false, // Start with free features
      maxUsers: 10, // Initial limit
      customDomainAllowed: false
    },

    // Domain configuration
    domain: {
      subdomain: tenantId,
      sslEnabled: true
    },

    // Default settings
    settings: {
      allowUserRegistration: true,
      requireEmailVerification: false,
      defaultUserRole: 'free' as UserRole,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      backupEnabled: false
    },

    // Trial subscription
    subscription: {
      planId: 'trial',
      status: 'trial',
      trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)) // 14 days
    }
  };

  // Save to Firestore
  await setDoc(doc(db, 'tenants', tenantId), defaultConfig);

  console.log(`✅ [TENANT-UTILS] Created tenant: ${tenantId} for company: ${tenantSignupData.companyName}`);

  return defaultConfig;
}

/**
 * Check if a subdomain is available for use
 */
export async function checkSubdomainAvailability(subdomain: string): Promise<boolean> {
  try {
    // Validate format first
    if (!isValidTenantId(subdomain)) {
      return false;
    }

    // Check if reserved
    if (isReservedSubdomain(subdomain)) {
      return false;
    }

    // For client-side checking, use the API endpoint to avoid permission issues
    if (typeof window !== 'undefined') {
      const response = await fetch(`/api/tenant/check-availability?subdomain=${encodeURIComponent(subdomain)}`);
      const data = await response.json();
      return data.available;
    }

    // Server-side: Check if already exists in database
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase-config');
    
    const configDoc = await getDoc(doc(db, 'tenants', subdomain.toLowerCase()));
    return !configDoc.exists();
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return false;
  }
}

/**
 * Generate a tenant ID suggestion from company name
 */
export function generateTenantIdFromCompany(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 20); // Limit length
}

/**
 * Get tenant configuration from Firestore
 */
export async function getTenantConfig(tenantId: string): Promise<WhiteLabelConfig | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase-config');
    
    const configDoc = await getDoc(doc(db, 'tenants', tenantId));
    
    if (configDoc.exists()) {
      return configDoc.data() as WhiteLabelConfig;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting tenant config for ${tenantId}:`, error);
    return null;
  }
}

/**
 * Update tenant configuration
 */
export async function updateTenantConfig(
  tenantId: string, 
  updates: Partial<WhiteLabelConfig>
): Promise<void> {
  try {
    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase-config');
    
    await updateDoc(doc(db, 'tenants', tenantId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ [TENANT-UTILS] Updated tenant config: ${tenantId}`);
  } catch (error) {
    console.error(`Error updating tenant config for ${tenantId}:`, error);
    throw error;
  }
}