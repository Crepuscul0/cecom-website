import { supabaseAdmin } from '../supabase/client'
import { generateFilePath, validateFile, STORAGE_BUCKETS } from '../supabase/storage-config'
import type { UploadedFile } from 'payload'

export interface SupabaseUploadOptions {
  bucket: string
  folder?: string
}

export class SupabaseUploadAdapter {
  private bucket: string
  private folder?: string

  constructor(options: SupabaseUploadOptions) {
    this.bucket = options.bucket
    this.folder = options.folder
  }

  async upload(file: File): Promise<UploadedFile> {
    try {
      // Validate file
      const validation = validateFile(file, this.bucket as any)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Generate file path
      const filePath = generateFilePath(file.name, this.folder)

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(this.bucket)
        .getPublicUrl(filePath)

      return {
        filename: file.name,
        filesize: file.size,
        width: undefined, // Will be populated by Payload for images
        height: undefined, // Will be populated by Payload for images
        mimeType: file.type,
        url: urlData.publicUrl,
        sizes: {}, // Will be populated by Payload for image sizes
      }
    } catch (error) {
      console.error('Supabase upload error:', error)
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async delete(filename: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(this.bucket)
        .remove([filename])

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Supabase delete error:', error)
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getURL(filename: string): string {
    const { data } = supabaseAdmin.storage
      .from(this.bucket)
      .getPublicUrl(filename)
    
    return data.publicUrl
  }
}

// Factory function to create upload adapter
export const createSupabaseUploadAdapter = (options: SupabaseUploadOptions) => {
  return new SupabaseUploadAdapter(options)
}