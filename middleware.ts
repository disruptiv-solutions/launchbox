import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Keep in sync with lib/tenant-utils.ts
const DEFAULT_TENANT_ID = 'default';
const PLATFORM_DOMAINS = [
  'ianmcdonald.ai',
  'yourplatform.com',
  'vercel.app'
];

const AUTH_PATHS = ['/login', '/signup'];

const isStaticAsset = (pathname: string): boolean => {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public')
  );
};

const getMainDomain = (hostname: string): string => {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(1).join('.');
};

const isPlatformDomain = (hostname: string): boolean => {
  const mainDomain = getMainDomain(hostname);
  return PLATFORM_DOMAINS.some(
    (d) => mainDomain === d || mainDomain.endsWith(`.${d}`)
  );
};

const getSubdomain = (hostname: string): string | null => {
  const parts = hostname.split('.');
  if (parts.length < 3) return null;
  return parts[0];
};

const getPathTenant = (pathname: string): string | null => {
  const match = pathname.match(/^\/([^\/]+)(?:\/|$)/);
  if (!match) return null;
  const segment = match[1];
  // Ignore reserved top-level routes
  if (
    ['api', '_next', 'login', 'signup', 'dashboard'].includes(segment)
  ) {
    return null;
  }
  return segment;
};

export function middleware(req: NextRequest) {
  const { nextUrl, headers, cookies } = req;
  const hostname = headers.get('host') || '';
  const pathname = nextUrl.pathname;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const isLocalhost = hostname.startsWith('localhost') || /\d+\.\d+\.\d+\.\d+/.test(hostname);
  const onPlatform = isPlatformDomain(hostname);

  // Determine tenant from subdomain (prod) or path (dev)
  const sub = getSubdomain(hostname);
  const pathTenant = getPathTenant(pathname);
  const cookieTenant = cookies.get('tenantId')?.value;

  let resolvedTenant = DEFAULT_TENANT_ID;

  if (!isLocalhost && onPlatform && sub) {
    resolvedTenant = sub;
  } else if (isLocalhost && pathTenant) {
    resolvedTenant = pathTenant;
  } else if (cookieTenant) {
    resolvedTenant = cookieTenant;
  }

  // Persist resolved tenant into cookie for client usage
  let res = NextResponse.next();
  if (resolvedTenant && cookies.get('tenantId')?.value !== resolvedTenant) {
    res.cookies.set('tenantId', resolvedTenant, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax'
    });
  }

  // In development, if a tenant path prefix is present, rewrite to base routes
  // Example: /acme/dashboard -> /dashboard (URL remains /acme/dashboard)
  if (isLocalhost && pathTenant) {
    const url = new URL(nextUrl);
    url.pathname = pathname.replace(/^\/[^\/]+/, '') || '/';
    res = NextResponse.rewrite(url);
    if (resolvedTenant && cookies.get('tenantId')?.value !== resolvedTenant) {
      res.cookies.set('tenantId', resolvedTenant, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax'
      });
    }
    return res;
  }

  // Enforce subdomain usage in production platform domains
  if (!isLocalhost && onPlatform && !AUTH_PATHS.includes(pathname)) {
    const mainDomain = getMainDomain(hostname);
    // If on apex (no subdomain) but we have a tenant, redirect to subdomain
    if (!sub && resolvedTenant && resolvedTenant !== DEFAULT_TENANT_ID) {
      const url = new URL(nextUrl);
      url.hostname = `${resolvedTenant}.${mainDomain}`;
      return NextResponse.redirect(url);
    }
  }

  // In dev (localhost), standardize path-based routing: ensure tenant prefix when we have one
  if (isLocalhost && resolvedTenant && resolvedTenant !== DEFAULT_TENANT_ID) {
    const hasPrefix = !!pathTenant;
    const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));
    if (!hasPrefix && !isAuth) {
      const url = new URL(nextUrl);
      url.pathname = `/${resolvedTenant}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|assets|public).*)']
};


