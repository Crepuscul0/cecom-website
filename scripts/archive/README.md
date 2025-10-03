# Archived Scripts

This folder contains scripts that are no longer actively used but are kept for historical reference.

## Contents

### Database Migration Scripts (Legacy)
- `migrate-to-payload.js` - Old Payload CMS migration
- `setup-payload.js` - Payload CMS setup (deprecated)
- `migrate-category-icons.js` - Category icon migration
- `process-extreme-data.js` - Data processing script

### Image Management (Legacy)
- `add-image-columns.js` - Database column additions
- `add-external-image-column.js` - External image support
- `update-images-direct.js` - Direct image updates
- `simple-update-images.js` - Simple image updater

### Scraping Scripts (Unused)
- `comprehensive-extreme-scraper.js` - Complex scraper (unused)
- `simple-extreme-scraper.js` - Simple scraper
- `scrape-extreme-aps.js` - APS scraping

### Test & Debug Scripts
- `test-payload-config.js` - Payload configuration tests
- `test-payload-collections.js` - Collection tests
- `test-blog-rendering.js` - Blog rendering tests
- `test-marked.js` - Markdown parser tests
- `test-icon-picker.js` - Icon picker tests
- `test-image-extraction.js` - Image extraction tests
- `test-complete-pipeline.js` - Full pipeline tests

### Debug Scripts (From Root)
- `debug-*.js` - Various debug scripts
- `test-*.js` - Test scripts
- `bulk-insert-products.js` - Product bulk insertion
- `import-missing-rss-posts.js` - RSS import fixes

### Utility Scripts (Legacy)
- `check-products.js` - Product validation
- `check-columns.js` - Database column checks
- `clear-extreme-products.js` - Product cleanup

## Why Archived?

These scripts were moved here because they:
- ❌ Haven't been used in recent development
- ❌ Are superseded by newer implementations
- ❌ Were one-time migration scripts
- ❌ Are debug/test scripts no longer needed
- ❌ Contain outdated approaches

## Usage

⚠️ **Warning**: These scripts may not work with the current codebase as they:
- May reference deprecated APIs
- Could have outdated dependencies
- Might use old database schemas
- May not follow current coding standards

## Recovery

If you need to use any of these scripts:
1. Review the code for compatibility
2. Update dependencies if needed
3. Test in a development environment
4. Consider rewriting with current patterns

## Cleanup Policy

Scripts are moved here when they:
- Haven't been modified in 60+ days
- Are no longer referenced in documentation
- Have been replaced by better implementations
- Are one-time use scripts that completed their purpose

## Last Updated

Archived on: $(date)