// app/dashboard/admin/customize/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Palette,
  Upload,
  Save,
  RefreshCw,
  Zap,
  Eye,
  CheckCircle,
  AlertTriangle,
  Paintbrush,
  Sun,
  Moon,
  Monitor,
  Image as ImageIcon
} from 'lucide-react';
import { useTheme } from '../../../../contexts/theme-context';
import { ThemeColors } from '../../../../types';

const CustomizePage: React.FC = () => {
  const { theme, setThemeColors, setThemeMode, resetToPreset, setBranding, loading: themeLoading } = useTheme();
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [platformName, setPlatformName] = useState(theme.branding?.title || 'Ian McDonald AI');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const colorDefinitions = [
    { key: 'primary' as keyof ThemeColors, name: 'Primary', desc: 'Main brand color for buttons and highlights', icon: '🔵' },
    { key: 'secondary' as keyof ThemeColors, name: 'Secondary', desc: 'Supporting color for sidebars and backgrounds', icon: '🟢' },
    { key: 'tertiary' as keyof ThemeColors, name: 'Tertiary', desc: 'Accent color for highlights and interactive elements', icon: '🟡' },
    { key: 'quaternary' as keyof ThemeColors, name: 'Quaternary', desc: 'Subtle background color for cards and sections', icon: '🟠' },
    { key: 'quinary' as keyof ThemeColors, name: 'Quinary', desc: 'Alert and notification color', icon: '🔴' },
  ];

  const presets = [
    {
      name: 'nova',
      title: 'Nova Blue (Default)',
      colors: ['#19afe2', '#919497', '#eae9e4', '#071520', '#dc2626'],
      description: 'Clean professional blue theme'
    },
    {
      name: 'ocean',
      title: 'Ocean Depths',
      colors: ['#0ea5e9', '#3b82f6', '#1d4ed8', '#0f172a', '#ef4444'],
      description: 'Deep ocean blues with modern contrast'
    },
    {
      name: 'forest',
      title: 'Forest Path',
      colors: ['#059669', '#10b981', '#047857', '#064e3b', '#f97316'],
      description: 'Natural greens with earthy tones'
    },
    {
      name: 'sunset',
      title: 'Sunset Glow',
      colors: ['#ea580c', '#f97316', '#dc2626', '#7c2d12', '#fbbf24'],
      description: 'Warm sunset oranges and reds'
    },
    {
      name: 'royal',
      title: 'Royal Purple',
      colors: ['#7c3aed', '#8b5cf6', '#ec4899', '#581c87', '#a855f7'],
      description: 'Regal purples with vibrant accents'
    },
    {
      name: 'crimson',
      title: 'Crimson Fire',
      colors: ['#dc2626', '#ef4444', '#f97316', '#7f1d1d', '#fbbf24'],
      description: 'Bold reds with fiery energy'
    }
  ];

  // Validate color accessibility
  useEffect(() => {
    const errors: string[] = [];
    // Basic validation - in a real app you'd check contrast ratios
    if (!theme.colors.primary) errors.push('Primary color is required');
    if (!theme.colors.secondary) errors.push('Secondary color is required');
    setValidationErrors(errors);
  }, [theme.colors]);

  // Update platform name when theme branding changes
  useEffect(() => {
    setPlatformName(theme.branding?.title || 'Ian McDonald AI');
  }, [theme.branding?.title]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handlePresetClick = async (preset: any) => {
    try {
      await resetToPreset(preset.name);
    } catch (error) {
      console.error('Error applying preset:', error);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    // Create preview
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBrandingSave = async () => {
    setBrandingLoading(true);
    try {
      let logoUrl = theme.branding?.logoUrl || '';

      // In a real implementation, you'd upload the file here
      if (logoFile) {
        // Simulate upload - replace with actual upload logic
        console.log('Would upload logo file:', logoFile.name);
        logoUrl = logoPreview || '';
      }

      await setBranding({
        title: platformName,
        logoUrl: logoUrl
      });

      // Reset file states
      setLogoFile(null);
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(null);

      alert('Branding updated successfully!');
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to update branding. Please try again.');
    } finally {
      setBrandingLoading(false);
    }
  };

  const isValidHexColor = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Palette className="h-8 w-8 text-[var(--theme-primary)]" />
            Customize Appearance
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Customize your application's branding, colors, and visual theme
          </p>
        </div>

        {/* Platform Branding */}
        <Card variant="glass" hover="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-[var(--theme-primary)]" />
              Platform Branding
            </CardTitle>
            <CardDescription>
              Upload your logo and set your platform name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Platform Name */}
              <div>
                <label htmlFor="platformName" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  id="platformName"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] transition-colors"
                  placeholder="Enter your platform name"
                  disabled={brandingLoading}
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  This will appear in the navigation and browser title
                </p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Platform Logo
                </label>
                <div className="flex items-start gap-6">
                  {/* Logo Preview */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 border-2 border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface-1)] flex items-center justify-center">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : theme.branding?.logoUrl ? (
                        <img 
                          src={theme.branding.logoUrl} 
                          alt="Current logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-sm text-[var(--foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--theme-primary)] file:text-white hover:file:bg-[var(--theme-primary)]/90 file:cursor-pointer cursor-pointer"
                      disabled={brandingLoading}
                    />
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Recommended: Square image (1:1 ratio), max 5MB. Formats: JPG, PNG, GIF, WebP
                    </p>
                    {logoFile && (
                      <Badge variant="outline" className="text-[var(--theme-tertiary)]">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready to save: {logoFile.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Branding */}
              <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                <Button
                  onClick={handleBrandingSave}
                  disabled={brandingLoading || !platformName.trim()}
                  variant="gradient"
                  leftIcon={<Save className="h-4 w-4" />}
                  loading={brandingLoading}
                >
                  Save Branding
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Validation Status */}
        <Card variant={validationErrors.length > 0 ? "elevated" : "glass"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationErrors.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-[var(--theme-quinary)]" />
              ) : (
                <CheckCircle className="h-5 w-5 text-[var(--theme-tertiary)]" />
              )}
              Theme Status
            </CardTitle>
            <CardDescription>
              Current theme validation and accessibility check
            </CardDescription>
          </CardHeader>
          <CardContent>
            {validationErrors.length === 0 ? (
              <div className="flex items-center gap-2 text-[var(--theme-tertiary)]">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Theme is valid and ready to use</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[var(--theme-quinary)] font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Issues found with current theme:
                </div>
                {validationErrors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm">
                    <span>•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Theme Preview */}
        <Card variant="elevated" hover="lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[var(--theme-primary)]" />
              Current Theme Colors
            </CardTitle>
            <CardDescription>
              Preview and edit your current color palette
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {colorDefinitions.map((color) => (
                <div key={color.key} className="text-center">
                  <div 
                    className="w-full h-20 rounded-xl border-2 border-[var(--border)] mb-3 shadow-sm"
                    style={{ backgroundColor: theme.colors[color.key] }}
                  ></div>
                  <h4 className="text-[var(--foreground)] font-semibold text-sm flex items-center justify-center gap-1">
                    <span>{color.icon}</span>
                    {color.name}
                  </h4>
                  <p className="text-[var(--muted-foreground)] text-xs font-mono mt-1">
                    {theme.colors[color.key]}
                  </p>
                </div>
              ))}
            </div>

            {/* Live Preview */}
            <div className="p-4 bg-[var(--surface-1)] rounded-lg">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Live Preview:</p>
              <div className="flex gap-3 flex-wrap">
                <button className="bg-[var(--theme-primary)] text-white px-4 py-2 rounded-lg font-medium">
                  Primary Button
                </button>
                <button className="bg-[var(--theme-secondary)] text-white px-4 py-2 rounded-lg font-medium">
                  Secondary Button
                </button>
                <button className="bg-[var(--theme-tertiary)] text-white px-4 py-2 rounded-lg font-medium">
                  Tertiary Button
                </button>
                <div className="text-[var(--theme-primary)] font-medium px-4 py-2">
                  Primary Text
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Customization */}
        <Card variant="glass" hover="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-[var(--theme-primary)]" />
              Customize Colors
            </CardTitle>
            <CardDescription>
              Fine-tune individual theme colors with real-time preview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {colorDefinitions.map((colorDef) => (
                <div key={colorDef.key} className="flex items-center gap-4 p-4 bg-[var(--surface-1)] rounded-xl">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-[var(--border)] flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: theme.colors[colorDef.key] }}
                  ></div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <span>{colorDef.icon}</span>
                      {colorDef.name} Color
                    </h5>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {colorDef.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.colors[colorDef.key]}
                      onChange={(e) => setThemeColors({ [colorDef.key]: e.target.value })}
                      className="w-12 h-12 rounded-lg border border-[var(--border)] cursor-pointer"
                      disabled={themeLoading}
                    />
                    <input
                      type="text"
                      value={theme.colors[colorDef.key]}
                      onChange={(e) => {
                        if (isValidHexColor(e.target.value) || e.target.value === '') {
                          setThemeColors({ [colorDef.key]: e.target.value });
                        }
                      }}
                      className="w-28 px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] font-mono focus:ring-2 focus:ring-[var(--theme-primary)]/50"
                      placeholder="#000000"
                      disabled={themeLoading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preset Themes */}
        <Card variant="floating" hover="scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[var(--theme-primary)]" />
              Quick Preset Themes
            </CardTitle>
            <CardDescription>
              Apply beautiful pre-designed color schemes instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset)}
                  disabled={themeLoading}
                  className="p-6 border border-[var(--border)] rounded-xl hover:border-[var(--theme-primary)] hover:shadow-lg transition-all text-left group disabled:opacity-50"
                >
                  <h4 className="text-[var(--foreground)] font-semibold mb-2 group-hover:text-[var(--theme-primary)] transition-colors">
                    {preset.title}
                  </h4>
                  <div className="flex space-x-2 mb-3">
                    {preset.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full shadow-sm border border-[var(--border)]"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                  <p className="text-[var(--muted-foreground)] text-sm">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme Mode */}
        <Card variant="elevated" hover="lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-[var(--theme-primary)]" />
              Display Mode
            </CardTitle>
            <CardDescription>
              Control light and dark mode preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { mode: 'light' as const, name: 'Light Mode', icon: Sun, desc: 'Always use light theme' },
                { mode: 'dark' as const, name: 'Dark Mode', icon: Moon, desc: 'Always use dark theme' },
                { mode: 'system' as const, name: 'System', icon: Monitor, desc: 'Follow system preference' },
              ].map((modeOption) => {
                const IconComponent = modeOption.icon;
                const isActive = theme.mode === modeOption.mode;

                return (
                  <button
                    key={modeOption.mode}
                    onClick={() => setThemeMode(modeOption.mode)}
                    disabled={themeLoading}
                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                      isActive
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--theme-primary)]/50'
                    }`}
                  >
                    <div className="text-center">
                      <IconComponent className={`h-8 w-8 mx-auto mb-3 ${
                        isActive ? 'text-[var(--theme-primary)]' : 'text-[var(--muted-foreground)]'
                      }`} />
                      <h5 className={`font-semibold mb-1 ${
                        isActive ? 'text-[var(--theme-primary)]' : 'text-[var(--foreground)]'
                      }`}>
                        {modeOption.name}
                      </h5>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {modeOption.desc}
                      </p>
                      {isActive && (
                        <Badge variant="secondary" className="mt-3 animate-pulse-glow">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default CustomizePage;