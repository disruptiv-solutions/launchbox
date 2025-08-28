import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase-config';
import { User, CommunityPost, UserProgress } from '../types';

export interface DashboardStats {
  appsUsed: number;
  lessonsCompleted: number;
  communityPosts: number;
  timeSaved: string;
}

export interface RecentActivity {
  type: 'lesson' | 'app' | 'community';
  title: string;
  time: string;
  timestamp: Timestamp;
}

export const getUserStats = async (userId: string): Promise<DashboardStats> => {
  try {
    console.log(`📊 [STATS] Fetching user stats for: ${userId}`);

    // Get apps usage count (from user progress or activity logs)
    console.log(`📊 [STATS] Querying userProgress collection...`);
    const userProgressQuery = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId)
    );
    const progressSnapshot = await getDocs(userProgressQuery);
    console.log(`📊 [STATS] Progress docs found: ${progressSnapshot.docs.length}`);

    // Count unique apps used
    const appsUsed = new Set(
      progressSnapshot.docs.map(doc => {
        const data = doc.data();
        return data.appId || 'general';
      })
    ).size;

    // Count completed lessons
    const lessonsCompleted = progressSnapshot.docs.filter(doc => {
      const data = doc.data() as UserProgress;
      return data.completed && data.lessonId;
    }).length;

    console.log(`📊 [STATS] Apps used: ${appsUsed}, Lessons completed: ${lessonsCompleted}`);

    // Get community posts count (with tenant filtering for security)
    console.log(`📊 [STATS] Querying communityPosts collection...`);

    // Get user's tenant ID for security
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userTenantId = userDoc.exists() ? userDoc.data().tenantId || 'default' : 'default';

    const communityQuery = query(
      collection(db, 'communityPosts'),
      where('authorId', '==', userId),
      where('tenantId', '==', userTenantId) // 🔒 CRITICAL: Tenant isolation!
    );
    const communitySnapshot = await getDocs(communityQuery);
    const communityPosts = communitySnapshot.size;
    console.log(`📊 [STATS] Community posts found: ${communityPosts}`);

    // Calculate estimated time saved (rough calculation)
    const totalActivities = appsUsed + lessonsCompleted + communityPosts;
    const timeSaved = `${Math.max(totalActivities * 2, 1)}h`;

    const stats = {
      appsUsed,
      lessonsCompleted,
      communityPosts,
      timeSaved
    };

    console.log(`✅ [STATS] Final stats for ${userId}:`, stats);
    return stats;
  } catch (error) {
    console.error(`🚨 [STATS] Error fetching user stats for ${userId}:`, error);
    console.error(`🚨 [STATS] Error details:`, {
      code: error.code,
      message: error.message,
      userId
    });
    // Return default stats on error
    return {
      appsUsed: 0,
      lessonsCompleted: 0,
      communityPosts: 0,
      timeSaved: '0h'
    };
  }
};

export const getUserRecentActivity = async (userId: string): Promise<RecentActivity[]> => {
  try {
    const activities: RecentActivity[] = [];

    // Get recent lesson progress
    const lessonsQuery = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId),
      where('lessonId', '!=', null),
      orderBy('lastWatched', 'desc'),
      limit(3)
    );

    try {
      const lessonsSnapshot = await getDocs(lessonsQuery);
      for (const progressDoc of lessonsSnapshot.docs) {
        const data = progressDoc.data() as UserProgress;
        if (data.lessonId) {
          // Get lesson title
          const lessonDoc = await getDoc(doc(db, 'lessons', data.lessonId));
          const lessonTitle = lessonDoc.exists() ? lessonDoc.data().title : 'Unknown Lesson';

          activities.push({
            type: 'lesson',
            title: data.completed ? `Completed "${lessonTitle}"` : `Started "${lessonTitle}"`,
            time: formatTimeAgo(data.lastWatched),
            timestamp: data.lastWatched
          });
        }
      }
    } catch (error) {
      console.log('No lesson activity found or index missing');
    }

    // Get recent app usage
    const appsQuery = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId),
      where('appId', '!=', null),
      orderBy('lastWatched', 'desc'),
      limit(2)
    );

    try {
      const appsSnapshot = await getDocs(appsQuery);
      for (const doc of appsSnapshot.docs) {
        const data = doc.data();
        if (data.appId) {
          activities.push({
            type: 'app',
            title: `Used ${data.appName || data.appId}`,
            time: formatTimeAgo(data.lastWatched),
            timestamp: data.lastWatched
          });
        }
      }
    } catch (error) {
      console.log('No app activity found or index missing');
    }

    // Get recent community posts
    const communityQuery = query(
      collection(db, 'communityPosts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(2)
    );

    try {
      const communitySnapshot = await getDocs(communityQuery);
      communitySnapshot.docs.forEach(doc => {
        const data = doc.data() as CommunityPost;
        activities.push({
          type: 'community',
          title: `Posted "${data.title}"`,
          time: formatTimeAgo(data.createdAt),
          timestamp: data.createdAt
        });
      });
    } catch (error) {
      console.log('No community activity found or index missing');
    }

    // Sort all activities by timestamp and return top 4
    return activities
      .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
      .slice(0, 4);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

export const trackAppUsage = async (userId: string, appId: string, appName: string) => {
  try {
    const userProgressRef = doc(db, 'userProgress', `${userId}_${appId}`);
    const progressDoc = await getDoc(userProgressRef);

    if (progressDoc.exists()) {
      // Update existing progress
      await import('firebase/firestore').then(({ updateDoc }) => 
        updateDoc(userProgressRef, {
          lastWatched: Timestamp.now(),
          progress: Math.min((progressDoc.data().progress || 0) + 1, 100)
        })
      );
    } else {
      // Create new progress entry
      await import('firebase/firestore').then(({ setDoc }) =>
        setDoc(userProgressRef, {
          userId,
          appId,
          appName,
          lessonId: null,
          completed: false,
          progress: 1,
          watchTime: 0,
          lastWatched: Timestamp.now(),
          notes: ''
        })
      );
    }
  } catch (error) {
    console.error('Error tracking app usage:', error);
  }
};

const formatTimeAgo = (timestamp: Timestamp): string => {
  const now = new Date();
  const time = timestamp.toDate();
  const diffInMs = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};