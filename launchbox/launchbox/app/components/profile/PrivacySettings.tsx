'use client';

import { useState } from 'react';
import { PrivacySettings as PrivacySettingsType } from '@/types';

interface PrivacySettingsProps {
  settings: PrivacySettingsType;
  onUpdate: (settings: PrivacySettingsType) => Promise<void>;
  isLoading?: boolean;
}

export default function PrivacySettings({ 
  settings, 
  onUpdate, 
  isLoading = false 
}: PrivacySettingsProps) {
  const [localSettings, setLocalSettings] = useState<PrivacySettingsType>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleToggle = (key: keyof PrivacySettingsType) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(localSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      // Revert to server state on error
      setLocalSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalSettings(settings);
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold theme-text-primary">Privacy Settings</h3>
          <p className="text-sm theme-text-secondary mt-1">
            Control what information is visible when your profile is public
          </p>
        </div>

        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="px-3 py-1 text-sm theme-border-primary border rounded-md theme-text-primary hover:theme-bg-quaternary transition-colors"
        >
          {previewMode ? 'Hide Preview' : 'Preview Public Profile'}
        </button>
      </div>

      <div className="theme-bg-quinary rounded-lg p-6 space-y-4">
        {/* Make Profile Public Toggle */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id="isPublic"
              type="checkbox"
              checked={localSettings.isPublic}
              onChange={() => handleToggle('isPublic')}
              disabled={isLoading || isSaving}
              className="h-4 w-4 theme-primary focus:ring-2 focus:ring-offset-2 rounded border-gray-300"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="isPublic" className="font-medium theme-text-primary">
              Make Profile Public
            </label>
            <p className="text-sm theme-text-secondary mt-1">
              Allow other users to view your profile at /profile/your-id. 
              When disabled, your profile is only visible to you and admins.
            </p>
          </div>
        </div>

        {/* Conditional Privacy Controls - Only show if profile is public */}
        {localSettings.isPublic && (
          <div className="space-y-4 pl-7 border-l-2 theme-border-secondary">
            <p className="text-sm font-medium theme-text-primary">
              Choose what to show on your public profile:
            </p>

            {/* Show Bio Toggle */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="showBio"
                  type="checkbox"
                  checked={localSettings.showBio}
                  onChange={() => handleToggle('showBio')}
                  disabled={isLoading || isSaving}
                  className="h-4 w-4 theme-primary focus:ring-2 focus:ring-offset-2 rounded border-gray-300"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="showBio" className="font-medium theme-text-primary">
                  Show Bio & Personal Information
                </label>
                <p className="text-sm theme-text-secondary mt-1">
                  Display your bio, skills, interests, and social links
                </p>
              </div>
            </div>

            {/* Show Stats Toggle */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="showStats"
                  type="checkbox"
                  checked={localSettings.showStats}
                  onChange={() => handleToggle('showStats')}
                  disabled={isLoading || isSaving}
                  className="h-4 w-4 theme-primary focus:ring-2 focus:ring-offset-2 rounded border-gray-300"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="showStats" className="font-medium theme-text-primary">
                  Show Learning Statistics
                </label>
                <p className="text-sm theme-text-secondary mt-1">
                  Display lessons completed, community posts, and achievement metrics
                </p>
              </div>
            </div>

            {/* Show Activity Toggle */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="showActivity"
                  type="checkbox"
                  checked={localSettings.showActivity}
                  onChange={() => handleToggle('showActivity')}
                  disabled={isLoading || isSaving}
                  className="h-4 w-4 theme-primary focus:ring-2 focus:ring-offset-2 rounded border-gray-300"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="showActivity" className="font-medium theme-text-primary">
                  Show Recent Activity
                </label>
                <p className="text-sm theme-text-secondary mt-1">
                  Display your recent lessons, posts, and platform activity
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="theme-bg-quaternary rounded-md p-4">
          <div className="flex items-start space-x-3">
            <div className="text-amber-500">⚠️</div>
            <div className="text-sm theme-text-secondary">
              <p className="font-medium theme-text-primary mb-1">Privacy Notice</p>
              <ul className="space-y-1 text-xs">
                <li>• Your display name and member since date are always visible on public profiles</li>
                <li>• You can change these settings at any time</li>
                <li>• Admins can always view your profile for moderation purposes</li>
                <li>• Your email address is never shown publicly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel Actions */}
      {hasChanges && (
        <div className="flex items-center justify-end space-x-3 pt-4 border-t theme-border-secondary">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm theme-text-secondary hover:theme-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm theme-primary text-white rounded-md hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            <span>{isSaving ? 'Saving...' : 'Save Privacy Settings'}</span>
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg-quinary rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold theme-text-primary">
                  Public Profile Preview
                </h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="theme-text-secondary hover:theme-text-primary text-xl"
                >
                  ×
                </button>
              </div>

              <div className="theme-border-secondary border rounded-lg p-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 theme-bg-secondary rounded-full mx-auto flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <h4 className="font-semibold theme-text-primary">Your Display Name</h4>
                  <p className="text-sm theme-text-secondary">Member since: Your join date</p>
                </div>

                <div className="mt-6 space-y-4">
                  {localSettings.showBio && (
                    <div>
                      <h5 className="font-medium theme-text-primary mb-2">Bio & Information</h5>
                      <div className="theme-bg-quaternary rounded p-3 text-sm theme-text-secondary">
                        Your bio, skills, interests, and social links will appear here
                      </div>
                    </div>
                  )}

                  {localSettings.showStats && (
                    <div>
                      <h5 className="font-medium theme-text-primary mb-2">Learning Statistics</h5>
                      <div className="theme-bg-quaternary rounded p-3 text-sm theme-text-secondary">
                        Lessons completed, community posts, achievements will appear here
                      </div>
                    </div>
                  )}

                  {localSettings.showActivity && (
                    <div>
                      <h5 className="font-medium theme-text-primary mb-2">Recent Activity</h5>
                      <div className="theme-bg-quaternary rounded p-3 text-sm theme-text-secondary">
                        Your recent lessons, posts, and activity will appear here
                      </div>
                    </div>
                  )}

                  {!localSettings.isPublic && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="theme-text-secondary">Profile is set to private</p>
                      <p className="text-sm theme-text-secondary mt-1">
                        Enable &ldquo;Make Profile Public&rdquo; to allow others to view your profile
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}