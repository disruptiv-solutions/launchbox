import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  getDoc,
  where,
  Timestamp,
  count,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase-config';
import { Platform, App, Lesson, User, AccessLevel, LessonDifficulty } from '../types';

// Platform Management
export const createPlatform = async (
  title: string,
  description: string,
  url: string,
  imageUrl: string,
  category: string,
  featured: boolean,
  technologies: string[],
  tenantId: string
): Promise<string> => {
  try {
    const platformData = {
      title,
      description,
      url,
      imageUrl,
      category,
      featured,
      technologies,
      tenantId, // 🔒 CRITICAL: Add tenant isolation
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'platforms'), platformData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating platform:', error);
    throw error;
  }
};

export const getPlatforms = async (tenantId: string): Promise<Platform[]> => {
  try {
    const q = query(
      collection(db, 'platforms'),
      where('tenantId', '==', tenantId), // 🔒 CRITICAL: Tenant isolation
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const platforms: Platform[] = [];

    querySnapshot.docs.forEach(doc => {
      platforms.push({
        id: doc.id,
        ...doc.data()
      } as Platform);
    });

    return platforms;
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return [];
  }
};

export const updatePlatform = async (
  platformId: string,
  updates: Partial<Platform>,
  tenantId: string
): Promise<void> => {
  try {
    const platformRef = doc(db, 'platforms', platformId);

    // Verify tenant access before updating
    const platformDoc = await getDoc(platformRef);
    if (!platformDoc.exists()) {
      throw new Error('Platform not found');
    }

    const platformData = platformDoc.data() as Platform;
    if (platformData.tenantId !== tenantId) {
      throw new Error('Unauthorized: Cannot update platform from different tenant');
    }
    await updateDoc(platformRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating platform:', error);
    throw error;
  }
};

export const deletePlatform = async (platformId: string, tenantId: string): Promise<void> => {
  try {
    const platformRef = doc(db, 'platforms', platformId);

    // Verify tenant access before deleting
    const platformDoc = await getDoc(platformRef);
    if (!platformDoc.exists()) {
      throw new Error('Platform not found');
    }

    const platformData = platformDoc.data() as Platform;
    if (platformData.tenantId !== tenantId) {
      throw new Error('Unauthorized: Cannot delete platform from different tenant');
    }

    await deleteDoc(platformRef);
  } catch (error) {
    console.error('Error deleting platform:', error);
    throw error;
  }
};

// App Management
export const createApp = async (
  title: string,
  description: string,
  accessLevel: AccessLevel,
  category: string,
  embedUrl: string,
  imageUrl: string,
  instructions: string,
  tenantId: string
): Promise<string> => {
  try {
    const appData = {
      title,
      description,
      accessLevel,
      category,
      embedUrl,
      imageUrl,
      instructions,
      tenantId, // 🔒 CRITICAL: Add tenant isolation
      analytics: {
        totalUses: 0,
        lastUpdated: Timestamp.now()
      }
    };

    const docRef = await addDoc(collection(db, 'apps'), appData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating app:', error);
    throw error;
  }
};

export const getApps = async (tenantId: string): Promise<App[]> => {
  try {
    const q = query(
      collection(db, 'apps'),
      where('tenantId', '==', tenantId), // 🔒 CRITICAL: Tenant isolation
      orderBy('title', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const apps: App[] = [];

    querySnapshot.docs.forEach(doc => {
      apps.push({
        id: doc.id,
        ...doc.data()
      } as App);
    });

    return apps;
  } catch (error) {
    console.error('Error fetching apps:', error);
    return [];
  }
};

export const updateApp = async (
  appId: string,
  updates: Partial<App>
): Promise<void> => {
  try {
    const appRef = doc(db, 'apps', appId);
    await updateDoc(appRef, updates);
  } catch (error) {
    console.error('Error updating app:', error);
    throw error;
  }
};

export const deleteApp = async (appId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'apps', appId));
  } catch (error) {
    console.error('Error deleting app:', error);
    throw error;
  }
};

// Lesson Management
export const createLesson = async (
  title: string,
  description: string,
  videoUrl: string,
  duration: number,
  category: string,
  difficulty: LessonDifficulty,
  prerequisites: string[],
  thumbnail: string,
  tenantId: string,
  transcript: string = '',
  resources: Array<{ title: string; url: string; type: string }> = []
): Promise<string> => {
  try {
    const lessonData = {
      title,
      description,
      videoUrl,
      duration,
      category,
      difficulty,
      prerequisites,
      thumbnail,
      transcript,
      resources,
      tenantId // 🔒 CRITICAL: Add tenant isolation
    };

    const docRef = await addDoc(collection(db, 'lessons'), lessonData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

export const getLessons = async (tenantId: string): Promise<Lesson[]> => {
  try {
    const q = query(
      collection(db, 'lessons'),
      where('tenantId', '==', tenantId), // 🔒 CRITICAL: Tenant isolation
      orderBy('title', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const lessons: Lesson[] = [];

    querySnapshot.docs.forEach(doc => {
      lessons.push({
        id: doc.id,
        ...doc.data()
      } as Lesson);
    });

    return lessons;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const updateLesson = async (
  lessonId: string,
  updates: Partial<Lesson>
): Promise<void> => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    await updateDoc(lessonRef, updates);
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

// User Management
export const getUsers = async (tenantId?: string): Promise<User[]> => {
  try {
    let q;
    if (tenantId) {
      // Tenant-scoped query for tenant admins
      q = query(
        collection(db, 'users'),
        where('tenantId', '==', tenantId), // 🔒 CRITICAL: Tenant isolation
        orderBy('createdAt', 'desc')
      );
    } else {
      // Global query for superadmins only
      q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    querySnapshot.docs.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      } as User);
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const updateUserRole = async (
  userId: string,
  role: 'free' | 'premium' | 'admin' | 'superadmin'
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getUserStats = async (tenantId?: string) => {
  try {
    // If tenantId provided, scope to that tenant. If not, assume superadmin global access.
    let usersQuery, premiumQuery, adminQuery;

    if (tenantId) {
      // Tenant-scoped queries (for tenant admins)
      usersQuery = query(collection(db, 'users'), where('tenantId', '==', tenantId));
      premiumQuery = query(collection(db, 'users'), where('tenantId', '==', tenantId), where('role', '==', 'premium'));
      adminQuery = query(collection(db, 'users'), where('tenantId', '==', tenantId), where('role', '==', 'admin'));
    } else {
      // Global queries (for superadmins only)
      usersQuery = query(collection(db, 'users'));
      premiumQuery = query(collection(db, 'users'), where('role', '==', 'premium'));
      adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    }

    const [totalSnapshot, premiumSnapshot, adminSnapshot] = await Promise.all([
      getCountFromServer(usersQuery),
      getCountFromServer(premiumQuery),
      getCountFromServer(adminQuery)
    ]);

    return {
      total: totalSnapshot.data().count,
      premium: premiumSnapshot.data().count,
      admin: adminSnapshot.data().count,
      free: totalSnapshot.data().count - premiumSnapshot.data().count - adminSnapshot.data().count
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { total: 0, premium: 0, admin: 0, free: 0 };
  }
};

// Community Management
export const getCommunityStats = async (tenantId?: string) => {
  try {
    // Tenant-scoped or global queries based on tenantId parameter
    let postsQuery, commentsQuery;

    if (tenantId) {
      // Tenant-scoped queries (for tenant admins)
      postsQuery = query(collection(db, 'communityPosts'), where('tenantId', '==', tenantId));
      commentsQuery = query(collection(db, 'comments'), where('tenantId', '==', tenantId));
    } else {
      // Global queries (for superadmins only)
      postsQuery = query(collection(db, 'communityPosts'));
      commentsQuery = query(collection(db, 'comments'));
    }

    const [postsSnapshot, commentsSnapshot] = await Promise.all([
      getCountFromServer(postsQuery),
      getCountFromServer(commentsQuery)
    ]);

    return {
      totalPosts: postsSnapshot.data().count,
      totalComments: commentsSnapshot.data().count
    };
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return { totalPosts: 0, totalComments: 0 };
  }
};

// General Admin Dashboard Stats
export const getAdminDashboardStats = async (tenantId?: string) => {
  try {
    // Build queries based on tenant scope
    let platformsQuery, appsQuery, lessonsQuery;

    if (tenantId) {
      // Tenant-scoped queries (for tenant admins)
      platformsQuery = query(collection(db, 'platforms'), where('tenantId', '==', tenantId));
      appsQuery = query(collection(db, 'apps'), where('tenantId', '==', tenantId));
      lessonsQuery = query(collection(db, 'lessons'), where('tenantId', '==', tenantId));
    } else {
      // Global queries (for superadmins only)
      platformsQuery = query(collection(db, 'platforms'));
      appsQuery = query(collection(db, 'apps'));
      lessonsQuery = query(collection(db, 'lessons'));
    }

    const [userStats, communityStats, platformsSnapshot, appsSnapshot, lessonsSnapshot] = await Promise.all([
      getUserStats(tenantId),
      getCommunityStats(tenantId),
      getCountFromServer(platformsQuery),
      getCountFromServer(appsQuery),
      getCountFromServer(lessonsQuery)
    ]);

    return {
      users: userStats,
      community: communityStats,
      platforms: platformsSnapshot.data().count,
      apps: appsSnapshot.data().count,
      lessons: lessonsSnapshot.data().count
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return {
      users: { total: 0, premium: 0, admin: 0, free: 0 },
      community: { totalPosts: 0, totalComments: 0 },
      platforms: 0,
      apps: 0,
      lessons: 0
    };
  }
};

// Maintenance Functions for Data Migration
export const addPrivacySettingsToUsers = async (): Promise<void> => {
  try {
    console.log('🔧 Starting privacy settings migration...');

    const usersQuery = query(collection(db, 'users'));
    const snapshot = await getDocs(usersQuery);

    let updatedCount = 0;

    for (const docRef of snapshot.docs) {
      const userData = docRef.data();

      // Check if user already has privacy settings
      if (!userData.profile?.privacy) {
        const defaultPrivacySettings = {
          isPublic: false,
          showStats: true,
          showActivity: true,
          showBio: true
        };

        const updatedProfile = {
          ...userData.profile,
          privacy: defaultPrivacySettings
        };

        await updateDoc(doc(db, 'users', docRef.id), {
          profile: updatedProfile
        });

        updatedCount++;
        console.log(`✅ Added privacy settings to user: ${docRef.id}`);
      }
    }

    console.log(`🎉 Privacy settings migration complete! Updated ${updatedCount} users.`);
  } catch (error) {
    console.error('🚨 Error in privacy settings migration:', error);
    throw error;
  }
};

export const fixCommunityPosts = async (): Promise<void> => {
  try {
    console.log('🔧 Starting community posts author info migration...');

    const postsQuery = query(collection(db, 'communityPosts'));
    const snapshot = await getDocs(postsQuery);

    let updatedCount = 0;

    for (const postDoc of snapshot.docs) {
      const postData = postDoc.data();

      // Check if post is missing author info
      if (!postData.authorName || !postData.authorAvatar) {
        try {
          // Get author user document
          const userDoc = await getDoc(doc(db, 'users', postData.authorId));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            await updateDoc(doc(db, 'communityPosts', postDoc.id), {
              authorName: userData.displayName || 'Unknown User',
              authorAvatar: userData.profile?.avatar || ''
            });

            updatedCount++;
            console.log(`✅ Fixed author info for post: ${postDoc.id}`);
          }
        } catch (error) {
          console.warn(`⚠️ Could not fix post ${postDoc.id}:`, error);
        }
      }
    }

    console.log(`🎉 Community posts migration complete! Updated ${updatedCount} posts.`);
  } catch (error) {
    console.error('🚨 Error in community posts migration:', error);
    throw error;
  }
};

export const fixComments = async (): Promise<void> => {
  try {
    console.log('🔧 Starting comments author info migration...');

    const commentsQuery = query(collection(db, 'comments'));
    const snapshot = await getDocs(commentsQuery);

    let updatedCount = 0;

    for (const commentDoc of snapshot.docs) {
      const commentData = commentDoc.data();

      // Check if comment is missing author info
      if (!commentData.authorName || !commentData.authorAvatar) {
        try {
          // Get author user document
          const userDoc = await getDoc(doc(db, 'users', commentData.authorId));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            await updateDoc(doc(db, 'comments', commentDoc.id), {
              authorName: userData.displayName || 'Unknown User',
              authorAvatar: userData.profile?.avatar || ''
            });

            updatedCount++;
            console.log(`✅ Fixed author info for comment: ${commentDoc.id}`);
          }
        } catch (error) {
          console.warn(`⚠️ Could not fix comment ${commentDoc.id}:`, error);
        }
      }
    }

    console.log(`🎉 Comments migration complete! Updated ${updatedCount} comments.`);
  } catch (error) {
    console.error('🚨 Error in comments migration:', error);
    throw error;
  }
};

export const fixPostLikeFields = async (): Promise<void> => {
  try {
    console.log('🔧 Starting post like fields migration...');

    const postsQuery = query(collection(db, 'communityPosts'));
    const snapshot = await getDocs(postsQuery);

    let updatedCount = 0;

    for (const postDoc of snapshot.docs) {
      const postData = postDoc.data();

      // Check if post is missing like fields
      if (postData.likes === undefined || !postData.likedBy) {
        await updateDoc(doc(db, 'communityPosts', postDoc.id), {
          likes: postData.likes || 0,
          likedBy: postData.likedBy || []
        });

        updatedCount++;
        console.log(`✅ Fixed like fields for post: ${postDoc.id}`);
      }
    }

    console.log(`🎉 Post like fields migration complete! Updated ${updatedCount} posts.`);
  } catch (error) {
    console.error('🚨 Error in post like fields migration:', error);
    throw error;
  }
};