-- This SQL script should be run directly in the Supabase SQL Editor
-- It will help identify which blog posts need markdown-to-HTML conversion

-- First, let's see which posts have markdown syntax
SELECT 
  id,
  title,
  CASE 
    WHEN content ~ '^#{1,6}\s' OR content ~ '^\*\*' OR content ~ '\[.*\]\(.*\)' THEN 'Has Markdown'
    WHEN content ~ '<h[1-6]>|<p>|<ul>|<ol>|<li>|<strong>|<em>|<a\s' THEN 'Has HTML'
    ELSE 'Plain Text'
  END as content_type,
  LENGTH(content) as content_length,
  LEFT(content, 100) as content_preview
FROM blog_posts
ORDER BY created_at DESC;

-- Note: The actual markdown-to-HTML conversion needs to be done using a tool like 'marked' in Node.js
-- This is because PostgreSQL doesn't have built-in markdown parsing capabilities
-- 
-- To convert the posts, you have two options:
-- 1. Run the Node.js script: node scripts/convert-markdown-to-html.js (requires service role key)
-- 2. Use the API endpoint: POST /api/admin/convert-markdown (requires authentication)
-- 3. Manually update each post through the admin panel
