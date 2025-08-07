import { supabase, supabaseAdmin } from './client'
import { 
  StorageBucket, 
  validateFile, 
  generateFilePath,
  STORAGE_BUCKETS 
} from './storage-config'

export interface UploadResult {
  path: string
  publicUrl: string
  fullPath: string
}

export const uploadFile = async (
  file: File, 
  bucket: StorageBucket, 
  folder?: string
): Promise<UploadResult> => {
  // Validate file
  const validation = validateFile(file, bucket)
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  // Generate unique file path
  const filePath = generateFilePath(file.name, folder)
  
  // Upload file
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  
  // Get public URL
  const publicUrl = getPublicUrl(bucket, data.path)
  
  return {
    path: data.path,
    publicUrl,
    fullPath: data.fullPath,
  }
}

export const getPublicUrl = (bucket: StorageBucket, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

export const deleteFile = async (bucket: StorageBucket, path: string) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
  return data
}

export const listFiles = async (bucket: StorageBucket, folder?: string) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(folder, {
      sortBy: { column: 'created_at', order: 'desc' }
    })
  
  if (error) throw error
  return data
}

// Helper functions for specific buckets
export const uploadLogo = (file: File) => 
  uploadFile(file, STORAGE_BUCKETS.LOGOS, 'vendor-logos')

export const uploadProductImage = (file: File) => 
  uploadFile(file, STORAGE_BUCKETS.MEDIA, 'products')

export const uploadDocument = (file: File) => 
  uploadFile(file, STORAGE_BUCKETS.DOCUMENTS, 'datasheets')

export const uploadMediaFile = (file: File, folder?: string) => 
  uploadFile(file, STORAGE_BUCKETS.MEDIA, folder)