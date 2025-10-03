-- SQL Script to remove broken placeholder images from RSS-fetched blog posts
-- Run this in the Supabase SQL Editor

-- First, let's see which posts will be affected
SELECT 
  id,
  title,
  featured_image,
  slug
FROM blog_posts
WHERE title ILIKE '%SA-%'
  AND (
    featured_image LIKE '%placeholder%' 
    OR featured_image LIKE '%example.com%'
  )
ORDER BY created_at DESC;

-- Now update them to remove the broken images
UPDATE blog_posts
SET featured_image = NULL
WHERE title ILIKE '%SA-%'
  AND (
    featured_image LIKE '%placeholder%' 
    OR featured_image LIKE '%example.com%'
  );

-- Verify the update
SELECT 
  COUNT(*) as total_rss_posts,
  COUNT(featured_image) as posts_with_images,
  COUNT(*) - COUNT(featured_image) as posts_without_images
FROM blog_posts
WHERE title ILIKE '%SA-%';
