import { 
  doc, 
  updateDoc, 
  getDoc,
  query,
  collection,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  connectFirestoreEmulator,
  getFirestore
} from 'firebase/firestore';
import { 
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser 
} from 'firebase/auth';
import { db, auth } from './firebase-config';
import { User, PrivacySettings } from '../types';

export interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  avatar?: string;
  preferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    communityUpdates?: boolean;
    lessonReminders?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
}

export interface UserProfileStats {
  lessonsCompleted: number;
  appsUsed: number;
  communityPosts: number;
  totalWatchTime: number;
  memberSince: string;
  lastActive: string;
  streak: number;
}

export interface UserActivity {
  type: 'lesson' | 'app' | 'community';
  title: string;
  date: Timestamp;
  progress?: number;
  content?: string;
  category?: string;
}

// Update user profile in Firestore
export const updateUserProfile = async (
  userId: string, 
  updates: ProfileUpdateData
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);

    // Prepare the update object
    const updateData: any = {};

    if (updates.displayName !== undefined) {
      updateData.displayName = updates.displayName;
    }

    if (updates.bio !== undefined) {
      updateData['profile.bio'] = updates.bio;
    }

    if (updates.avatar !== undefined) {
      updateData['profile.avatar'] = updates.avatar;
    }

    if (updates.preferences) {
      Object.keys(updates.preferences).forEach(key => {
        updateData[`profile.preferences.${key}`] = updates.preferences![key as keyof typeof updates.preferences];
      });
    }

    updateData.updatedAt = Timestamp.now();

    await updateDoc(userRef, updateData);

    // Also update Firebase Auth profile if display name changed
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};


// Get comprehensive user statistics
export const getUserProfileStats = async (userId: string): Promise<UserProfileStats> => {
  try {
    // Try to get user document for member since date
    let userData;
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      userData = userDoc.data();
    } catch (error) {
      console.log('Cannot access user document for stats, using defaults');
      userData = null;
    }

    // Run all data queries in parallel for better performance
    const [progressSnapshot, communitySnapshot] = await Promise.allSettled([
      // Get user progress data
      (async () => {
        try {
          const progressQuery = query(
            collection(db, 'userProgress'),
            where('userId', '==', userId)
          );
          return await getDocs(progressQuery);
        } catch (error) {
          console.log('Cannot access user progress data:', error);
          return { docs: [] };
        }
      })(),

      // Get community posts count
      (async () => {
        try {
          const communityQuery = query(
            collection(db, 'communityPosts'),
            where('authorId', '==', userId)
          );
          return await getDocs(communityQuery);
        } catch (error) {
          console.log('Cannot access community posts data:', error);
          return { size: 0 };
        }
      })()
    ]);

    // Extract results from settled promises
    const progressData = progressSnapshot.status === 'fulfilled' ? progressSnapshot.value : { docs: [] };
    const communityData = communitySnapshot.status === 'fulfilled' ? communitySnapshot.value : { size: 0 };

    // Calculate statistics from progress data
    let lessonsCompleted = 0;
    let totalWatchTime = 0;
    const appsUsed = new Set<string>();
    let lastActiveTimestamp = userData?.createdAt;

    progressData.docs.forEach(doc => {
      const data = doc.data();

      if (data.lessonId && data.completed) {
        lessonsCompleted++;
      }

      if (data.appId) {
        appsUsed.add(data.appId);
      }

      if (data.watchTime) {
        totalWatchTime += data.watchTime;
      }

      if (data.lastWatched && data.lastWatched.seconds > lastActiveTimestamp?.seconds) {
        lastActiveTimestamp = data.lastWatched;
      }
    });

    // Calculate learning streak (simplified - days with activity)
    const streak = await calculateLearningStreak(userId);

    return {
      lessonsCompleted,
      appsUsed: appsUsed.size,
      communityPosts: communityData.size,
      totalWatchTime: Math.round(totalWatchTime / 60), // Convert to minutes
      memberSince: userData?.createdAt?.toDate().toLocaleDateString() || 'Unknown',
      lastActive: lastActiveTimestamp?.toDate().toLocaleDateString() || 'Unknown',
      streak
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      lessonsCompleted: 0,
      appsUsed: 0,
      communityPosts: 0,
      totalWatchTime: 0,
      memberSince: 'Unknown',
      lastActive: 'Unknown',
      streak: 0
    };
  }
};

// Get recent user activity
export const getUserActivity = async (userId: string, limitCount: number = 10): Promise<UserActivity[]> => {
  try {
    // Run lesson and community queries in parallel for faster loading
    const [lessonsResult, communityResult] = await Promise.allSettled([
      // Get recent lesson progress
      (async () => {
        try {
          const lessonsQuery = query(
            collection(db, 'userProgress'),
            where('userId', '==', userId),
            orderBy('lastWatched', 'desc'),
            limit(limitCount)
          );
          return await getDocs(lessonsQuery);
        } catch (error) {
          console.log('Error fetching lesson activity:', error);
          return { docs: [] };
        }
      })(),

      // Get recent community posts
      (async () => {
        try {
          const communityQuery = query(
            collection(db, 'communityPosts'),
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(Math.ceil(limitCount / 2))
          );
          return await getDocs(communityQuery);
        } catch (error) {
          console.log('Error fetching community activity:', error);
          return { docs: [] };
        }
      })()
    ]);

    const activities: UserActivity[] = [];

    // Process lesson progress results
    const lessonsSnapshot = lessonsResult.status === 'fulfilled' ? lessonsResult.value : { docs: [] };
    lessonsSnapshot.docs.forEach(progressDoc => {
      const data = progressDoc.data();
      // Filter for lesson progress only (lessonId exists)
      if (data.lessonId) {
        activities.push({
          type: 'lesson',
          title: data.completed ? 'Completed a lesson' : 'Watched a lesson',
          date: data.lastWatched,
          progress: data.progress
        });
      }
    });

    // Process community posts results
    const communitySnapshot = communityResult.status === 'fulfilled' ? communityResult.value : { docs: [] };
    communitySnapshot.docs.forEach(doc => {
      const data = doc.data();
      activities.push({
        type: 'community',
        title: `Posted: ${data.title}`,
        date: data.createdAt
      });
    });

    // Sort by date and limit
    return activities
      .sort((a, b) => b.date.seconds - a.date.seconds)
      .slice(0, limitCount);

  } catch (error) {
    console.error('Error getting user activity:', error);
    return [];
  }
};

// Change user password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Change user email
export const changeEmail = async (
  newEmail: string,
  currentPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update email
    await updateEmail(user, newEmail);

    // Update email in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error changing email:', error);
    throw error;
  }
};

// Calculate learning streak (simplified implementation)
const calculateLearningStreak = async (userId: string): Promise<number> => {
  try {
    // Get recent activity from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progressQuery = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId),
      where('lastWatched', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('lastWatched', 'desc')
    );

    const snapshot = await getDocs(progressQuery);

    if (snapshot.empty) return 0;

    // Group activities by day and count consecutive days
    const activityDays = new Set<string>();
    snapshot.docs.forEach(doc => {
      const date = doc.data().lastWatched.toDate();
      activityDays.add(date.toDateString());
    });

    // Simple streak calculation - count unique days with activity
    return Math.min(activityDays.size, 7); // Cap at 7 days for now
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

// Update user privacy settings
export const updatePrivacySettings = async (
  userId: string,
  privacySettings: PrivacySettings
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      'profile.privacy': privacySettings,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    throw error;
  }
};

// Get public profile (privacy-filtered)
export const getPublicProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data() as User;

    // Ensure privacy settings exist (for backwards compatibility)
    const privacy = userData.profile?.privacy;

    // If no privacy settings exist, the user hasn't been migrated yet - return null
    if (!privacy) {
      console.log(`User ${userId} has no privacy settings - needs migration`);
      return null;
    }

    // Check if profile is public
    if (!privacy.isPublic) {
      return null;
    }

    // Return privacy-filtered profile with serialized timestamps
    return {
      ...userData,
      // Always include basic info for public profiles
      id: userSnap.id, // Use the document ID from Firestore
      displayName: userData.displayName,
      role: userData.role,
      createdAt: userData.createdAt || Timestamp.now(),
      lastLogin: userData.lastLogin || Timestamp.now(),
      // Filter profile data based on privacy settings
      profile: {
        ...userData.profile,
        privacy,
        bio: privacy.showBio ? (userData.profile?.bio || '') : '',
        socialLinks: privacy.showBio ? (userData.profile?.socialLinks || {}) : {},
        skills: privacy.showBio ? (userData.profile?.skills || []) : [],
        interests: privacy.showBio ? (userData.profile?.interests || []) : [],
        // Always hide email and private preferences
        preferences: {
          theme: userData.profile.preferences?.theme || 'system'
        }
      },
      // Never expose email or subscription details in public profiles
      email: '',
      subscription: {
        tier: 'free',
        expiresAt: Timestamp.now(),
        features: []
      }
    };
  } catch (error) {
    // Check if this is a permission error (likely missing privacy settings)
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      if (firebaseError.code === 'permission-denied') {
        console.log(`Permission denied for user ${userId} - likely missing privacy settings`);
        return null;
      }
    }
    console.error('Error getting public profile:', error);
    return null;
  }
};

// Get user public activity (privacy-filtered)
export const getUserPublicActivity = async (
  userId: string, 
  limitCount: number = 10
): Promise<UserActivity[]> => {
  try {
    // First check if user allows activity to be shown
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return [];
    }

    const userData = userSnap.data() as User;

    // Ensure privacy settings exist (for backwards compatibility)
    const privacy = userData.profile?.privacy || {
      isPublic: false,
      showStats: true,
      showActivity: true,
      showBio: true
    };

    if (!privacy.isPublic || !privacy.showActivity) {
      return [];
    }

    // Get activity using existing function
    return await getUserActivity(userId, limitCount);
  } catch (error) {
    console.error('Error getting public user activity:', error);
    return [];
  }
};

// Get user's recent community posts as activity (much faster!)
export const getUserCommunityActivity = async (userId: string, limitCount: number = 5): Promise<UserActivity[]> => {
  try {
    const communityQuery = query(
      collection(db, 'communityPosts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const communitySnapshot = await getDocs(communityQuery);

    return communitySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        type: 'community' as const,
        title: data.title,
        date: data.createdAt,
        content: data.content?.substring(0, 100) + (data.content?.length > 100 ? '...' : ''), // Preview
        category: data.category
      };
    });
  } catch (error) {
    console.error('Error getting community activity:', error);
    return [];
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

