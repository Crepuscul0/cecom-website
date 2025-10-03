# Maintenance Scripts

This folder contains scripts that are actively used for system maintenance and should be run manually by administrators.

## ⚠️ Security Warning

**These scripts contain sensitive operations and should NEVER be exposed in production builds.**

- Database operations
- User management
- Data migration
- System configuration

## Contents

### Database & Content Management
- `convert-markdown-to-html.js` - Convert blog posts from markdown to HTML
- `convert-markdown-to-html.sql` - SQL script for markdown conversion
- `remove-broken-images.js` - Remove broken placeholder images
- `remove-broken-images.sql` - SQL script for image cleanup
- `rss-import.sql` - RSS import SQL operations

### RSS & Blog Management
- `rss-supabase-importer.js` - RSS to Supabase importer
- `import-extreme-rss-supabase.js` - Extreme Networks RSS importer
- `import-extreme-rss.js` - RSS import utilities

### System Maintenance
- `validate-translations.js` - Validate i18n translations
- `clean-blog-posts.js` - Clean up blog post data
- `update-products-with-images.js` - Update product images

## Usage

### Prerequisites
```bash
cd scripts/maintenance
npm install  # If needed
```

### Running Scripts
```bash
# Example: Convert markdown to HTML
node convert-markdown-to-html.js

# Example: Import RSS feeds
node import-extreme-rss-supabase.js --limit=10

# Example: Validate translations
node validate-translations.js
```

### SQL Scripts
Run these in your database management tool (Supabase SQL Editor, pgAdmin, etc.):

```sql
-- Example: Remove broken images
\i remove-broken-images.sql
```

## Security Notes

- ✅ Scripts are excluded from production builds
- ✅ Folder is ignored in deployment (.vercelignore)
- ✅ Contains sensitive database operations
- ✅ Requires admin privileges to run

## Environment Requirements

Most scripts require:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Proper database permissions

## Backup Policy

Always backup your database before running maintenance scripts:

```bash
# Example backup command
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Last Updated

$(date)