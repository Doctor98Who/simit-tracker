import { supabase } from '../lib/supabase';

export class StorageService {
  /**
   * Upload an image to Supabase Storage
   * @param bucket - The storage bucket name ('avatars', 'covers', 'progress')
   * @param path - The file path (e.g., 'user-id/timestamp.jpg')
   * @param file - The file blob or base64 string
   * @returns The public URL of the uploaded file
   */
  static async uploadImage(bucket: string, path: string, file: Blob | string): Promise<string> {
    try {
      let fileBlob: Blob;
      
      // Convert base64 to blob if needed
      if (typeof file === 'string' && file.startsWith('data:')) {
        const response = await fetch(file);
        fileBlob = await response.blob();
      } else if (file instanceof Blob) {
        fileBlob = file;
      } else {
        throw new Error('Invalid file format');
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, fileBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param bucket - The storage bucket name
   * @param path - The file path
   */
  static async deleteImage(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Generate a unique file path
   * @param userId - The user's ID
   * @param type - The type of image ('avatar', 'cover', 'progress')
   * @returns A unique file path
   */
  static generateFilePath(userId: string, type: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    return `${userId}/${type}-${timestamp}-${randomString}.jpg`;
  }

  /**
   * Extract the file path from a Supabase Storage URL
   * @param url - The public URL
   * @param bucket - The bucket name
   * @returns The file path or null
   */
  static getFilePathFromUrl(url: string, bucket: string): string | null {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
      return pathParts[1] || null;
    } catch {
      return null;
    }
  }
}