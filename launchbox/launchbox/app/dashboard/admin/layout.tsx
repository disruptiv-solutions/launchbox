// app/dashboard/admin/layout.tsx
"use client";

import React from 'react';
import { useAuth } from '../../../contexts/auth-context';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Crown, 
  BarChart3,
  Globe,
  Rocket,
  BookOpen,
  Users,
  Palette,
  FileText,
  Wrench
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const adminTabs = [
    { 
      id: 'platforms', 
      name: 'Platforms', 
      icon: Globe, 
      href: '/dashboard/admin/platforms',
      description: 'Manage platform integrations'
    },
    { 
      id: 'apps', 
      name: 'Apps', 
      icon: Rocket, 
      href: '/dashboard/admin/apps',
      description: 'Manage applications'
    },
    { 
      id: 'lessons', 
      name: 'Lessons', 
      icon: BookOpen, 
      href: '/dashboard/admin/lessons',
      description: 'Manage lessons and content'
    },
    { 
      id: 'users', 
      name: 'Users', 
      icon: Users, 
      href: '/dashboard/admin/users',
      description: 'User management and roles'
    },
    { 
      id: 'customize', 
      name: 'Customize', 
      icon: Palette, 
      href: '/dashboard/admin/customize',
      description: 'Customize appearance'
    },
    { 
      id: 'pages', 
      name: 'Pages', 
      icon: FileText, 
      href: '/dashboard/admin/pages',
      description: 'Configure page availability'
    },
    { 
      id: 'maintenance', 
      name: 'Maintenance', 
      icon: Wrench, 
      href: '/dashboard/admin/maintenance',
      description: 'Database maintenance tools'
    }
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <Card variant="glass" hover="glow" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10" />
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gradient flex items-center gap-3">
                  <Shield className="h-8 w-8 text-[var(--theme-primary)]" />
                  Admin Dashboard
                </h1>
                <p className="text-lg text-[var(--muted-foreground)]">
                  Manage platforms, applications, lessons, and users
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <Badge variant="secondary" className="animate-pulse-glow">
                    <Crown className="h-3 w-3 mr-1" />
                    Administrator Access
                  </Badge>
                  <Badge variant="outline">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Full Control Panel
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link key={tab.id} href={tab.href}>
                <Card 
                  variant={isActive ? "glass" : "elevated"} 
                  hover="lift" 
                  className={`relative overflow-hidden transition-all cursor-pointer ${
                    isActive ? 'ring-2 ring-[var(--theme-primary)]/50' : ''
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent ${
                    isActive 
                      ? 'to-[var(--theme-primary)]/30' 
                      : 'to-[var(--theme-primary)]/10'
                  }`} />
                  <CardContent className="relative p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <IconComponent className={`h-12 w-12 ${
                        isActive 
                          ? 'text-[var(--theme-primary)]' 
                          : 'text-[var(--muted-foreground)]'
                      }`} />
                      <div>
                        <h3 className={`font-semibold text-lg ${
                          isActive 
                            ? 'text-[var(--theme-primary)]' 
                            : 'text-[var(--foreground)]'
                        }`}>
                          {tab.name}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          {tab.description}
                        </p>
                      </div>
                      {isActive && (
                        <Badge variant="secondary" className="animate-pulse-glow">
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Page Content */}
        <div>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;