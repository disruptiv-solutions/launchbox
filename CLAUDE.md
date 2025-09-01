# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## LaunchBox - Multi-Tenant SaaS Platform

A Next.js 14 application with Firebase backend designed for multi-tenant white-labeling capabilities.

## Development Commands

```bash
npm run dev          # Start development server on port 3000
npm run build        # Production build  
npm start            # Start production server on port 3000
npm run lint         # Run ESLint
```

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payments**: Stripe integration
- **Animations**: Framer Motion
- **UI Components**: Custom shadcn/ui-style components

## Architecture

### Directory Structure
```
app/
├── (auth)/           # Authentication pages (login, signup)
│   └── signup/
│       └── tenant/   # Multi-tenant signup flow (3 steps)
├── api/              # API routes
│   └── tenant/       # Tenant management APIs
│       └── check-availability/ # Subdomain availability checking
├── apps/             # Apps management
├── components/       # React components
│   ├── auth/         # Auth components
│   ├── profile/      # Profile management
│   ├── subscription/ # Stripe subscription
│   └── ui/           # Reusable UI components
└── dashboard/        # Admin dashboard

lib/
├── admin.ts          # Admin utilities
├── firebase-config.ts # Firebase configuration
├── profile.ts        # User profile utilities
├── storage.ts        # File storage utilities
├── tenant-utils.ts   # Comprehensive tenant management utilities
└── firestore.rules.txt # Security rules with tenant isolation

types/
└── index.ts          # TypeScript definitions (includes WhiteLabelConfig, TenantSignupData)

contexts/             # React contexts
├── auth-context.tsx  # Enhanced with signUpWithTenant
├── tenant-context.tsx # Tenant resolution and access control
└── theme-context.tsx # Tenant-specific theming

hooks/                # Custom React hooks
context/              # Project management
├── to-do.md          # Outstanding tasks and features
└── done.md           # Completed implementation details
```

### Key Features
- **Multi-tenant white-label system** with complete signup flow
- User authentication and role-based access (admin, premium, free, superadmin)
- **Tenant isolation** - Complete data separation between tenants
- **Custom branding per tenant** - Colors, logos, company names
- **Subdomain/path-based routing** - tenant.platform.com or platform.com/tenant
- Admin dashboard with analytics
- Community features
- Subscription management
- Privacy settings and user preferences

## Multi-Tenant System Implementation

### Core Components
- **`lib/tenant-utils.ts`**: Complete tenant management system with creation, validation, and resolution
- **`contexts/auth-context.tsx`**: Enhanced with `signUpWithTenant` for automatic tenant admin assignment
- **`contexts/tenant-context.tsx`**: Tenant resolution from URLs and access control
- **`app/(auth)/signup/tenant/`**: 3-step tenant signup flow
- **`app/api/tenant/check-availability/`**: Real-time subdomain availability API

### Features Implemented
- **Tenant Creation**: Automatic tenant setup during user signup
- **Subdomain Validation**: Real-time availability checking with reserved names
- **Custom Branding**: Per-tenant colors, company names, and feature toggles
- **User Isolation**: Each tenant has separate user base with proper admin assignment
- **Security Rules**: Comprehensive Firestore rules ensuring tenant data isolation
- **Routing Support**: Both subdomain-based (production) and path-based (development)

### Data Structure
```typescript
interface WhiteLabelConfig {
  tenantId: string;
  companyName: string;
  branding: { colors, logos, themes };
  features: { enableLessons, enableApps, enableCommunity };
  domain: { subdomain, customDomain };
  settings: { userRegistration, emailVerification };
  subscription: { plan, trial status };
}
```

### Security & Access Control
- Firestore security rules with tenant isolation
- Role-based permissions (admin can only access their tenant)
- Anonymous access for theme loading and subdomain checking
- Proper user-tenant assignment during signup

## Import Configuration

Uses `@/*` path mapping for clean imports:
```typescript
import { Button } from '@/app/components/ui/button'
import { UserProfile } from '@/types'
```

## TypeScript Configuration

- Strict mode disabled (`"strict": false`)
- Includes Next.js plugin for enhanced development

## Development Notes

- Firebase Admin SDK used for backend operations
- Custom Tailwind theme with Nova Blue primary colors (#19afe2)
- Role-based component rendering
- Stripe webhook integration for subscription events