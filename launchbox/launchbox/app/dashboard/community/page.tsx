"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/auth-context';
import { 
  createPost, 
  getPosts, 
  likePost, 
  addComment, 
  getComments, 
  deletePost,
  deleteComment,
  formatTimeAgo 
} from '../../../lib/community';
import { CommunityPost, Comment } from '../../../types';
import { Timestamp } from 'firebase/firestore';

interface ExtendedPost extends CommunityPost {
  likedBy: string[];
  commentCount?: number;
}

const CommunityPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'Learning',
    tags: ''
  });

  const categories = ['all', 'Learning', 'Tips', 'Study Groups', 'Showcase', 'Questions'];

  useEffect(() => {
    if (!authLoading && user) {
      loadPosts();
    }
  }, [selectedCategory, authLoading, user?.id]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const tenantId = (user as any)?.tenantId || 'default';
      const fetchedPosts = await getPosts(selectedCategory, 20, tenantId) as ExtendedPost[];
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const tenantId = (user as any)?.tenantId || 'default';
      const postId = await createPost(
        user.id, 
        user.displayName || 'Anonymous User',
        user.profile?.avatar || '',
        newPost.title, 
        newPost.content, 
        newPost.category, 
        tags,
        tenantId
      );

      // Add new post to local state
      const newPostData: ExtendedPost = {
        id: postId,
        authorId: user.id,
        authorName: user.displayName || 'Anonymous User',
        authorAvatar: user.profile?.avatar || '',
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        likes: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        tags: tags,
        likedBy: [],
        commentCount: 0
      };

      setPosts(prevPosts => [newPostData, ...prevPosts]);
      setNewPost({ title: '', content: '', category: 'Learning', tags: '' });
      setShowNewPostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user?.id) return;

    // Optimistic update - update UI immediately
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(user.id);
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked 
            ? post.likedBy.filter(id => id !== user.id)
            : [...post.likedBy, user.id]
        };
      }
      return post;
    }));

    try {
      await likePost(postId, user.id);
      // No need to refresh - optimistic update already applied
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likedBy.includes(user.id);
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedBy: isLiked 
              ? post.likedBy.filter(id => id !== user.id)
              : [...post.likedBy, user.id]
          };
        }
        return post;
      }));
      alert('Error updating like. Please try again.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) return;

    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId, user.id, user.role === 'admin');
        // Remove post from local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        // Remove comments for this post
        setComments(prev => {
          const newComments = { ...prev };
          delete newComments[postId];
          return newComments;
        });
        // Remove from expanded comments
        setExpandedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      }
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!user?.id) return;

    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId, user.id, user.role === 'admin');
        // Remove comment from local state
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId]?.filter(comment => comment.id !== commentId) || []
        }));
        // Update comment count in posts
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentCount: (post.commentCount || 0) - 1
            };
          }
          return post;
        }));
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error deleting comment. Please try again.');
      }
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedComments.has(postId)) {
      setExpandedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      // Check if we already have comments for this post
      if (comments[postId] && comments[postId].length >= 0) {
        // We already have comments, just expand
        setExpandedComments(prev => new Set(prev).add(postId));
      } else {
        // Need to fetch comments
        try {
          const tenantId = (user as any)?.tenantId || 'default';
          const postComments = await getComments(postId, tenantId);
          setComments(prev => ({ ...prev, [postId]: postComments }));
          setExpandedComments(prev => new Set(prev).add(postId));
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Community
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Connect with fellow learners and share your journey
          </p>
        </div>
        <button 
          onClick={() => setShowNewPostForm(true)}
          className="bg-[var(--theme-primary)] text-white px-8 py-3 rounded-lg hover:bg-[var(--theme-primary)]/90 transition-colors"
        >
          New Post
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-4 flex-wrap mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-8 py-3 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-[var(--theme-primary)] text-white'
                : 'bg-[var(--surface-1)] text-[var(--foreground)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <div className="bg-[var(--surface-0)] rounded-lg border border-[var(--border)] p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Create New Post
          </h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                placeholder="What's on your mind?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                Content *
              </label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                placeholder="Share your thoughts, tips, or questions..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                >
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                  placeholder="react, typescript, help"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-[var(--theme-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--theme-primary)]/90 transition-colors"
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setShowNewPostForm(false)}
                className="bg-[var(--surface-2)] text-[var(--foreground)] px-6 py-3 rounded-lg hover:bg-[var(--surface-1)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Feed */}
      <div className="flex flex-col gap-6"> 
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-[var(--surface-0)] rounded-lg border border-[var(--border)] p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[var(--surface-2)] rounded-full"></div>
                <div>
                  <div className="h-4 bg-[var(--surface-2)] rounded w-24 mb-2"></div>
                  <div className="h-3 bg-[var(--surface-2)] rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-[var(--surface-2)] rounded w-3/4 mb-2"></div>
              <div className="h-16 bg-[var(--surface-2)] rounded w-full"></div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted-foreground)]">
              {selectedCategory === 'all' 
                ? 'No posts yet. Be the first to share something!' 
                : `No posts in ${selectedCategory} category.`}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-[var(--surface-0)] rounded-xl border border-[var(--border)] p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02]"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {post.authorAvatar ? (
                    <img 
                      src={post.authorAvatar} 
                      alt={post.authorName || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {post.authorName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] text-base">
                      <Link 
                        href={`/dashboard/user/${post.authorId}`}
                        className="hover:text-[var(--theme-primary)] transition-colors cursor-pointer"
                      >
                        {post.authorName}
                      </Link>
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] font-medium">
                      {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30">
                    {post.category}
                  </span>
                  {(user?.id === post.authorId || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-[var(--theme-quinary)] hover:text-[var(--theme-quinary)]/80 p-1 transition-colors"
                      title={user?.role === 'admin' && user?.id !== post.authorId ? 'Delete post (Admin)' : 'Delete post'}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-[var(--foreground)] mb-3">
                  {post.title}
                </h4>
                <p className="text-[var(--foreground)] leading-relaxed text-base">
                  {post.content}
                </p>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-3 mb-6 flex-wrap">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--theme-primary)] text-white shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      post.likedBy?.includes(user?.id || '')
                        ? 'bg-[var(--theme-quinary)] text-white shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-[var(--surface-1)] text-[var(--foreground)] hover:bg-[var(--surface-2)] hover:shadow-md'
                    }`}
                  >
                    <span className="text-base">
                      {post.likedBy?.includes(user?.id || '') ? '❤️' : '🤍'}
                    </span>
                    <span>{post.likes}</span>
                  </button>

                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--surface-1)] text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-all duration-200 hover:shadow-md"
                  >
                    <span className="text-base">💬</span>
                    <span>{post.commentCount || comments[post.id]?.length || 0}</span>
                  </button>
                </div>

                <button className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)] transition-all duration-200">
                  Share
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="space-y-3">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        {comment.authorAvatar ? (
                          <img 
                            src={comment.authorAvatar} 
                            alt={comment.authorName || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-primary)] rounded-full flex items-center justify-center text-white font-medium text-xs">
                            {comment.authorName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="bg-[var(--surface-1)] rounded-lg p-3">
                            <p className="text-sm font-medium text-[var(--foreground)]">
                              <Link 
                                href={`/dashboard/user/${comment.authorId}`}
                                className="hover:text-[var(--theme-primary)] transition-colors cursor-pointer"
                              >
                                {comment.authorName}
                              </Link>
                            </p>
                            <p className="text-sm text-[var(--foreground)] mt-1">
                              {comment.content}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {formatTimeAgo(comment.createdAt)}
                            </p>
                            {(user?.id === comment.authorId || user?.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                className="text-[var(--theme-quinary)] hover:text-[var(--theme-quinary)]/80 p-1 text-xs transition-colors"
                                title={user?.role === 'admin' && user?.id !== comment.authorId ? 'Delete comment (Admin)' : 'Delete comment'}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Form */}
                  <div className="mt-4">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      const content = formData.get('comment') as string;
                      if (content.trim() && user?.id) {
                        try {
                          const commentId = await addComment(
                            post.id, 
                            user.id, 
                            user.displayName || 'Anonymous User',
                            user.profile?.avatar || '',
                            content.trim()
                          );

                          // Add new comment to local state
                          const newComment = {
                            id: commentId,
                            postId: post.id,
                            authorId: user.id,
                            authorName: user.displayName || 'Anonymous User',
                            authorAvatar: user.profile?.avatar || '',
                            content: content.trim(),
                            likes: 0,
                            createdAt: Timestamp.now(),
                            parentCommentId: null
                          };

                          setComments(prev => ({
                            ...prev,
                            [post.id]: [newComment, ...(prev[post.id] || [])]
                          }));

                          // Update comment count in posts
                          setPosts(prevPosts => prevPosts.map(p => {
                            if (p.id === post.id) {
                              return { ...p, commentCount: (p.commentCount || 0) + 1 };
                            }
                            return p;
                          }));

                          form.reset();
                        } catch (error) {
                          console.error('Error adding comment:', error);
                        }
                      }
                    }}>
                      <div className="flex gap-4">
                        {user?.profile?.avatar ? (
                          <img 
                            src={user.profile.avatar} 
                            alt={user.displayName || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-full flex items-center justify-center text-white font-medium text-xs">
                            {user?.displayName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            name="comment"
                            type="text"
                            placeholder="Write a comment..."
                            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] text-sm focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary)]/90 transition-colors text-sm"
                        >
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPage;