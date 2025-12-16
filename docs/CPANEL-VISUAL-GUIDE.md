# 📸 cPanel Deployment Visual Guide

Step-by-step visual instructions for deploying to cPanel.

---

## 🎯 Overview

```
┌─────────────────┐
│  Your Computer  │
│                 │
│  1. Build App   │
│  2. Create ZIP  │
└────────┬────────┘
         │
         │ Upload ZIP
         ▼
┌─────────────────┐
│     cPanel      │
│                 │
│  3. Extract     │
│  4. Setup App   │
│  5. Install     │
│  6. Start       │
└────────┬────────┘
         │
         │ Serve
         ▼
┌─────────────────┐
│   Your Domain   │
│  cecom.do       │
└─────────────────┘
```

---

## 📋 Step 1: Build Locally

### Terminal Commands:
```bash
cd /path/to/cecom-website
./scripts/prepare-cpanel-deploy.sh
```

### What Happens:
```
✓ Cleaning previous builds
✓ Installing dependencies
✓ Building application
✓ Creating deployment package
✓ Generating ZIP file

Output: cpanel-deploy-YYYYMMDD-HHMMSS.zip
```

---

## 📤 Step 2: Upload to cPanel

### cPanel File Manager Path:
```
cPanel Dashboard
    └── Files
        └── File Manager
            └── public_html/  (or your domain folder)
```

### Actions:
1. Click **Upload** button
2. Select `cpanel-deploy-XXXXXXXX.zip`
3. Wait for upload to complete
4. Right-click ZIP → **Extract**
5. Delete ZIP file after extraction

### Expected Structure:
```
public_html/
├── .next/
│   ├── server/
│   ├── static/
│   └── standalone/
├── public/
│   ├── logos/
│   ├── products/
│   └── background.jpg
├── messages/
│   ├── en.json
│   └── es.json
├── server.js
├── package.json
├── next.config.mjs
├── .htaccess
└── [other config files]
```

---

## 🔐 Step 3: Create Environment File

### In File Manager:
1. Click **+ File** button
2. Name: `.env.local`
3. Right-click → **Edit**
4. Paste your production values

### Template:
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# PayloadCMS
PAYLOAD_SECRET="your-32-char-secret-key-here"

# App
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://cecom.do"
```

### ⚠️ Security:
- Never commit this file to Git
- Keep a secure backup
- Use strong secrets

---

## ⚙️ Step 4: Setup Node.js Application

### Navigate to:
```
cPanel Dashboard
    └── Software
        └── Setup Node.js App
            └── CREATE APPLICATION
```

### Configuration Form:

```
┌─────────────────────────────────────────┐
│  Create Node.js Application             │
├─────────────────────────────────────────┤
│                                         │
│  Node.js version:                       │
│  [v] 18.19.0  [ ] 20.11.0  [ ] 22.0.0  │
│                                         │
│  Application mode:                      │
│  ( ) Development  (•) Production        │
│                                         │
│  Application root:                      │
│  /home/username/public_html             │
│                                         │
│  Application URL:                       │
│  https://cecom.do                       │
│                                         │
│  Application startup file:              │
│  server.js                              │
│                                         │
│  Passenger log file:                    │
│  (auto-generated)                       │
│                                         │
│         [CREATE]  [CANCEL]              │
└─────────────────────────────────────────┘
```

### Important Fields:
- ✅ **Node.js version**: 18.x or 20.x (match your local)
- ✅ **Application mode**: Production
- ✅ **Application root**: Full path to your files
- ✅ **Application URL**: Your domain
- ✅ **Application startup file**: `server.js`

---

## 📦 Step 5: Install Dependencies

### After Creating App:

```
┌─────────────────────────────────────────┐
│  Node.js Application                    │
├─────────────────────────────────────────┤
│  Status: Stopped                        │
│  Application URL: http://127.0.0.1:3000 │ ← Note this port!
│                                         │
│  [STOP APP]  [RESTART]  [REMOVE]       │
│                                         │
├─────────────────────────────────────────┤
│  Detected configuration files           │
├─────────────────────────────────────────┤
│  package.json found                     │
│                                         │
│  [RUN NPM INSTALL]  ← Click this!      │
└─────────────────────────────────────────┘
```

### Installation Progress:
```
Installing dependencies...
⠋ npm install --production
  ├── next@15.4.4
  ├── react@19.0.0
  ├── @supabase/supabase-js@2.56.0
  └── ... (many more packages)

✓ Installation complete (5-10 minutes)
```

### ⚠️ If Installation Fails:
- Check memory limits (contact hosting)
- Build locally and upload `node_modules/` (not recommended)
- Use `npm install --production` to skip dev dependencies

---

## ▶️ Step 6: Start Application

### Click START APP:

```
┌─────────────────────────────────────────┐
│  Node.js Application                    │
├─────────────────────────────────────────┤
│  Status: Running ✓                      │
│  Application URL: http://127.0.0.1:3456 │ ← Your port number
│                                         │
│  [STOP APP]  [RESTART]  [REMOVE]       │
└─────────────────────────────────────────┘
```

### ⚠️ IMPORTANT: Note Your Port!
In this example: **3456**

You'll need this for the next step!

---

## 🔧 Step 7: Update .htaccess

### Edit .htaccess in File Manager:

**Find this line (line 13):**
```apache
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

**Change to YOUR port:**
```apache
RewriteRule ^(.*)$ http://localhost:3456/$1 [P,L]
                                      ^^^^
                                   Your port here!
```

### Full .htaccess Example:
```apache
# .htaccess for Next.js on cPanel
Options -Indexes
RewriteEngine On

# Redirect to Node.js app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3456/$1 [P,L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### Save and Close

---

## ✅ Step 8: Test Your Site

### Visit Your Domain:
```
https://cecom.do
```

### Check These Pages:
- ✅ Homepage: `https://cecom.do`
- ✅ About: `https://cecom.do/en/about`
- ✅ Products: `https://cecom.do/en/solutions`
- ✅ Blog: `https://cecom.do/en/blog`
- ✅ Contact: `https://cecom.do/en/contact`
- ✅ Admin: `https://cecom.do/admin-panel`
- ✅ Spanish: `https://cecom.do/es`

### Test Features:
- [ ] Navigation works
- [ ] Images load
- [ ] Forms submit
- [ ] Blog posts display
- [ ] Products load
- [ ] Language switcher works
- [ ] Admin panel accessible

---

## 📊 Step 9: Monitor Logs

### View Logs in cPanel:

```
Setup Node.js App → Your App → Logs

┌─────────────────────────────────────────┐
│  stdout.log (Normal Output)             │
├─────────────────────────────────────────┤
│  > Ready on http://localhost:3456       │
│  > Environment: production              │
│  ✓ Compiled successfully                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  stderr.log (Errors)                    │
├─────────────────────────────────────────┤
│  (should be empty if everything works)  │
└─────────────────────────────────────────┘
```

### If You See Errors:
- Check `stderr.log` for details
- Verify `.env.local` has all variables
- Ensure database is accessible
- See troubleshooting guide

---

## 🔄 Updating Your Site

### When You Make Changes:

```
1. Local Development
   ├── Make changes
   ├── Test locally
   └── Build: npm run build

2. Create New Package
   └── Run: ./scripts/prepare-cpanel-deploy.sh

3. Upload to cPanel
   ├── Upload new ZIP
   ├── Extract (overwrite old files)
   └── Delete ZIP

4. Restart App
   └── cPanel → Setup Node.js App → RESTART
```

### Quick Update (Only .next folder):
```bash
# Build locally
npm run build

# Upload only .next/ folder via FTP
# Overwrite existing .next/ folder

# Restart in cPanel
```

---

## 🐛 Common Issues - Visual Guide

### Issue: 502 Bad Gateway

```
Browser
    ↓
    ❌ 502 Bad Gateway
    ↓
Check:
    1. Is app running in cPanel? → START APP
    2. Check stderr.log → Fix errors
    3. Port in .htaccess correct? → Update
    4. .env.local exists? → Create it
```

### Issue: Images Not Loading

```
Browser
    ↓
    🖼️ Broken images
    ↓
Check:
    1. public/ folder uploaded? → Upload it
    2. .next/static/ exists? → Run copy-static
    3. Image paths correct? → Use /images/...
```

### Issue: API Routes 404

```
Browser
    ↓
    ❌ /api/contact → 404
    ↓
Check:
    1. .htaccess in root? → Move it
    2. Port correct? → Update
    3. App running? → Check cPanel
```

---

## 📞 Getting Help

### Check Logs First:
```
cPanel → Setup Node.js App → Your App
    ├── stdout.log (normal output)
    └── stderr.log (errors) ← Start here!
```

### Contact Hosting Support:
```
Subject: Node.js App Configuration Help

Hi, I'm deploying a Next.js application and need help with:
- Node.js version: 18.x
- Port configuration
- Memory limits
- Error from stderr.log: [paste error]

My app details:
- Application root: /home/username/public_html
- Startup file: server.js
- Current status: [Running/Stopped]
```

---

## 🎉 Success Checklist

After deployment, verify:

```
✅ App Status
   └── cPanel shows "Running"

✅ Domain Access
   ├── Homepage loads
   ├── All pages accessible
   └── No 404 errors

✅ Features Working
   ├── Images display
   ├── Navigation works
   ├── Forms submit
   ├── Blog loads
   ├── Products show
   └── Admin accessible

✅ Both Languages
   ├── English (/en/)
   └── Spanish (/es/)

✅ Performance
   ├── Pages load fast
   ├── No console errors
   └── Mobile responsive

✅ Security
   ├── HTTPS enabled
   ├── .env.local not accessible
   └── Admin requires login
```

---

## 🚀 You're Live!

```
    ⭐ ⭐ ⭐
   ⭐ 🎉 ⭐
  ⭐ ⭐ ⭐ ⭐
 ⭐ ⭐ ⭐ ⭐ ⭐

Your Next.js app is now
running on cPanel!

Visit: https://cecom.do
```

---

**Need more help?**
- 📖 `CPANEL-DEPLOYMENT-GUIDE.md` - Detailed guide
- ⚡ `CPANEL-QUICK-START.md` - Fast deployment
- 🐛 `CPANEL-TROUBLESHOOTING.md` - Fix issues
- 📝 `DEPLOYMENT-SUMMARY.md` - Overview

**Happy deploying!** 🎊
