//contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
import { User, AuthContextType, UserRole } from '../types';

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
      await createUserDocument(result.user);
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

      await createUserDocument(result.user, { displayName });
      // Return success - loading state will be managed by onAuthStateChanged
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
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