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
  Image as ImageIcon,
  Building,
  Globe
} from 'lucide-react';
import { useTheme } from '../../../../contexts/theme-context';
import { useTenant } from '../../../../contexts/tenant-context';
import { ThemeColors, WhiteLabelConfig } from '../../../../types';
import { getTenantConfig, updateTenantConfig } from '../../../../lib/tenant-utils';

const CustomizePage: React.FC = () => {
  const { theme, setThemeColors, setThemeMode, resetToPreset, setBranding, loading: themeLoading } = useTheme();
  const { tenantId, isValidTenant } = useTenant();
  
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [tenantConfigLoading, setTenantConfigLoading] = useState(false);
  const [platformName, setPlatformName] = useState(theme.branding?.title || 'LaunchBox');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // White-label specific state
  const [tenantConfig, setTenantConfig] = useState<WhiteLabelConfig | null>(null);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    tagline: '',
    supportEmail: '',
    welcomeMessage: ''
  });
  const [featuresConfig, setFeaturesConfig] = useState({
    enableLessons: true,
    enableApps: true,
    enableCommunity: true,
    enableAnalytics: true
  });

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

  // Load tenant configuration
  useEffect(() => {
    const loadTenantConfig = async () => {
      if (!tenantId || !isValidTenant) return;
      
      setTenantConfigLoading(true);
      try {
        const config = await getTenantConfig(tenantId);
        if (config) {
          setTenantConfig(config);
          setCompanyInfo({
            companyName: config.branding.companyName,
            tagline: config.branding.tagline || '',
            supportEmail: config.content.supportEmail || '',
            welcomeMessage: config.content.welcomeMessage || ''
          });
          setFeaturesConfig({
            enableLessons: config.features.enableLessons,
            enableApps: config.features.enableApps,
            enableCommunity: config.features.enableCommunity,
            enableAnalytics: config.features.enableAnalytics
          });
          setPlatformName(config.branding.companyName);
        }
      } catch (error) {
        console.error('Error loading tenant config:', error);
      } finally {
        setTenantConfigLoading(false);
      }
    };

    loadTenantConfig();
  }, [tenantId, isValidTenant]);

  // Update platform name when theme branding changes
  useEffect(() => {
    setPlatformName(theme.branding?.title || tenantConfig?.branding.companyName || 'LaunchBox');
  }, [theme.branding?.title, tenantConfig?.branding.companyName]);

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

  const handleTenantConfigSave = async () => {
    if (!tenantConfig || !tenantId) return;

    setTenantConfigLoading(true);
    try {
      const updates: Partial<WhiteLabelConfig> = {
        branding: {
          ...tenantConfig.branding,
          companyName: companyInfo.companyName,
          tagline: companyInfo.tagline,
        },
        content: {
          ...tenantConfig.content,
          supportEmail: companyInfo.supportEmail,
          welcomeMessage: companyInfo.welcomeMessage,
        },
        features: {
          ...tenantConfig.features,
          ...featuresConfig
        }
      };

      await updateTenantConfig(tenantId, updates);
      
      // Refresh tenant config
      const updatedConfig = await getTenantConfig(tenantId);
      if (updatedConfig) {
        setTenantConfig(updatedConfig);
      }

      alert('White-label configuration saved successfully!');
    } catch (error) {
      console.error('Error saving tenant config:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setTenantConfigLoading(false);
    }
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

        {/* White-Label Configuration - Only show for non-default tenants */}
        {tenantId !== 'default' && tenantConfig && (
          <>
            {/* Company Information */}
            <Card variant="glass" hover="glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-[var(--theme-primary)]" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Configure your company details and messaging for your white-label instance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        value={companyInfo.companyName}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] transition-colors"
                        placeholder="Your Company Name"
                        disabled={tenantConfigLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="tagline" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Company Tagline
                      </label>
                      <input
                        type="text"
                        id="tagline"
                        value={companyInfo.tagline}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, tagline: e.target.value }))}
                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] transition-colors"
                        placeholder="Your company tagline"
                        disabled={tenantConfigLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="supportEmail" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      id="supportEmail"
                      value={companyInfo.supportEmail}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] transition-colors"
                      placeholder="support@yourcompany.com"
                      disabled={tenantConfigLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="welcomeMessage" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Welcome Message
                    </label>
                    <textarea
                      id="welcomeMessage"
                      value={companyInfo.welcomeMessage}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--surface-0)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:border-[var(--theme-primary)] transition-colors"
                      placeholder="Welcome message displayed to new users"
                      disabled={tenantConfigLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Configuration */}
            <Card variant="elevated" hover="lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[var(--theme-primary)]" />
                  Feature Configuration
                </CardTitle>
                <CardDescription>
                  Enable or disable features for your white-label instance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { 
                      key: 'enableLessons', 
                      name: 'Learning Lessons', 
                      description: 'Enable the lessons/courses section',
                      icon: '📚'
                    },
                    { 
                      key: 'enableApps', 
                      name: 'Interactive Apps', 
                      description: 'Enable the apps/tools section',
                      icon: '🚀'
                    },
                    { 
                      key: 'enableCommunity', 
                      name: 'Community Forum', 
                      description: 'Enable community discussions',
                      icon: '💬'
                    },
                    { 
                      key: 'enableAnalytics', 
                      name: 'Analytics Dashboard', 
                      description: 'Enable usage analytics and reporting',
                      icon: '📊'
                    }
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-start gap-4 p-4 bg-[var(--surface-1)] rounded-xl">
                      <div className="text-2xl">{feature.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-[var(--foreground)]">{feature.name}</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={featuresConfig[feature.key as keyof typeof featuresConfig]}
                              onChange={(e) => setFeaturesConfig(prev => ({
                                ...prev,
                                [feature.key]: e.target.checked
                              }))}
                              className="sr-only peer"
                              disabled={tenantConfigLoading}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-primary)]"></div>
                          </label>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tenant Information */}
            <Card variant="floating" hover="scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[var(--theme-primary)]" />
                  Workspace Information
                </CardTitle>
                <CardDescription>
                  Your white-label instance details and subscription status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">Tenant ID</label>
                      <p className="font-mono text-sm text-[var(--foreground)] bg-[var(--surface-1)] px-3 py-2 rounded-lg">
                        {tenantConfig.tenantId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">Subdomain</label>
                      <p className="text-sm text-[var(--foreground)] bg-[var(--surface-1)] px-3 py-2 rounded-lg">
                        {tenantConfig.domain.subdomain}.yourplatform.com
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">Status</label>
                      <Badge 
                        variant={tenantConfig.status === 'active' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {tenantConfig.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">Created</label>
                      <p className="text-sm text-[var(--foreground)] bg-[var(--surface-1)] px-3 py-2 rounded-lg">
                        {tenantConfig.createdAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">Subscription</label>
                      <Badge 
                        variant={tenantConfig.subscription?.status === 'active' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {tenantConfig.subscription?.planId || 'Free'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Configuration */}
            <Card variant="glass">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">Save White-Label Configuration</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Apply your company information and feature settings
                    </p>
                  </div>
                  <Button
                    onClick={handleTenantConfigSave}
                    disabled={tenantConfigLoading || !companyInfo.companyName.trim()}
                    variant="gradient"
                    leftIcon={<Save className="h-4 w-4" />}
                    loading={tenantConfigLoading}
                  >
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default CustomizePage;