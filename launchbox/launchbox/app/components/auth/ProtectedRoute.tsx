"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import UpgradeModal from '../subscription/UpgradeModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'free' | 'premium' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'free' 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Stay put unless current route is protected. Caller controls usage.
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasRequiredRole = () => {
    if (!user) return false;

    // Normalize possible role strings from Firestore (e.g., 'premium ' or 'SUPERADMIN')
    const normalizedRole = (user.role || 'free').toString().trim().toLowerCase() as
      'free' | 'premium' | 'admin' | 'superadmin';

    // Any authenticated user should access routes requiring only 'free'
    if (requiredRole === 'free') return true;

    // Superadmin bypasses all checks
    if (normalizedRole === 'superadmin') return true;

    // Include superadmin at the highest level
    const roleHierarchy: Record<'free' | 'premium' | 'admin' | 'superadmin', number> = {
      free: 0,
      premium: 1,
      admin: 2,
      superadmin: 3,
    };

    const userRoleLevel = roleHierarchy[normalizedRole] ?? 0;
    const requiredRoleLevel = roleHierarchy[
      (requiredRole as 'free' | 'premium' | 'admin')
    ];

    return userRoleLevel >= requiredRoleLevel;
  };

  if (!hasRequiredRole()) {
    // If user needs premium access, show upgrade options
    const normalizedRole = (user?.role || 'free').toString().trim().toLowerCase();
    if (requiredRole === 'premium' && normalizedRole === 'free') {
      return (
        <div className="min-h-screen theme-bg-quaternary flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="theme-bg-secondary rounded-lg p-8 border theme-border-primary text-center">
              {/* Premium Required Icon */}
              <div className="w-20 h-20 theme-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">⭐</span>
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">
                Premium Required
              </h1>
              <p className="text-gray-300 mb-6">
                This feature is available to Premium members only. Upgrade now to unlock 
                advanced features and enhance your experience.
              </p>

              {/* Premium Benefits */}
              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Access to all premium applications
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Advanced lessons and tutorials
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Priority community support
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Export functionality
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full theme-primary text-white py-3 px-6 rounded-lg hover:brightness-110 transition-all font-medium"
                >
                  Upgrade to Premium
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full theme-border-primary border theme-text-primary py-3 px-6 rounded-lg hover:theme-bg-primary-light transition-all"
                >
                  Go Back
                </button>
              </div>

              {/* Alternative Navigation */}
              <div className="mt-6 pt-6 border-t theme-border-secondary">
                <p className="text-sm text-gray-400 mb-3">
                  Or explore free features:
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm theme-text-primary hover:text-blue-300 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/community')}
                    className="text-sm theme-text-primary hover:text-blue-300 transition-colors"
                  >
                    Community
                  </button>
                </div>
              </div>
            </div>

            {/* Upgrade Modal */}
            <UpgradeModal 
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
            />
          </div>
        </div>
      );
    }

    // For admin access or other restrictions
    return (
      <div className="min-h-screen theme-bg-quaternary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 theme-bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-300 mb-6">
            You need {requiredRole} access to view this page.
          </p>
          <button
            onClick={() => router.back()}
            className="theme-primary text-white px-6 py-3 rounded-lg hover:brightness-110 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;