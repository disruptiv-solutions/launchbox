"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';
import { getUserStats, getUserRecentActivity, DashboardStats, RecentActivity } from '../../lib/dashboard-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';
import { SkeletonCard, SkeletonText } from '../../components/ui/skeleton';
import { 
  TrendingUp, 
  Rocket, 
  GraduationCap, 
  Users, 
  Clock, 
  ArrowRight,
  Sparkles,
  Target,
  Activity,
  Calendar
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    appsUsed: 0,
    lessonsCompleted: 0,
    communityPosts: 0,
    timeSaved: '0h'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const [userStats, activity] = await Promise.all([
          getUserStats(user.id),
          getUserRecentActivity(user.id)
        ]);

        setStats(userStats);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const statsCards = [
    { 
      name: 'Apps Used', 
      value: stats.appsUsed.toString(), 
      icon: Rocket,
      description: 'Applications accessed',
      trend: '+12%',
      color: 'text-[var(--theme-primary)]'
    },
    { 
      name: 'Lessons Completed', 
      value: stats.lessonsCompleted.toString(), 
      icon: GraduationCap,
      description: 'Learning progress',
      trend: '+23%',
      color: 'text-[var(--theme-secondary)]'
    },
    { 
      name: 'Community Posts', 
      value: stats.communityPosts.toString(), 
      icon: Users,
      description: 'Your contributions',
      trend: '+8%',
      color: 'text-[var(--theme-tertiary)]'
    },
    { 
      name: 'Time Saved', 
      value: stats.timeSaved, 
      icon: Clock,
      description: 'Productivity boost',
      trend: '+15%',
      color: 'text-[var(--theme-quaternary)]'
    },
  ];

  const quickActions = [
    { 
      name: 'Browse Apps', 
      href: '/dashboard/apps', 
      icon: Rocket, 
      description: 'Explore powerful AI tools',
      gradient: 'from-[var(--theme-primary)] to-[var(--theme-secondary)]'
    },
    { 
      name: 'Watch Lessons', 
      href: '/dashboard/lessons', 
      icon: GraduationCap, 
      description: 'Continue learning journey',
      gradient: 'from-[var(--theme-secondary)] to-[var(--theme-tertiary)]'
    },
    { 
      name: 'Join Community', 
      href: '/dashboard/community', 
      icon: Users, 
      description: 'Connect with learners',
      gradient: 'from-[var(--theme-tertiary)] to-[var(--theme-quaternary)]'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="glass" hover="glow" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10" />
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  Welcome back, {user?.displayName}! 
                  <Sparkles className="h-6 w-6 text-[var(--theme-primary)]" />
                </h1>
                <p className="text-[var(--muted-foreground)] text-lg">
                  Ready to continue your AI learning journey?
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Target className="h-3 w-3 mr-1" />
                    {user?.role} Member
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Badge>
                </div>
              </div>
              <Avatar 
                src={user?.profile.avatar} 
                fallback={user?.displayName || 'User'} 
                size="xl"
                className="ring-4 ring-[var(--theme-primary)]/20"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Your Progress</h2>
          <Badge variant="ghost" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Data
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            statsCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div key={stat.name} variants={itemVariants}>
                  <Card variant="elevated" hover="lift" className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[var(--surface-2)] opacity-50" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                        {stat.name}
                      </CardTitle>
                      <IconComponent className={`h-5 w-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-[var(--foreground)]">
                        {stat.value}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {stat.description}
                        </p>
                        <Badge variant="success" size="sm" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {stat.trend}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div
          className="lg:col-span-2"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <motion.div key={action.name} variants={itemVariants}>
                  <Card 
                    variant="glass" 
                    hover="scale"
                    className="group cursor-pointer transition-all duration-300 hover:shadow-xl"
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--theme-primary)] transition-colors">
                          {action.name}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          {action.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full group-hover:bg-[var(--theme-primary)] group-hover:text-white transition-all duration-300"
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Recent Activity</h2>
          <Card variant="elevated" className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Latest Updates</CardTitle>
              <CardDescription>Your recent platform activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <SkeletonText lines={4} />
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--surface-1)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-[var(--theme-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No recent activity yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;