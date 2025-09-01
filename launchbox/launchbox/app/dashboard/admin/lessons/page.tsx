"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { BookOpen, Plus, Edit2, Trash2, Clock, User, PlayCircle } from 'lucide-react';
import { getLessons, createLesson, updateLesson, deleteLesson } from '../../../../lib/admin';
import { Lesson } from '../../../../types';

const AdminLessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const lessonsData = await getLessons();
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-[var(--theme-tertiary)]/20 text-[var(--theme-tertiary)]';
      case 'intermediate':
        return 'bg-[var(--theme-secondary)]/20 text-[var(--theme-secondary)]';
      case 'advanced':
        return 'bg-[var(--theme-quinary)]/20 text-[var(--theme-quinary)]';
      default:
        return 'bg-[var(--surface-1)] text-[var(--muted-foreground)]';
    }
  };

  const formatDuration = (duration: number | string | undefined): string => {
    if (!duration) return 'TBD';
    if (typeof duration === 'number') {
      return `${duration} min`;
    }
    return duration.toString();
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-[var(--theme-primary)]" />
              Lessons Management
            </h1>
            <p className="text-[var(--muted-foreground)] mt-2">
              Create and manage video lessons and educational content
            </p>
          </div>
          <Button 
            variant="gradient"
            leftIcon={<Plus className="h-4 w-4" />}
            className="shadow-glow"
          >
            Add Lesson
          </Button>
        </div>

        {/* Main Content */}
        <Card variant="elevated" hover="lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-[var(--theme-primary)]" />
              Video Lessons
            </CardTitle>
            <CardDescription>
              Manage educational content ({lessons.length} total lessons)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--theme-primary)] border-t-transparent mx-auto"></div>
                <p className="mt-3 text-[var(--muted-foreground)]">Loading lessons...</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                <p className="text-[var(--muted-foreground)] text-lg font-medium">
                  No lessons found
                </p>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Create your first lesson to get started!
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create First Lesson
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="p-6 hover:bg-[var(--surface-1)] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {lesson.thumbnailUrl || lesson.thumbnail ? (
                            <img
                              src={lesson.thumbnailUrl || lesson.thumbnail}
                              alt={lesson.title}
                              className="w-20 h-14 rounded-lg object-cover border border-[var(--border)]"
                            />
                          ) : (
                            <div className="w-20 h-14 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-lg flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[var(--foreground)] font-semibold text-lg mb-1">
                            {lesson.title}
                          </h3>
                          <p className="text-[var(--muted-foreground)] text-sm mb-3 line-clamp-2">
                            {lesson.description}
                          </p>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={getDifficultyColor(lesson.difficulty)}
                            >
                              {lesson.difficulty}
                            </Badge>

                            <div className="flex items-center gap-1 text-[var(--muted-foreground)] text-xs">
                              <Clock className="h-3 w-3" />
                              <span>Duration: {formatDuration(lesson.duration)}</span>
                            </div>

                            {lesson.category && (
                              <Badge variant="outline">
                                {lesson.category}
                              </Badge>
                            )}

                            {lesson.prerequisites && lesson.prerequisites.length > 0 && (
                              <div className="flex items-center gap-1 text-[var(--muted-foreground)] text-xs">
                                <User className="h-3 w-3" />
                                <span>Prerequisites: {lesson.prerequisites.slice(0, 2).join(', ')}</span>
                                {lesson.prerequisites.length > 2 && (
                                  <span>+{lesson.prerequisites.length - 2} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {lesson.videoUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
                            title="View lesson"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]"
                          title="Edit lesson"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[var(--theme-quinary)] hover:bg-[var(--theme-quinary)]/10 hover:text-[var(--theme-quinary)]"
                          title="Delete lesson"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {lessons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card variant="glass">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[var(--theme-primary)] mb-2">
                  {lessons.length}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Total Lessons
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[var(--theme-tertiary)] mb-2">
                  {lessons.filter(l => l.difficulty === 'beginner').length}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Beginner
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[var(--theme-secondary)] mb-2">
                  {lessons.filter(l => l.difficulty === 'intermediate').length}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Intermediate
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-[var(--theme-quaternary)] mb-2">
                  {lessons.filter(l => l.difficulty === 'advanced').length}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Advanced
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminLessonsPage;