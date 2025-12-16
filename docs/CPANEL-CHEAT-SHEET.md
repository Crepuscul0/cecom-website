# 🎯 cPanel Deployment Cheat Sheet

Quick reference for deploying Next.js to cPanel. Keep this handy!

---

## ⚡ Quick Commands

```bash
# Prepare deployment
./scripts/prepare-cpanel-deploy.sh

# Build only
npm run build

# Test locally
npm start

# Check Node version
node --version
```

---

## 📦 Files to Upload

```
✅ MUST UPLOAD:
├── .next/              (build output)
├── public/             (static assets)
├── messages/           (translations)
├── server.js           (entry point)
├── package.json        (dependencies)
├── package-lock.json   (lock file)
├── next.config.mjs     (Next.js config)
├── i18n.ts            (i18n config)
├── middleware.ts       (middleware)
├── payload.config.ts   (PayloadCMS)
├── .htaccess          (Apache config)
└── .env.local         (create on server!)

❌ DO NOT UPLOAD:
├── node_modules/       (install on server)
├── .git/              (version control)
├── docs/              (documentation)
└── scripts/           (dev scripts)
```

---

## 🔧 cPanel Node.js App Settings

```
Node.js version:        18.x or 20.x
Application mode:       Production
Application root:       /home/username/public_html
Application URL:        yourdomain.com
Application startup:    server.js
```

---

## 🔐 Required Environment Variables

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# PayloadCMS
PAYLOAD_SECRET="min-32-characters"

# Application
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

---

## 📝 Deployment Steps

```
1. Build:     ./scripts/prepare-cpanel-deploy.sh
2. Upload:    Upload ZIP to cPanel File Manager
3. Extract:   Right-click → Extract
4. Env:       Create .env.local with values
5. Setup:     Software → Setup Node.js App
6. Install:   Click "Run NPM Install"
7. Port:      Note port from Application URL
8. Update:    Edit .htaccess with port
9. Start:     Click "Start App"
10. Test:     Visit your domain
```

---

## 🔍 .htaccess Port Update

**Find line 13:**
```apache
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

**Change to your port:**
```apache
RewriteRule ^(.*)$ http://localhost:YOUR_PORT/$1 [P,L]
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 502 Error | Check stderr.log, verify .env.local |
| Module not found | Run NPM Install again |
| Images broken | Upload public/ folder |
| API 404 | Update .htaccess port |
| Won't start | Check stderr.log for errors |
| Port in use | Stop, wait 30s, start |

---

## 📊 Check Logs

```
cPanel → Setup Node.js App → Your App

stdout.log = Normal output
stderr.log = Errors (check here first!)
```

---

## 🔄 Update Process

```bash
# 1. Build locally
npm run build

# 2. Upload .next/ folder (overwrite)

# 3. Restart in cPanel
Setup Node.js App → RESTART
```

---

## ✅ Test Checklist

```
□ Homepage loads
□ All pages accessible
□ Images display
□ Forms work
□ Blog loads
□ Products show
□ Admin accessible
□ EN/ES both work
□ No console errors
```

---

## 📞 Support

**Logs**: cPanel → Setup Node.js App → Logs  
**Docs**: docs/CPANEL-DEPLOYMENT-GUIDE.md  
**Issues**: docs/CPANEL-TROUBLESHOOTING.md

---

## 🎯 Critical Ports & URLs

```
Your Port:      _____ (from cPanel)
Domain:         https://cecom.do
Admin:          https://cecom.do/admin-panel
API Test:       https://cecom.do/api/health
```

---

## 💾 Backup Checklist

```
□ Database backup
□ .env.local backup
□ Files backup
□ Supabase backup
```

---

## 🚨 Emergency Commands

```bash
# If SSH available:

# Stop app
pkill -f "node server.js"

# Check port
lsof -ti:3000

# View logs
tail -f stderr.log

# Test connection
curl http://localhost:3000
```

---

## 📱 Quick Links

- [Full Guide](CPANEL-DEPLOYMENT-GUIDE.md)
- [Visual Guide](CPANEL-VISUAL-GUIDE.md)
- [Troubleshooting](CPANEL-TROUBLESHOOTING.md)
- [Summary](../DEPLOYMENT-SUMMARY.md)

---

**Print this page for quick reference!** 🖨️
