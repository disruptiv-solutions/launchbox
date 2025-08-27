"use client";

import { User } from '@/types';

// Premium plan configuration
export const PREMIUM_PRICE_ID = 'price_1RqRxRPIUKzPtASFgn2Wb51b';

export interface CreateCheckoutSessionData {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CustomerPortalData {
  returnUrl?: string;
}

/**
 * Create a Stripe checkout session for subscription
 */
export const createCheckoutSession = async (
  user: User,
  data: CreateCheckoutSessionData
): Promise<{ url: string }> => {
  try {
    // Get Firebase ID token for authentication
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();

    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const token = await auth.currentUser.getIdToken();

    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        priceId: data.priceId,
        successUrl: data.successUrl || `${window.location.origin}/dashboard/billing?success=true`,
        cancelUrl: data.cancelUrl || `${window.location.origin}/dashboard/billing?canceled=true`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    window.location.assign(url);

    return { url };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create a customer portal session for managing subscription
 */
export const createCustomerPortalSession = async (
  user: User,
  data: CustomerPortalData = {}
): Promise<{ url: string }> => {
  try {
    // Get Firebase ID token for authentication
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();

    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const token = await auth.currentUser.getIdToken();

    const response = await fetch('/api/stripe/customer-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        returnUrl: data.returnUrl || `${window.location.origin}/dashboard/billing`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create customer portal session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Customer Portal
    window.location.assign(url);

    return { url };

  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
};

/**
 * Create a checkout session for premium subscription (shortcut)
 */
export const createPremiumCheckoutSession = async (
  user: User,
  successUrl?: string,
  cancelUrl?: string
): Promise<{ url: string }> => {
  return createCheckoutSession(user, {
    priceId: PREMIUM_PRICE_ID,
    successUrl,
    cancelUrl,
  });
};

/**
 * Check if user has active premium subscription
 */
export const hasActivePremiumSubscription = (user: User): boolean => {
  if (!user.subscription) return false;

  const { status, tier } = user.subscription;

  // Check if subscription is active and premium tier
  return (
    (status === 'active' || status === 'trialing') &&
    tier === 'premium'
  );
};

/**
 * Check if user's subscription is active (any tier)
 */
export const hasActiveSubscription = (user: User): boolean => {
  if (!user.subscription) return false;

  const { status } = user.subscription;
  return status === 'active' || status === 'trialing';
};

/**
 * Get subscription status display text
 */
export const getSubscriptionStatusText = (status?: string): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    case 'unpaid':
      return 'Unpaid';
    default:
      return 'None';
  }
};

/**
 * Get subscription status color class
 */
export const getSubscriptionStatusColor = (status?: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-400';
    case 'trialing':
      return 'text-blue-400';
    case 'past_due':
      return 'text-yellow-400';
    case 'canceled':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

/**
 * Format subscription price for display
 */
export const formatSubscriptionPrice = (amount: number, currency: string = 'usd'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });

  return formatter.format(amount / 100); // Stripe amounts are in cents
};

/**
 * Get premium features list
 */
export const getPremiumFeatures = (): string[] => [
  'Access to all premium applications',
  'Advanced lessons and tutorials', 
  'Priority community support',
  'Export functionality for all apps',
  'Advanced analytics and insights',
  'Premium templates and resources',
  'No usage limits',
  'Priority feature requests'
];

/**
 * Get free plan features list
 */
export const getFreePlanFeatures = (): string[] => [
  'Basic community access',
  'Public profile',
  'Limited app access',
  'Basic lessons'
];