//contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-config';
import { User, AuthContextType, UserRole, TenantSignupData, WhiteLabelConfig } from '../types';
import { createTenant, generateTenantUrl, DEFAULT_TENANT_ID } from '../lib/tenant-utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setTenantCookieAndRedirect = (tenantId: string) => {
    const id = tenantId || DEFAULT_TENANT_ID;
    try {
      document.cookie = `tenantId=${id};path=/;SameSite=Lax`;
    } catch {}

    const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
    if (isLocalhost) {
      const path = id === DEFAULT_TENANT_ID ? '/dashboard' : `/${id}/dashboard`;
      router.push(path);
      return;
    }

    const url = generateTenantUrl(id, '/dashboard');
    if (typeof window !== 'undefined') {
      window.location.assign(url);
    }
  };

  const createUserDocument = useCallback(async (firebaseUser: FirebaseUser, additionalData?: Record<string, unknown>) => {
    if (!firebaseUser) return;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email } = firebaseUser;
      const createdAt = Timestamp.now();

      try {
        await setDoc(userRef, {
          displayName: displayName || 'Anonymous User',
          email,
          role: 'free' as UserRole,
          createdAt,
          lastLogin: createdAt,
          tenantId: 'default',
          profile: {
            bio: '',
            avatar: '',
            preferences: {},
            privacy: {
              isPublic: false,
              showStats: true,
              showActivity: true,
              showBio: true
            },
            socialLinks: {},
            skills: [],
            interests: []
          },
          subscription: {
            tier: 'free',
            status: 'canceled',
            features: [],
            expiresAt: new Date()
          },
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    } else {
      await setDoc(userRef, {
        lastLogin: Timestamp.now()
      }, { merge: true });
    }

    return getUserDocument(firebaseUser.uid);
  }, []);

  const getUserDocument = async (uid: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return {
          id: uid,
          ...userSnap.data()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user document:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await createUserDocument(result.user);
      const tenantId = (userDoc?.tenantId as string) || DEFAULT_TENANT_ID;
      setTenantCookieAndRedirect(tenantId);
      // Return success - loading state will be managed by onAuthStateChanged
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, {
        displayName
      });

      const createdUser = await createUserDocument(result.user, { displayName });
      const tenantId = (createdUser?.tenantId as string) || DEFAULT_TENANT_ID;
      setTenantCookieAndRedirect(tenantId);
      // Return success - loading state will be managed by onAuthStateChanged
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signUpWithTenant = async (tenantData: TenantSignupData) => {
    try {
      console.log(`🚀 [AUTH] Starting tenant signup for: ${tenantData.companyName} (${tenantData.subdomain})`);
      
      // Step 1: Create the Firebase user
      const result = await createUserWithEmailAndPassword(auth, tenantData.ownerEmail, tenantData.password);
      console.log(`✅ [AUTH] Firebase user created: ${result.user.uid}`);

      // Step 2: Update the user profile
      await updateProfile(result.user, {
        displayName: tenantData.ownerName
      });
      console.log(`✅ [AUTH] User profile updated with displayName: ${tenantData.ownerName}`);

      // Step 3: Create the tenant configuration
      console.log(`🏢 [AUTH] Creating tenant config...`);
      const tenantConfig = await createTenant(tenantData, result.user.uid);
      console.log(`✅ [AUTH] Tenant config created: ${tenantConfig.tenantId}`);

      // Step 4: Create the user document with tenant assignment and admin role
      console.log(`👤 [AUTH] Creating user document with tenantId: ${tenantConfig.tenantId}`);
      
      // Create user document manually to ensure proper tenant assignment
      const userRef = doc(db, 'users', result.user.uid);
      const createdAt = Timestamp.now();
      
      await setDoc(userRef, {
        displayName: tenantData.ownerName,
        email: tenantData.ownerEmail,
        role: 'admin' as UserRole,
        tenantId: tenantConfig.tenantId, // Critical: assign to the actual tenant
        createdAt,
        lastLogin: createdAt,
        profile: {
          bio: '',
          avatar: '',
          preferences: {},
          privacy: {
            isPublic: false,
            showStats: true,
            showActivity: true,
            showBio: true
          },
          socialLinks: {},
          skills: [],
          interests: []
        },
        subscription: {
          tier: 'free',
          status: 'canceled',
          features: [],
          expiresAt: new Date()
        }
      });

      console.log(`✅ [AUTH] User document created successfully with tenantId: ${tenantConfig.tenantId}`);
      console.log(`✅ [AUTH] Tenant signup complete: User ${result.user.uid} is admin of tenant ${tenantConfig.tenantId}`);
      // Redirect to tenant dashboard
      setTenantCookieAndRedirect(tenantConfig.tenantId);
      return { user: result, tenant: tenantConfig };
    } catch (error) {
      console.error('❌ [AUTH] Error signing up with tenant:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  // Simplified role determination based on user document
  const getUserRole = useCallback(async (firebaseUser: FirebaseUser): Promise<UserRole> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Return the role from the user document (updated by webhooks)
        return userData.role || 'free';
      }

      return 'free';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'free';
    }
  }, []);

  // Function to update user role in Firestore
  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        role: newRole,
        lastLogin: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  }, []);

  // Function to refresh user data from Firestore
  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      // Simply get the latest user document (role updated by webhooks)
      const userDocument = await getUserDocument(auth.currentUser.uid);
      if (userDocument) {
        setUser(userDocument);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Create/update user document
        const userDocument = await createUserDocument(firebaseUser);
        if (userDocument) {
          setUser(userDocument);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [createUserDocument]);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signUpWithTenant,
    signOut,
    resetPassword,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};