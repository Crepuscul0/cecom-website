-- CECOM Website Storage Setup
-- This migration sets up storage buckets and policies for the CECOM website

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('media', 'media', true, 52428800, '{"image/*","application/pdf"}'),
  ('documents', 'documents', true, 52428800, '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}'),
  ('logos', 'logos', true, 10485760, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public Access - Media" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Public Access - Documents" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Public Access - Logos" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

-- Create policies for authenticated users to upload
CREATE POLICY "Authenticated Upload - Media" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Upload - Documents" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Upload - Logos" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Create policies for users to update their own files
CREATE POLICY "Owner Update - Media" ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media' AND auth.uid()::text = owner);

CREATE POLICY "Owner Update - Documents" ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = owner);

CREATE POLICY "Owner Update - Logos" ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos' AND auth.uid()::text = owner);

-- Create policies for users to delete their own files
CREATE POLICY "Owner Delete - Media" ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND auth.uid()::text = owner);

CREATE POLICY "Owner Delete - Documents" ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = owner);

CREATE POLICY "Owner Delete - Logos" ON storage.objects 
FOR DELETE 
USING (bucket_id = 'logos' AND auth.uid()::text = owner);

-- Create a function to get public URL for storage objects
CREATE OR REPLACE FUNCTION get_public_url(bucket_name text, object_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN format('https://%s.supabase.co/storage/v1/object/public/%s/%s', 
    current_setting('app.settings.project_ref', true), 
    bucket_name, 
    object_path);
END;
$$;