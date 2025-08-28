//app/dashboard/apps/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/auth-context';

interface AppData {
  id: string;
  title: string;
  description: string;
  accessLevel: 'free' | 'premium' | 'admin';
  category: string;
  route: string;
  imageUrl: string;
  instructions: string;
  featured: boolean;
  isLive: boolean;
}

const AppsPage = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const nativeApps: AppData[] = [
    {
      id: 'task-manager',
      title: 'Task Manager Pro',
      description: 'Smart task management with priorities, deadlines, and productivity insights. Track your progress and boost efficiency.',
      accessLevel: 'free',
      category: 'Productivity',
      route: '/dashboard/apps/task-manager',
      imageUrl: '/images/task-manager.jpg',
      instructions: 'Create tasks, set priorities, and track your productivity with built-in analytics.',
      featured: true,
      isLive: true,
    },
    {
      id: 'code-snippets',
      title: 'Code Snippet Manager',
      description: 'Store, organize, and search your code snippets with syntax highlighting. Never lose useful code again.',
      accessLevel: 'free',
      category: 'Development',
      route: '/dashboard/apps/code-snippets',
      imageUrl: '/images/snippets.jpg',
      instructions: 'Save code snippets with tags, descriptions, and instant search functionality.',
      featured: true,
      isLive: true,
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      description: 'Build better habits with visual progress tracking, streaks, and motivational insights.',
      accessLevel: 'free',
      category: 'Productivity',
      route: '/dashboard/apps/habit-tracker',
      imageUrl: '/images/habits.jpg',
      instructions: 'Create habits, track daily progress, and build lasting positive routines.',
      featured: false,
      isLive: false,
    },
    {
      id: 'expense-tracker',
      title: 'Expense Tracker',
      description: 'Personal finance management with categorized expenses, budgets, and spending insights.',
      accessLevel: 'premium',
      category: 'Finance',
      route: '/dashboard/apps/expense-tracker',
      imageUrl: '/images/expenses.jpg',
      instructions: 'Track expenses, set budgets, and analyze your spending patterns.',
      featured: false,
      isLive: false,
    },
    {
      id: 'workout-planner',
      title: 'Workout Planner',
      description: 'Create custom workout routines, track exercises, and monitor your fitness progress over time.',
      accessLevel: 'premium',
      category: 'Health',
      route: '/dashboard/apps/workout-planner',
      imageUrl: '/images/workout.jpg',
      instructions: 'Plan workouts, log exercises, and track your fitness journey.',
      featured: true,
      isLive: false,
    },
    {
      id: 'note-taker',
      title: 'Smart Note Taker',
      description: 'Advanced note-taking with markdown support, tags, and AI-powered search and organization.',
      accessLevel: 'free',
      category: 'Productivity',
      route: '/dashboard/apps/note-taker',
      imageUrl: '/images/notes.jpg',
      instructions: 'Take notes, organize with tags, and find information instantly.',
      featured: false,
      isLive: false,
    },
  ];

  const categories = ['all', 'Productivity', 'Development', 'Finance', 'Health'];

  const filteredApps = selectedCategory === 'all' 
    ? nativeApps 
    : nativeApps.filter(app => app.category === selectedCategory);

  const hasAccess = (app: AppData) => {
    if (!user) return false;

    const normalizedRole = (user.role || 'free').toString().trim().toLowerCase();
    if (normalizedRole === 'superadmin') return true;

    const accessLevels: Record<'free' | 'premium' | 'admin', number> = { free: 0, premium: 1, admin: 2 };
    const userLevel = accessLevels[(normalizedRole as 'free' | 'premium' | 'admin')] ?? 0;
    const requiredLevel = accessLevels[app.accessLevel];

    return userLevel >= requiredLevel;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Applications
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Powerful tools to enhance your productivity and workflow
          </p>
        </div>
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

      {/* App Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredApps.map((app) => {
          const userHasAccess = hasAccess(app);
          const isComingSoon = !app.isLive;

          const AppCard = (
            <div
              className={`relative bg-[var(--surface-0)] rounded-lg border border-[var(--border)] p-6 transition-all duration-200 ${
                userHasAccess && app.isLive
                  ? 'hover:shadow-lg hover:scale-105 cursor-pointer' 
                  : 'opacity-75'
              } ${app.featured ? 'ring-2 ring-[var(--theme-primary)] ring-opacity-50' : ''}`}
            >
              {/* Status badges */}
              <div className="absolute top-4 left-4 flex gap-3">
                {app.featured && (
                  <span className="bg-[var(--theme-primary)] text-white px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
                {isComingSoon && (
                  <span className="bg-[var(--theme-quaternary)] text-white px-3 py-1 rounded-full text-xs font-medium">
                    Coming Soon
                  </span>
                )}
              </div>

              <div className="aspect-video w-full rounded-lg bg-[var(--surface-1)] mb-4 overflow-hidden">
                <img 
                  src={app.imageUrl} 
                  alt={app.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#334155"/><text x="150" y="90" font-family="Arial" font-size="14" fill="#e2e8f0" text-anchor="middle">${app.title}</text><text x="150" y="110" font-family="Arial" font-size="12" fill="#94a3b8" text-anchor="middle">${app.category}</text></svg>`)}`;
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {app.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    app.accessLevel === 'free' 
                      ? 'bg-[var(--theme-tertiary)] text-white'
                      : app.accessLevel === 'premium'
                      ? 'bg-[var(--theme-quaternary)] text-white'
                      : 'bg-[var(--theme-secondary)] text-white'
                  }`}>
                    {app.accessLevel}
                  </span>
                </div>

                <p className="text-sm text-[var(--muted-foreground)]">
                  {app.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {app.category}
                  </span>

                  {!userHasAccess ? (
                    <span className="text-[var(--muted-foreground)] text-sm">
                      {app.accessLevel === 'premium' ? 'Premium Required' : 'Access Denied'}
                    </span>
                  ) : isComingSoon ? (
                    <span className="text-[var(--theme-quaternary)] text-sm font-medium">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="text-[var(--theme-primary)] hover:opacity-80 text-sm font-medium">
                      Launch App →
                    </span>
                  )}
                </div>
              </div>
            </div>
          );

          // Wrap with Link if app is live and user has access
          return userHasAccess && app.isLive ? (
            <Link key={app.id} href={app.route}>
              {AppCard}
            </Link>
          ) : (
            <div key={app.id}>
              {AppCard}
            </div>
          );
        })}
      </div>

      {/* Live Apps Info */}
      <div className="bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-2">
          🚀 Native Apps Available
        </h3>
        <p className="text-[var(--theme-primary)]/80 mb-4">
          Our apps are built natively into the platform for the best user experience. Click on any live app to start using it immediately!
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--theme-tertiary)] rounded-full"></div>
            <span className="text-[var(--theme-primary)]">Live & Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--theme-quaternary)] rounded-full"></div>
            <span className="text-[var(--theme-primary)]">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsPage;