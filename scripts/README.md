# Scripts Directory

This directory contains utility scripts for the CECOM website project.

## ⚠️ Security Warning

**This entire folder is excluded from production builds for security reasons.**

Scripts contain sensitive operations including:
- Database management
- User administration  
- System configuration
- Data migration

## Structure

```
scripts/
├── maintenance/     # Active maintenance scripts
├── archive/         # Deprecated/unused scripts
├── node_modules/    # Script dependencies
├── package.json     # Script dependencies
└── README.md        # This file
```

### Active Maintenance Scripts (`/maintenance/`)
- Database operations (markdown conversion, image cleanup)
- RSS import and management
- Translation validation
- Content management utilities

### Archived Scripts (`/archive/`)
- Legacy migration scripts
- Deprecated utilities
- One-time setup scripts
- Historical reference

## Security Measures

✅ **Build Exclusion**: Excluded from Next.js builds via webpack config
✅ **Deployment Exclusion**: Excluded from Vercel deployments via .vercelignore  
✅ **Access Control**: Requires admin privileges and environment variables
✅ **Separation**: Active vs archived scripts clearly separated

## Usage

### For Maintenance Scripts
```bash
cd scripts/maintenance
node script-name.js
```

### For SQL Scripts
Run in database management tool (Supabase SQL Editor):
```sql
\i script-name.sql
```

## Dependencies

Install script dependencies:
```bash
cd scripts
npm install
```

## Environment Requirements

Scripts require environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for read operations)