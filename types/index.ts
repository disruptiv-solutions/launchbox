import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'premium' | 'free' | 'superadmin';
export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type AccessLevel = 'free' | 'premium' | 'admin';

export interface PrivacySettings {
  isPublic: boolean;
  showStats: boolean;
  showActivity: boolean;
  showBio: boolean;
}

export interface UserProfile {
  bio: string;
  avatar: string;
  preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    communityUpdates?: boolean;
    lessonReminders?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  privacy: PrivacySettings;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  skills?: string[];
  interests?: string[];
}

export interface UserSubscription {
  tier: 'free' | 'premium';
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  features: string[];
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  expiresAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  tenantId?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  profile: UserProfile;
  subscription: UserSubscription;
}

export interface Platform {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  createdAt: Timestamp;
  technologies: string[];
}

export interface AppAnalytics {
  totalUses: number;
  lastUpdated: Timestamp;
}

export interface App {
  id: string;
  title: string;
  description: string;
  accessLevel: AccessLevel;
  category: string;
  embedUrl: string;
  imageUrl: string;
  instructions: string;
  analytics: AppAnalytics;
}

export interface LessonResource {
  title: string;
  url: string;
  type: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  category: string;
  difficulty: LessonDifficulty;
  prerequisites: string[];
  thumbnail: string;
  transcript: string;
  resources: LessonResource[];
}

export interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  progress: number;
  watchTime: number;
  lastWatched: Timestamp;
  notes: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags: string[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: Timestamp;
  parentCommentId: string | null;
  authorName?: string;
  authorAvatar?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<unknown>;
  signUp: (email: string, password: string, displayName: string) => Promise<unknown>;
  signUpWithTenant: (tenantData: TenantSignupData) => Promise<{ user: unknown; tenant: WhiteLabelConfig }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface BrandingConfig {
  title: string;
  logoUrl: string;
}

export interface PageConfig {
  enableLessons: boolean;
  enableApps: boolean;
  enableCommunity: boolean; // Always true, but included for completeness
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  mode: 'light' | 'dark' | 'system';
  branding: BrandingConfig;
}

export interface FirebaseError {
  code: string;
  message: string;
}

// Simplified billing info interface
export interface BillingInfo {
  hasActiveSubscription: boolean;
  subscription?: UserSubscription;
  nextBillingDate?: Date;
  cancelAtPeriodEnd?: boolean;
}

// White-label tenant configuration
export interface WhiteLabelConfig {
  tenantId: string;
  companyName: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ownerId: string; // User ID of the tenant owner/admin
  
  // Branding configuration
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    companyName: string;
    tagline?: string;
    colors: {
      primary: string;
      secondary: string;
      accent?: string;
      background?: string;
      text?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
  };
  
  // Content customization
  content: {
    welcomeMessage?: string;
    aboutText?: string;
    footerText?: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    supportEmail?: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  
  // Feature configuration
  features: {
    enableLessons: boolean;
    enableApps: boolean;
    enableCommunity: boolean;
    enableAnalytics: boolean;
    enableSubscriptions: boolean;
    maxUsers?: number;
    customDomainAllowed: boolean;
  };
  
  // Domain configuration
  domain: {
    subdomain: string;
    customDomain?: string;
    customDomainVerified?: boolean;
    sslEnabled?: boolean;
  };
  
  // Settings
  settings: {
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: UserRole;
    sessionTimeout?: number;
    backupEnabled?: boolean;
  };
  
  // Subscription info
  subscription?: {
    planId: string;
    status: 'trial' | 'active' | 'past_due' | 'canceled';
    trialEndsAt?: Timestamp;
    currentPeriodEnd?: Timestamp;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}

// Tenant creation form data
export interface TenantSignupData {
  companyName: string;
  subdomain: string;
  industry?: string;
  companySize?: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
  primaryColor?: string;
  features?: {
    enableLessons?: boolean;
    enableApps?: boolean;
    enableCommunity?: boolean;
  };
}