import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase-config';

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadProgress {
  progress: number;
  isComplete: boolean;
  error?: string;
}

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file type for images
    if (path.includes('avatars') && !file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed for avatars');
    }

    const storageRef = ref(storage, path);

    if (onProgress) {
      onProgress({ progress: 0, isComplete: false });
    }

    const snapshot = await uploadBytes(storageRef, file);

    if (onProgress) {
      onProgress({ progress: 100, isComplete: false });
    }

    const downloadURL = await getDownloadURL(snapshot.ref);

    if (onProgress) {
      onProgress({ progress: 100, isComplete: true });
    }

    return {
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    if (onProgress) {
      onProgress({ progress: 0, isComplete: false, error: errorMessage });
    }
    throw new Error(errorMessage);
  }
};

/**
 * Upload user avatar image
 */
export const uploadAvatar = async (
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const fileExtension = file.name.split('.').pop();
  const path = `avatars/${userId}.${fileExtension}`;

  return uploadFile(file, path, onProgress);
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Delete user avatar
 */
export const deleteAvatar = async (userId: string): Promise<void> => {
  // Try common image extensions
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  for (const ext of extensions) {
    try {
      await deleteFile(`avatars/${userId}.${ext}`);
      break; // If successful, stop trying other extensions
    } catch (error) {
      // Continue to next extension if file doesn't exist
      continue;
    }
  }
};

/**
 * Generate a safe filename
 */
export const generateSafeFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const cleanName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');

  return `${timestamp}_${cleanName}`;
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image must be less than 5MB' };
  }

  // Check for common image formats
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Supported formats: JPEG, PNG, GIF, WebP' };
  }

  return { isValid: true };
};