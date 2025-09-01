"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Users, Crown, Shield, User, Calendar, Mail, Settings } from 'lucide-react';
import { getUsers, updateUserRole } from '../../../../lib/admin';
import { User as UserType } from '../../../../types';

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'free' | 'premium' | 'admin' | 'superadmin') => {
    try {
      setUpdatingUserId(userId);
      await updateUserRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return <Crown className="h-3 w-3" />;
      case 'premium':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'free':
        return 'bg-[var(--surface-1)] text-[var(--foreground)]';
      case 'premium':
        return 'bg-[var(--theme-tertiary)] text-white';
      case 'admin':
        return 'bg-[var(--theme-secondary)] text-white';
      case 'superadmin':
        return 'bg-[var(--theme-primary)] text-white';
      default:
        return 'bg-[var(--surface-1)] text-[var(--muted-foreground)]';
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Unknown';
    try {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate user statistics
  const userStats = {
    total: users.length,
    free: users.filter(u => u.role === 'free').length,
    premium: users.filter(u => u.role === 'premium').length,
    admin: users.filter(u => u.role === 'admin').length,
    superadmin: users.filter(u => u.role === 'superadmin').length
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Users className="h-8 w-8 text-[var(--theme-primary)]" />
            User Management
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            View and manage user accounts and permissions
          </p>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--theme-primary)] mb-1">
                {userStats.total}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Total Users</div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--muted-foreground)] mb-1">
                {userStats.free}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Free</div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--theme-tertiary)] mb-1">
                {userStats.premium}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Premium</div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--theme-secondary)] mb-1">
                {userStats.admin}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Admin</div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--theme-primary)] mb-1">
                {userStats.superadmin}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Super Admin</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card variant="elevated" hover="lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[var(--theme-primary)]" />
              All Users
            </CardTitle>
            <CardDescription>
              Manage user roles and permissions ({users.length} total users)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--theme-primary)] border-t-transparent mx-auto"></div>
                <p className="mt-3 text-[var(--muted-foreground)]">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                <p className="text-[var(--muted-foreground)] text-lg font-medium">
                  No users found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {users.map((userItem) => (
                  <div key={userItem.id} className="p-6 hover:bg-[var(--surface-1)] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {userItem.profile?.avatar ? (
                            <img
                              src={userItem.profile.avatar}
                              alt={`${userItem.displayName}'s avatar`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-[var(--border)]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] flex items-center justify-center text-white font-medium text-lg">
                              {userItem.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[var(--foreground)] font-semibold text-lg">
                              {userItem.displayName}
                            </h3>
                            {userItem.id === user?.uid && (
                              <Badge variant="outline" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{userItem.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Joined: {formatDate(userItem.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Role Management */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleUpdateUserRole(userItem.id, e.target.value as 'free' | 'premium' | 'admin' | 'superadmin')}
                          disabled={updatingUserId === userItem.id || userItem.id === user?.uid}
                          className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] disabled:opacity-50"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>

                        <Badge 
                          variant="outline" 
                          className={`${getRoleBadgeClass(userItem.role)} flex items-center gap-1`}
                        >
                          {getRoleIcon(userItem.role)}
                          {userItem.role === 'superadmin' ? 'Super Admin' : userItem.role}
                        </Badge>

                        {updatingUserId === userItem.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--theme-primary)] border-t-transparent"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        {users.length > 0 && (
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  User Management Notes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--muted-foreground)]">
                  <div>
                    <p>• You cannot change your own role</p>
                    <p>• Role changes take effect immediately</p>
                  </div>
                  <div>
                    <p>• Super Admins have all permissions</p>
                    <p>• Premium users have access to premium features</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default UsersPage;