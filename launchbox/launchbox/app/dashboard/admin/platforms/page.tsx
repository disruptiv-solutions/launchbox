// app/admin/platforms/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Globe,
  Plus,
  Save,
  Trash2,
  Star,
  Zap,
  BarChart3
} from 'lucide-react';
import { 
  createPlatform, 
  getPlatforms, 
  deletePlatform
} from '../../../../lib/admin';
import { Platform } from '../../../../types';

interface PlatformForm {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  technologies: string[];
}

const PlatformsPage = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [platformForm, setPlatformForm] = useState<PlatformForm>({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    category: '',
    featured: false,
    technologies: [],
  });

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    setLoading(true);
    try {
      // Add empty object parameter if getPlatforms expects arguments
      const platformsData = await getPlatforms({});
      setPlatforms(platformsData);
    } catch (error) {
      console.error('Error loading platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Pass all 8 required arguments including the missing one (likely order/priority)
      await createPlatform(
        platformForm.title,
        platformForm.description,
        platformForm.url,
        platformForm.imageUrl,
        platformForm.category,
        platformForm.featured,
        platformForm.technologies,
        0 // Add default order/priority as 8th parameter
      );

      setShowAddForm(false);
      setPlatformForm({
        title: '',
        description: '',
        url: '',
        imageUrl: '',
        category: '',
        featured: false,
        technologies: [],
      });

      await loadPlatforms();
    } catch (error) {
      console.error('Error adding platform:', error);
      alert('Error adding platform. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlatform = async (platformId: string) => {
    if (confirm('Are you sure you want to delete this platform?')) {
      try {
        await deletePlatform(platformId);
        await loadPlatforms();
      } catch (error) {
        console.error('Error deleting platform:', error);
        alert('Error deleting platform. Please try again.');
      }
    }
  };

  // Helper function to get unique categories (ES5 compatible)
  const getUniqueCategories = (platforms: Platform[]): string[] => {
    const categories: string[] = [];
    platforms.forEach(platform => {
      if (categories.indexOf(platform.category) === -1) {
        categories.push(platform.category);
      }
    });
    return categories;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Globe className="h-8 w-8 text-[var(--theme-primary)]" />
            Platform Management
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Create and manage platform integrations for your ecosystem
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          variant="gradient"
          leftIcon={<Plus className="h-4 w-4" />}
          className="shadow-glow"
        >
          Add Platform
        </Button>
      </div>

      {/* Add Platform Form */}
      {showAddForm && (
        <Card variant="glass" className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[var(--theme-primary)]" />
              Add New Platform
            </CardTitle>
            <CardDescription>Create a new platform integration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPlatform} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={platformForm.title}
                    onChange={(e) => setPlatformForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)]"
                    required
                    placeholder="Platform name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={platformForm.category}
                    onChange={(e) => setPlatformForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)]"
                    required
                    placeholder="e.g., Development, AI, Analytics"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Description
                </label>
                <textarea
                  value={platformForm.description}
                  onChange={(e) => setPlatformForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] resize-none"
                  required
                  placeholder="Describe what this platform does and how it helps users..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={platformForm.url}
                    onChange={(e) => setPlatformForm(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)]"
                    required
                    placeholder="https://platform-url.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={platformForm.imageUrl}
                    onChange={(e) => setPlatformForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={platformForm.technologies.join(', ')}
                  onChange={(e) => setPlatformForm(prev => ({ 
                    ...prev, 
                    technologies: e.target.value.split(',').map(tech => tech.trim()).filter(Boolean)
                  }))}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)]"
                  placeholder="React, Node.js, TypeScript, AI, Machine Learning"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Separate multiple technologies with commas
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={platformForm.featured}
                  onChange={(e) => setPlatformForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-[var(--theme-primary)] bg-[var(--surface-0)] border-[var(--border)] rounded focus:ring-[var(--theme-primary)] focus:ring-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-[var(--foreground)]">
                  Featured Platform
                </label>
                <Badge variant="secondary" className="ml-2">
                  <Star className="h-3 w-3 mr-1" />
                  Highlighted
                </Badge>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  type="submit"
                  variant="gradient"
                  leftIcon={<Save className="h-4 w-4" />}
                  loading={loading}
                >
                  Add Platform
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Platforms List */}
      <Card variant="elevated" hover="lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[var(--theme-primary)]" />
            Existing Platforms ({platforms.length})
          </CardTitle>
          <CardDescription>Manage your platform integrations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-[var(--surface-2)] rounded"></div>
                ))}
              </div>
            </div>
          ) : platforms.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
              <p className="text-[var(--muted-foreground)] text-lg font-medium">
                No platforms yet
              </p>
              <p className="text-[var(--muted-foreground)] text-sm">
                Add your first platform integration to get started!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {platforms.map((platform) => (
                <div 
                  key={platform.id} 
                  className="p-6 hover:bg-[var(--surface-1)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {platform.imageUrl && (
                          <img
                            src={platform.imageUrl}
                            alt={platform.title}
                            className="w-12 h-12 rounded-lg object-cover border border-[var(--border)]"
                          />
                        )}
                        <div>
                          <h5 className="font-semibold text-[var(--foreground)] text-lg">
                            {platform.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            {platform.featured && (
                              <Badge variant="secondary" className="animate-pulse-glow">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {platform.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-[var(--muted-foreground)] mb-3">
                        {platform.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <a 
                          href={platform.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[var(--theme-primary)] hover:underline font-medium flex items-center gap-1 transition-colors"
                        >
                          View Platform 
                          <Zap className="h-3 w-3" />
                        </a>
                        {platform.technologies && platform.technologies.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--muted-foreground)] text-xs">
                              Technologies:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {platform.technologies.slice(0, 3).map((tech, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {platform.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{platform.technologies.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]"
                        title="Edit platform"
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeletePlatform(platform.id)}
                        variant="ghost"
                        size="icon"
                        className="text-[var(--theme-quinary)] hover:bg-[var(--theme-quinary)]/10 hover:text-[var(--theme-quinary)]"
                        title="Delete platform"
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
      {platforms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[var(--theme-primary)] mb-2">
                {platforms.length}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                Total Platforms
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[var(--theme-secondary)] mb-2">
                {platforms.filter(p => p.featured).length}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                Featured Platforms
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[var(--theme-tertiary)] mb-2">
                {getUniqueCategories(platforms).length}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                Unique Categories
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PlatformsPage;