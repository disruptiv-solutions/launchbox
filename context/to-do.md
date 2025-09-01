# To-Do Items

## High Priority
- [ ] Add database persistence for tenant availability checking (currently using mock data)
- [ ] Implement proper Firebase Admin SDK initialization for production environment
- [ ] Add email verification flow for new tenant owners
- [ ] Create tenant management dashboard for superadmins

## Medium Priority
- [ ] Add custom domain support for tenants
- [ ] Implement tenant subscription management
- [ ] Add tenant analytics and usage tracking
- [ ] Create tenant backup and restore functionality
- [ ] Add multi-language support for tenant branding

## Low Priority
- [ ] Add tenant theme preview functionality
- [ ] Implement tenant-specific SSL certificate management
- [ ] Add tenant migration tools
- [ ] Create tenant white-label documentation generator
- [ ] Add tenant performance monitoring

## Bug Fixes
- [ ] Fix Next.js metadata warnings (viewport and themeColor should be moved to viewport export)
- [ ] Optimize subdomain checking API performance
- [ ] Add proper error boundaries for tenant signup flow

## Security & Performance
- [ ] Add rate limiting to subdomain availability API
- [ ] Implement proper CSRF protection for tenant creation
- [ ] Add input validation and sanitization for all tenant data
- [ ] Optimize tenant resolution performance for high traffic

## Documentation
- [ ] Create tenant setup guide for end users
- [ ] Add API documentation for tenant management endpoints
- [ ] Document multi-tenant architecture decisions
- [ ] Create troubleshooting guide for common tenant issues

## In Progress / Next
- [ ] Replace ad-hoc Links with shared TenantLink where applicable (ensure all internal navigation is tenant-aware)
- [ ] Move Next.js `viewport` and `themeColor` to `export const viewport` in affected routes to clear warnings
- [ ] Add missing public/images assets or update paths used in dashboard pages
- [ ] Implement `/api/stripe/*` routes to enable subscription flows used by subscription-service
- [ ] Add admin-only maintenance pages (placeholders exist; wire up actions safely)
- [ ] Document middleware routing strategy (prod subdomain vs dev path) in README/CLAUDE
- [ ] Add unit tests for `middleware.ts` path rewrite and cookie behavior