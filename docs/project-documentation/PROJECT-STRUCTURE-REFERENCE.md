# Project Structure Quick Reference

## 🗂️ **Organized Folder Structure**

```
cecom-website/
├── 📁 src/                    # Application code
│   ├── app/                   # Next.js app router
│   ├── components/            # React components
│   ├── lib/                   # Utilities & libraries
│   └── utils/                 # Helper functions
│
├── 📁 public/                 # Static assets
│   ├── images/                # Images & media
│   └── icons/                 # Icons & favicons
│
├── 📁 docs/ 🔒               # Documentation (excluded from builds)
│   ├── project-documentation/ # All project docs (42 files)
│   └── content-templates/     # Content templates
│
├── 📁 scripts/ 🔒            # Admin scripts (excluded from builds)
│   ├── maintenance/           # Active scripts (11 files)
│   └── archive/              # Deprecated scripts (61 files)
│
├── 📁 automation/ 🔒         # Cron jobs (excluded from builds)
├── 📁 data/ 🔒              # App data (excluded from builds)
├── 📁 messages/              # i18n translations
├── 📁 logs/ 🔒              # Log files (excluded from builds)
├── 📁 supabase/              # Database migrations
│
└── 📄 Config Files (20)      # Essential project configuration
    ├── package.json          # Dependencies
    ├── next.config.mjs       # Next.js config
    ├── tailwind.config.ts    # Styling config
    ├── .gitignore           # Git exclusions
    ├── .vercelignore        # Deployment exclusions
    └── ...other configs
```

## 🔒 **Security Zones**

| **Zone** | **Access** | **Build** | **Deploy** | **Purpose** |
|----------|------------|-----------|------------|-------------|
| `src/` | ✅ Public | ✅ Included | ✅ Deployed | Application code |
| `public/` | ✅ Public | ✅ Included | ✅ Deployed | Static assets |
| `messages/` | ✅ Public | ✅ Included | ✅ Deployed | Translations |
| `docs/` | 🔒 Admin | ❌ Excluded | ❌ Excluded | Documentation |
| `scripts/` | 🔒 Admin | ❌ Excluded | ❌ Excluded | Admin tools |
| `automation/` | 🔒 Admin | ❌ Excluded | ❌ Excluded | Cron jobs |
| `data/` | 🔒 Admin | ❌ Excluded | ❌ Excluded | App data |
| `logs/` | 🔒 Admin | ❌ Excluded | ❌ Excluded | Log files |

## 📚 **Documentation Locations**

| **Topic** | **Location** | **Files** |
|-----------|--------------|-----------|
| **Setup Guides** | `docs/project-documentation/` | CECOM-CMS-SETUP.md, QUICK-SETUP-GUIDE.md |
| **Blog System** | `docs/project-documentation/` | BLOG-*.md (6 files) |
| **Admin Panel** | `docs/project-documentation/` | ADMIN-*.md (3 files) |
| **Security** | `docs/project-documentation/` | SCRIPTS-SECURITY-CLEANUP.md |
| **Organization** | `docs/project-documentation/` | PROJECT-ORGANIZATION-SUMMARY.md |
| **Email & SEO** | `docs/project-documentation/` | EMAIL-SYSTEM-SETUP.md, SEO-*.md |

## 🛠️ **Script Locations**

| **Type** | **Location** | **Count** | **Usage** |
|----------|--------------|-----------|-----------|
| **Active Admin** | `scripts/maintenance/` | 11 | `cd scripts/maintenance && node script.js` |
| **SQL Scripts** | `scripts/maintenance/` | 3 | Run in Supabase SQL Editor |
| **Archived** | `scripts/archive/` | 61+ | Historical reference only |

## 🚀 **Quick Commands**

### **Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting
```

### **Maintenance Scripts**
```bash
cd scripts/maintenance
node convert-markdown-to-html.js     # Convert blog markdown
node remove-broken-images.js         # Clean broken images
node validate-translations.js        # Check i18n files
```

### **Documentation**
```bash
ls docs/project-documentation/       # List all docs
cat docs/project-documentation/README.md  # Documentation index
```

## 🔍 **Finding Things**

| **Looking for...** | **Check here** |
|-------------------|----------------|
| **Setup instructions** | `docs/project-documentation/CECOM-CMS-SETUP.md` |
| **Blog issues** | `docs/project-documentation/BLOG-*.md` |
| **Admin problems** | `docs/project-documentation/ADMIN-*.md` |
| **Database scripts** | `scripts/maintenance/*.sql` |
| **Content cleanup** | `scripts/maintenance/clean-*.js` |
| **Translation issues** | `scripts/maintenance/validate-translations.js` |
| **Security info** | `docs/project-documentation/SCRIPTS-SECURITY-CLEANUP.md` |

## ⚠️ **Important Notes**

- 🔒 **Scripts folder** is excluded from builds for security
- 📚 **Documentation** is excluded from deployments  
- 🛡️ **Admin tools** require environment variables
- 📁 **Root directory** contains only essential config files
- 🚀 **Production builds** are optimized and secure

---

**Quick Reference Updated:** $(date)