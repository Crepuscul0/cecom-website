# cPanel Quick Start Guide

**Fast deployment guide for experienced developers**

## 🚀 5-Minute Deploy

### 1. Build Locally
```bash
npm install
npm run build
```

### 2. Create Deployment ZIP

Include:
- `.next/` folder
- `public/` folder  
- `server.js`
- `package.json`, `package-lock.json`
- `next.config.mjs`, `i18n.ts`, `middleware.ts`, `payload.config.ts`
- `messages/` folder
- `prisma/` folder

Exclude:
- `node_modules/` (install on server)
- `.git/`, `docs/`, `scripts/`

### 3. Upload to cPanel

1. **File Manager** → Navigate to domain root
2. Upload ZIP → Extract → Delete ZIP
3. Create `.env.local` with production values

### 4. Setup Node.js App

**Software** → **Setup Node.js App** → **Create Application**

```
Node.js version: 18.x or 20.x
Application mode: Production
Application root: /home/username/public_html
Application URL: yourdomain.com
Application startup file: server.js
```

### 5. Install & Start

1. Click **Run NPM Install** (wait 5-10 min)
2. Click **Start App**
3. Note the port number from Application URL
4. Update `.htaccess` with correct port
5. Visit your domain

---

## 🔧 Essential Files Created

### `server.js`
Custom Node.js server entry point for cPanel.

### `.htaccess`
Proxies requests from domain to Node.js app port.

**Update line 13** with your app's port:
```apache
RewriteRule ^(.*)$ http://localhost:YOUR_PORT/$1 [P,L]
```

### `.env.local`
Create on server with production credentials:
```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYLOAD_SECRET=
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Run NPM Install again |
| 502 Bad Gateway | Check `stderr.log`, verify .env.local |
| Wrong port | Update .htaccess with correct port from cPanel |
| Images not loading | Verify `public/` folder uploaded |
| API 404 | Check .htaccess RewriteRule |

---

## 📊 Monitor

**Logs**: Setup Node.js App → Your App → View `stdout.log` / `stderr.log`

**Restart**: Stop App → Wait 10s → Start App

---

## 🔄 Update Process

1. Build locally: `npm run build`
2. Upload new `.next/` folder
3. Restart app in cPanel

---

## ✅ Post-Deploy Checklist

- [ ] App running (check cPanel)
- [ ] Domain loads correctly
- [ ] API routes working
- [ ] Images displaying
- [ ] Admin panel accessible
- [ ] Forms submitting
- [ ] Both EN/ES languages work

---

**Need more details?** See `CPANEL-DEPLOYMENT-GUIDE.md`
