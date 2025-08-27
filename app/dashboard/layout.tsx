"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../lib/theme-context';
import { usePageConfig } from '../../lib/page-config-context';
import { useIsMobile } from '../../hooks/use-media-query';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarNav, 
  SidebarUser 
} from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  BarChart3, 
  Rocket, 
  GraduationCap, 
  Users, 
  User, 
  CreditCard, 
  Settings, 
  Menu, 
  Bell,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  // Safe theme access with fallback
  let theme, setThemeMode;
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    setThemeMode = themeContext.setThemeMode;
  } catch (error) {
    console.warn('Theme context failed, using fallback:', error);
    // Fallback theme object
    theme = {
      mode: 'light',
      branding: {
        title: 'Ian McDonald AI',
        logoUrl: ''
      }
    };
    setThemeMode = () => {}; // No-op fallback
  }
  const { pageConfig } = usePageConfig();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const navigationItems = [
    { 
      name: 'Overview', 
      href: '/dashboard', 
      icon: <BarChart3 className="h-5 w-5" />
    },
    ...(pageConfig.enableApps ? [{ 
      name: 'Apps', 
      href: '/dashboard/apps', 
      icon: <Rocket className="h-5 w-5" />,
      badge: user?.role === 'premium' ? 'Pro' : undefined
    }] : []),
    ...(pageConfig.enableLessons ? [{ 
      name: 'Lessons', 
      href: '/dashboard/lessons', 
      icon: <GraduationCap className="h-5 w-5" />
    }] : []),
    { 
      name: 'Community', 
      href: '/dashboard/community', 
      icon: <Users className="h-5 w-5" />
    },
    { 
      name: 'Profile', 
      href: '/dashboard/profile', 
      icon: <User className="h-5 w-5" />
    },
    ...(user ? [{ 
      name: 'Billing', 
      href: '/dashboard/billing', 
      icon: <CreditCard className="h-5 w-5" />
    }] : []),
    ...((user?.role === 'admin' || user?.role === 'superadmin') ? [{ 
      name: 'Admin', 
      href: '/dashboard/admin', 
      icon: <Settings className="h-5 w-5" />,
      badge: 'Admin'
    }] : []),
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const toggleTheme = async () => {
    console.log('Theme toggle clicked - forcing manual toggle');

    // Manual theme toggle that directly manipulates the DOM
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    // Force DOM manipulation with multiple methods
    if (isDark) {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.setProperty('--background', '#ffffff', 'important');
      root.style.setProperty('--foreground', '#0a0a0a', 'important');
      console.log('Switched to light mode - DOM forced');
    } else {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.setProperty('--background', '#0a0a0a', 'important');
      root.style.setProperty('--foreground', '#fafafa', 'important');
      console.log('Switched to dark mode - DOM forced');
    }

    // Force style recalculation by triggering reflow
    const dummy = root.offsetHeight;

    // Skip React context for now since it's causing issues
    console.log('Theme toggled successfully');
  };

  const getThemeIcon = () => {
    switch (theme.mode) {
      case 'light': return <Sun className="h-5 w-5" />;
      case 'dark': return <Moon className="h-5 w-5" />;
      case 'system': return <Monitor className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {/* Mobile header */}
        {isMobile && (
          <motion.header 
            className="sticky top-0 z-50 glass border-b border-[var(--border)] backdrop-blur-xl"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {theme.branding.logoUrl && (
                  <img 
                    src={theme.branding.logoUrl} 
                    alt="Logo" 
                    className="h-8 w-auto"
                  />
                )}
                <h1 className="text-xl font-bold text-[var(--theme-primary)]">
                  {theme.branding.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme}
                  title={`Current: ${theme.mode} mode. Click to switch.`}
                >
                  {getThemeIcon()}
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.header>
        )}

        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="hidden md:flex md:flex-shrink-0"
            >
              <Sidebar variant="glass" className="border-r-0">
                <SidebarHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {theme.branding.logoUrl && (
                        <img 
                          src={theme.branding.logoUrl} 
                          alt="Logo" 
                          className="h-8 w-auto"
                        />
                      )}
                      <div>
                        <h1 className="text-lg font-bold text-[var(--theme-primary)]">
                          {theme.branding.title}
                        </h1>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          AI Learning Platform
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleTheme}
                      title={`Current: ${theme.mode} mode. Click to switch.`}
                      className="h-8 w-8"
                    >
                      {getThemeIcon()}
                    </Button>
                  </div>
                </SidebarHeader>

                <SidebarContent>
                  <SidebarNav items={navigationItems} />
                </SidebarContent>

                {user && (
                  <SidebarFooter>
                    <SidebarUser
                      user={{
                        name: user.displayName,
                        email: user.email,
                        avatar: user.profile.avatar,
                        role: user.role,
                      }}
                      onSignOut={handleSignOut}
                      className="group"
                    />
                  </SidebarFooter>
                )}
              </Sidebar>
            </motion.div>
          )}

          {/* Mobile Sidebar */}
          {isMobile && (
            <div className="fixed inset-0 z-40 md:hidden">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={closeSidebar}
                />
              )}

              <Sidebar 
                variant="glass" 
                isOpen={sidebarOpen} 
                onClose={closeSidebar}
                className="absolute left-0 top-0 h-full z-50"
              >
                <SidebarHeader>
                  {theme.branding.logoUrl && (
                    <img 
                      src={theme.branding.logoUrl} 
                      alt="Logo" 
                      className="h-8 w-auto"
                    />
                  )}
                  <div>
                    <h1 className="text-lg font-bold text-[var(--theme-primary)]">
                      {theme.branding.title}
                    </h1>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      AI Learning Platform
                    </p>
                  </div>
                </SidebarHeader>

                <SidebarContent>
                  <SidebarNav items={navigationItems} />
                </SidebarContent>

                {user && (
                  <SidebarFooter>
                    <SidebarUser
                      user={{
                        name: user.displayName,
                        email: user.email,
                        avatar: user.profile.avatar,
                        role: user.role,
                      }}
                      onSignOut={handleSignOut}
                    />
                  </SidebarFooter>
                )}
              </Sidebar>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Desktop header with breadcrumbs */}
            {!isMobile && (
              <motion.header 
                className="glass border-b border-[var(--border)] backdrop-blur-xl"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">
                      {navigationItems.find(item => item.href === pathname)?.name || 'Dashboard'}
                    </h1>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                      >
                        3
                      </Badge>
                    </Button>

                    {user && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </motion.header>
            )}

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto bg-[var(--surface-0)]">
              <motion.div 
                className="container mx-auto p-6 max-w-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;