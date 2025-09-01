import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  where,
  Timestamp,
  increment,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase-config';
import { CommunityPost, Comment } from '../types';

export const createPost = async (
  authorId: string, 
  authorName: string,
  authorAvatar: string,
  title: string, 
  content: string, 
  category: string,
  tags: string[] = [],
  tenantId: string = 'default'
): Promise<string> => {
  try {
    const postData = {
      authorId,
      authorName,
      authorAvatar,
      title,
      content,
      category,
      tags,
      likes: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      likedBy: [],
      tenantId
    };

    const docRef = await addDoc(collection(db, 'communityPosts'), postData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async (category?: string, limitCount: number = 20, tenantId: string = 'default'): Promise<CommunityPost[]> => {
  try {
    // Enforce tenant isolation. Avoid composite index needs by sorting client-side.
    const q = query(
      collection(db, 'communityPosts'),
      where('tenantId', '==', tenantId),
      limit(limitCount * 3)
    );

    const querySnapshot = await getDocs(q);
    const posts: CommunityPost[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();

      posts.push({
        id: docSnap.id,
        authorId: data.authorId,
        title: data.title,
        content: data.content,
        category: data.category,
        likes: data.likes || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        tags: data.tags || [],
        // Use author info directly from post data
        authorName: data.authorName || 'Unknown User',
        authorAvatar: data.authorAvatar || '',
        likedBy: data.likedBy || [],
        commentCount: 0
      } as CommunityPost & { likedBy: string[]; commentCount: number });
    }

    // Sort by createdAt desc client-side and filter by category if specified
    const sorted = posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    const filteredPosts = category && category !== 'all' 
      ? sorted.filter(post => post.category === category).slice(0, limitCount)
      : sorted.slice(0, limitCount);

    return filteredPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const likePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const data = postDoc.data();
      const likedBy = data.likedBy || [];

      if (likedBy.includes(userId)) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId)
        });
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId)
        });
      }
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const addComment = async (
  postId: string, 
  authorId: string,
  authorName: string,
  authorAvatar: string,
  content: string,
  parentCommentId?: string,
  tenantId: string = 'default'
): Promise<string> => {
  try {
    const commentData = {
      postId,
      authorId,
      authorName,
      authorAvatar,
      content,
      likes: 0,
      createdAt: Timestamp.now(),
      parentCommentId: parentCommentId || null,
      likedBy: [],
      tenantId
    };

    const docRef = await addDoc(collection(db, 'comments'), commentData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (postId: string, tenantId: string = 'default'): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('tenantId', '==', tenantId),
      where('postId', '==', postId)
    );

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();

      comments.push({
        id: docSnap.id,
        postId: data.postId,
        authorId: data.authorId,
        content: data.content,
        likes: data.likes || 0,
        createdAt: data.createdAt,
        parentCommentId: data.parentCommentId,
        // Use author info directly from comment data
        authorName: data.authorName || 'Unknown User',
        authorAvatar: data.authorAvatar || ''
      } as Comment & { authorName: string; authorAvatar: string });
    }

    // Sort client-side by createdAt desc
    return comments.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const deletePost = async (postId: string, userId: string, isAdmin: boolean = false): Promise<void> => {
  try {
    // Verify the user owns the post OR is an admin
    const postDoc = await getDoc(doc(db, 'communityPosts', postId));
    if (postDoc.exists() && (postDoc.data().authorId === userId || isAdmin)) {
      await deleteDoc(doc(db, 'communityPosts', postId));

      // Also delete all comments for this post
      const commentsQuery = query(
        collection(db, 'comments'),
        where('postId', '==', postId)
      );
      const commentsSnapshot = await getDocs(commentsQuery);

      const deletePromises = commentsSnapshot.docs.map(commentDoc => 
        deleteDoc(doc(db, 'comments', commentDoc.id))
      );

      await Promise.all(deletePromises);
    } else {
      throw new Error('Unauthorized or post not found');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const deleteComment = async (commentId: string, userId: string, isAdmin: boolean = false): Promise<void> => {
  try {
    // Verify the user owns the comment OR is an admin
    const commentDoc = await getDoc(doc(db, 'comments', commentId));
    if (commentDoc.exists() && (commentDoc.data().authorId === userId || isAdmin)) {
      await deleteDoc(doc(db, 'comments', commentId));
    } else {
      throw new Error('Unauthorized or comment not found');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const formatTimeAgo = (timestamp: Timestamp): string => {
  const now = new Date();
  const time = timestamp.toDate();
  const diffInMs = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};