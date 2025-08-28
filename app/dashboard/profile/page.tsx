"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { 
  updateUserProfile, 
  getUserProfileStats, 
  getUserActivity,
  changePassword,
  changeEmail,
  updatePrivacySettings,
  ProfileUpdateData,
  UserProfileStats,
  UserActivity
} from '../../../lib/profile';
import { PrivacySettings as PrivacySettingsType } from '../../../types';
import PrivacySettings from '../../components/profile/PrivacySettings';
import { uploadAvatar, validateImageFile } from '../../../lib/storage';

const ProfilePage = () => {
  const { user, signOut, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  // Data states
  const [userStats, setUserStats] = useState<UserProfileStats>({
    lessonsCompleted: 0,
    appsUsed: 0,
    communityPosts: 0,
    totalWatchTime: 0,
    memberSince: 'Unknown',
    lastActive: 'Unknown',
    streak: 0
  });
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',
    preferences: {
      emailNotifications: user?.profile?.preferences?.emailNotifications ?? true,
      pushNotifications: user?.profile?.preferences?.pushNotifications ?? true,
      communityUpdates: user?.profile?.preferences?.communityUpdates ?? true,
      lessonReminders: user?.profile?.preferences?.lessonReminders ?? true,
      theme: (user?.profile?.preferences?.theme || 'system') as 'light' | 'dark' | 'system'
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: user?.email || '',
    currentPassword: ''
  });

  // Load user data on mount
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        preferences: {
          emailNotifications: user.profile?.preferences?.emailNotifications ?? true,
          pushNotifications: user.profile?.preferences?.pushNotifications ?? true,
          communityUpdates: user.profile?.preferences?.communityUpdates ?? true,
          lessonReminders: user.profile?.preferences?.lessonReminders ?? true,
          theme: (user.profile?.preferences?.theme || 'system') as 'light' | 'dark' | 'system'
        }
      });
      setEmailForm(prev => ({ ...prev, newEmail: user.email || '' }));
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [stats, activity] = await Promise.all([
        getUserProfileStats(user.id),
        getUserActivity(user.id, 8)
      ]);

      setUserStats(stats);
      setUserActivity(activity);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      const updates: ProfileUpdateData = {
        displayName: formData.displayName,
        bio: formData.bio,
        preferences: formData.preferences
      };

      await updateUserProfile(user.id, updates);
      setIsEditing(false);

      // Refresh user data to reflect changes
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(user.id, file, (progress) => {
        // Optional: show upload progress
        console.log(`Upload progress: ${progress.progress}%`);
      });

      // Update user profile with new avatar URL
      await updateUserProfile(user.id, { avatar: result.url });

      // Refresh user data to show new avatar
      await refreshUser();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert('Password changed successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert(error.message || 'Error changing password');
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailForm.newEmail || !emailForm.currentPassword) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await changeEmail(emailForm.newEmail, emailForm.currentPassword);
      setEmailForm({ newEmail: '', currentPassword: '' });
      setShowEmailForm(false);
      alert('Email changed successfully');
    } catch (error: any) {
      console.error('Error changing email:', error);
      alert(error.message || 'Error changing email');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePrivacyUpdate = async (privacySettings: PrivacySettingsType) => {
    if (!user?.id) return;

    try {
      await updatePrivacySettings(user.id, privacySettings);
      // Note: Privacy settings are updated in real-time, no need to reload user data
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Profile
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--surface-0)] rounded-lg border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Personal Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-[var(--theme-primary)] hover:text-[var(--theme-primary)]/80 text-sm font-medium"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-[var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--theme-primary)]/90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-[var(--surface-2)] text-[var(--foreground)] px-4 py-2 rounded-lg hover:bg-[var(--surface-1)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user?.profile?.avatar ? (
                      <img 
                        src={user.profile.avatar} 
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {user?.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-[var(--theme-primary)] text-white p-1 rounded-full cursor-pointer hover:bg-[var(--theme-primary)]/90 transition-colors">
                      {uploadingAvatar ? (
                        <div className="w-3 h-3 animate-spin border border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <span className="text-xs">📷</span>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">
                      {user?.displayName}
                    </h3>
                    <p className="text-[var(--muted-foreground)]">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] capitalize">
                        {user?.role} User
                      </span>
                      {userStats.streak > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--theme-quaternary)]/20 text-[var(--theme-quaternary)]">
                          🔥 {userStats.streak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-[var(--foreground)] mb-2">Bio</h4>
                  <p className="text-[var(--muted-foreground)]">
                    {user?.profile?.bio || 'No bio added yet. Click edit to add one!'}
                  </p>
                </div>

                {/* Preferences Quick Toggle */}
                <div>
                  <button
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="text-sm text-[var(--theme-primary)] hover:underline"
                  >
                    {showPreferences ? 'Hide' : 'Show'} Notification Preferences
                  </button>

                  {showPreferences && (
                    <div className="mt-3 p-4 bg-[var(--surface-1)] rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--foreground)]">Email Notifications</span>
                        <input
                          type="checkbox"
                          checked={formData.preferences.emailNotifications}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, emailNotifications: e.target.checked }
                          }))}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--foreground)]">Community Updates</span>
                        <input
                          type="checkbox"
                          checked={formData.preferences.communityUpdates}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, communityUpdates: e.target.checked }
                          }))}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--foreground)]">Lesson Reminders</span>
                        <input
                          type="checkbox"
                          checked={formData.preferences.lessonReminders}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, lessonReminders: e.target.checked }
                          }))}
                          className="rounded"
                        />
                      </div>
                      <button
                        onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                        disabled={saving}
                        className="w-full bg-[var(--theme-primary)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--theme-primary)]/90 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Privacy Settings Quick Toggle */}
                <div>
                  <button
                    onClick={() => setShowPrivacySettings(!showPrivacySettings)}
                    className="text-sm text-[var(--theme-primary)] hover:underline"
                  >
                    {showPrivacySettings ? 'Hide' : 'Show'} Privacy Settings
                  </button>

                  {showPrivacySettings && user?.profile && (
                    <div className="mt-3">
                      <PrivacySettings
                        settings={user.profile.privacy || {
                          isPublic: false,
                          showStats: true,
                          showActivity: true,
                          showBio: true
                        }}
                        onUpdate={handlePrivacyUpdate}
                        isLoading={saving}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex flex-col gap-8">
          {/* Stats */}
          <div className="bg-[var(--surface-0)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Your Stats
            </h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between animate-pulse">
                    <div className="h-4 bg-[var(--surface-2)] rounded w-20"></div>
                    <div className="h-4 bg-[var(--surface-2)] rounded w-12"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Lessons Completed</span>
                  <span className="font-semibold text-[var(--foreground)]">{userStats.lessonsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Apps Used</span>
                  <span className="font-semibold text-[var(--foreground)]">{userStats.appsUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Community Posts</span>
                  <span className="font-semibold text-[var(--foreground)]">{userStats.communityPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Watch Time</span>
                  <span className="font-semibold text-[var(--foreground)]">{userStats.totalWatchTime}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Member Since</span>
                  <span className="font-semibold text-[var(--foreground)]">{userStats.memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Last Active</span>
                  <span className="font-semibold text-[var(--foreground)]">{userStats.lastActive}</span>
                </div>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-[var(--surface-0)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Account Actions
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full text-left px-3 py-2 text-[var(--foreground)] hover:bg-[var(--surface-1)] rounded-lg transition-colors"
              >
                Change Password
              </button>
              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="p-3 bg-[var(--surface-1)] rounded-lg space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--surface-0)] text-[var(--foreground)] text-sm"
                    required
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--surface-0)] text-[var(--foreground)] text-sm"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--surface-0)] text-[var(--foreground)] text-sm"
                    required
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-[var(--theme-primary)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--theme-primary)]/90 transition-colors">
                      Update
                    </button>
                    <button type="button" onClick={() => setShowPasswordForm(false)} className="bg-[var(--surface-2)] text-[var(--foreground)] px-3 py-1 rounded text-sm hover:bg-[var(--surface-1)] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <button 
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full text-left px-3 py-2 text-[var(--foreground)] hover:bg-[var(--surface-1)] rounded-lg transition-colors"
              >
                Change Email
              </button>
              {showEmailForm && (
                <form onSubmit={handleEmailChange} className="p-3 bg-[var(--surface-1)] rounded-lg space-y-3">
                  <input
                    type="email"
                    placeholder="New Email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--surface-0)] text-[var(--foreground)] text-sm"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={emailForm.currentPassword}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--surface-0)] text-[var(--foreground)] text-sm"
                    required
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-[var(--theme-primary)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--theme-primary)]/90 transition-colors">
                      Update
                    </button>
                    <button type="button" onClick={() => setShowEmailForm(false)} className="bg-[var(--surface-2)] text-[var(--foreground)] px-3 py-1 rounded text-sm hover:bg-[var(--surface-1)] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <hr className="border-[var(--border)]" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-[var(--theme-quinary)] hover:bg-[var(--theme-quinary)]/10 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--surface-0)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Recent Activity
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-[var(--surface-2)] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[var(--surface-2)] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : userActivity.length > 0 ? (
              <div className="space-y-3">
                {userActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'lesson' 
                        ? 'bg-[var(--theme-tertiary)]' 
                        : activity.type === 'app'
                        ? 'bg-[var(--theme-primary)]'
                        : 'bg-[var(--theme-secondary)]'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatTimeAgo(activity.date)}
                      </p>
                      {activity.progress && (
                        <div className="mt-1 w-full bg-[var(--surface-2)] rounded-full h-1">
                          <div 
                            className="bg-[var(--theme-primary)] h-1 rounded-full" 
                            style={{ width: `${activity.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--muted-foreground)] text-sm">
                No recent activity. Start exploring the platform!
              </p>
            )}
          </div>

          {/* Subscription Info */}
          <div className="bg-[var(--surface-0)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Subscription
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Current Plan</span>
                <span className="font-semibold text-[var(--foreground)] capitalize">
                  {user?.role}
                </span>
              </div>
              {user?.role === 'free' && (
                <button className="w-full bg-[var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--theme-primary)]/90 transition-colors">
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;