# 🚀 cPanel Deployment - Changes Summary

## Overview

Your Next.js application has been prepared for deployment to cPanel **without SSH access**. Since your app uses Supabase, PayloadCMS, API routes, and dynamic features, it **cannot use static export** and must run as a **Node.js application** on cPanel.

---

## ✅ Files Created

### 1. **`server.js`** (NEW)
Custom Node.js server entry point for cPanel.
- Replaces `next start` with custom server
- Required by cPanel's "Setup Node.js App" feature

### 2. **`.htaccess`** (NEW)
Apache configuration for proxying requests.
- Redirects domain traffic to Node.js app port
- **⚠️ IMPORTANT**: Update line 13 with your app's port number after deployment

### 3. **`.cpanel.yml`** (NEW)
Automated deployment configuration for cPanel Git Version Control.
- Optional: Only needed if using Git deployment
- Update `DEPLOYPATH` with your actual path

### 4. **`.env.production.example`** (NEW)
Template for production environment variables.
- Copy to `.env.local` on cPanel server
- Fill in all values before starting the app

### 5. **`scripts/prepare-cpanel-deploy.sh`** (NEW)
Automated deployment preparation script.
- Builds the app
- Creates deployment package
- Generates ZIP file ready for upload

### 6. **Documentation** (NEW)
- `docs/CPANEL-DEPLOYMENT-GUIDE.md` - Complete step-by-step guide
- `docs/CPANEL-QUICK-START.md` - Fast deployment for experienced devs
- `docs/CPANEL-TROUBLESHOOTING.md` - Common issues and solutions

---

## 🔧 Files Modified

### 1. **`package.json`**
Updated scripts:
```json
"start": "NODE_ENV=production node server.js"  // Now uses custom server
"start:next": "next start"                      // Original kept as backup
```

### 2. **`next.config.mjs`**
Already configured correctly:
- `output: 'standalone'` ✅ (enables standalone build)
- Image optimization configured ✅
- Webpack optimizations ✅

### 3. **`.gitignore`**
Added exceptions to track deployment files:
```
!server.js
!.htaccess
!.cpanel.yml
```

---

## 📦 Deployment Methods

### **Method 1: Automated Script (Recommended)**

```bash
# Run the preparation script
./scripts/prepare-cpanel-deploy.sh

# This will:
# 1. Clean previous builds
# 2. Install dependencies
# 3. Build the application
# 4. Create deployment package
# 5. Generate ZIP file
```

Then upload the generated ZIP file to cPanel.

### **Method 2: Manual Build**

```bash
# Build locally
npm install
npm run build

# Create ZIP with these files:
# - .next/
# - public/
# - messages/
# - server.js
# - package.json
# - All config files
```

### **Method 3: FTP Upload**

Build locally, then upload files via FTP client.

---

## 🎯 Quick Deployment Steps

1. **Prepare locally:**
   ```bash
   ./scripts/prepare-cpanel-deploy.sh
   ```

2. **Upload to cPanel:**
   - Use File Manager or FTP
   - Upload the generated ZIP file
   - Extract in domain root

3. **Create `.env.local`:**
   - Copy from `.env.production.example`
   - Fill in all production values

4. **Setup Node.js App in cPanel:**
   - Software → Setup Node.js App → Create Application
   - Node.js version: 18.x or 20.x
   - Application mode: Production
   - Application startup file: `server.js`

5. **Install & Start:**
   - Click "Run NPM Install"
   - Click "Start App"
   - Note the port number

6. **Update `.htaccess`:**
   - Replace `localhost:3000` with your app's port

7. **Test:**
   - Visit your domain
   - Check all features work

---

## ⚠️ Important Notes

### **Cannot Use Static Export**
Your app has these features that require Node.js runtime:
- ✗ API routes (21 route handlers)
- ✗ Supabase authentication with cookies
- ✗ PayloadCMS admin panel
- ✗ Dynamic server-side rendering
- ✗ Middleware for i18n

### **Memory Requirements**
- Minimum 512MB RAM for running the app
- 2GB+ recommended for building on server
- If build fails on server, build locally and upload `.next/` folder

### **Port Configuration**
- cPanel assigns a random port to your Node.js app
- You MUST update `.htaccess` with this port
- Find port in cPanel → Setup Node.js App → Application URL

### **Environment Variables**
All these are REQUIRED in `.env.local`:
- `DATABASE_URL` - Supabase PostgreSQL connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PAYLOAD_SECRET` - PayloadCMS secret (min 32 chars)
- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL` - Your domain URL

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Navigation works (all pages accessible)
- [ ] Images display properly
- [ ] Blog posts load from Supabase
- [ ] Product catalog works
- [ ] Contact form submits
- [ ] Admin panel accessible
- [ ] Both EN/ES languages work
- [ ] API routes respond correctly
- [ ] Supabase authentication works
- [ ] PayloadCMS admin functions

---

## 🐛 Common Issues

### 502 Bad Gateway
- Check `stderr.log` in cPanel Node.js App
- Verify `.env.local` has all variables
- Ensure port in `.htaccess` matches app port

### Module Not Found
- Run "NPM Install" again in cPanel
- Verify `package.json` was uploaded

### Images Not Loading
- Verify `public/` folder uploaded
- Check `.next/static/` exists
- Run `npm run copy-static` before upload

### API Routes 404
- Check `.htaccess` is in correct location
- Verify RewriteRule has correct port
- Ensure mod_rewrite is enabled

**See `docs/CPANEL-TROUBLESHOOTING.md` for detailed solutions.**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `docs/CPANEL-DEPLOYMENT-GUIDE.md` | Complete deployment guide with all methods |
| `docs/CPANEL-QUICK-START.md` | Fast deployment for experienced developers |
| `docs/CPANEL-TROUBLESHOOTING.md` | Common issues and solutions |
| `.env.production.example` | Environment variables template |
| `DEPLOY-INSTRUCTIONS.txt` | Generated in deployment package |

---

## 🎉 Next Steps

1. **Review the documentation:**
   - Read `docs/CPANEL-QUICK-START.md` for fast deployment
   - Or `docs/CPANEL-DEPLOYMENT-GUIDE.md` for detailed instructions

2. **Prepare environment variables:**
   - Gather all Supabase credentials
   - Generate PAYLOAD_SECRET (32+ chars)
   - Prepare SMTP credentials (if using email)

3. **Run deployment script:**
   ```bash
   ./scripts/prepare-cpanel-deploy.sh
   ```

4. **Upload and configure in cPanel**

5. **Test thoroughly**

---

## 💡 Tips for Smooth Deployment

- **Build locally** if cPanel has memory limits
- **Test locally first** with `npm run build && npm start`
- **Keep backups** of current site before deploying
- **Use staging domain** to test before going live
- **Monitor logs** in cPanel after deployment
- **Document your port number** for future reference
- **Set up monitoring** to catch issues early

---

## 📞 Support

If you encounter issues:

1. Check `docs/CPANEL-TROUBLESHOOTING.md`
2. Review logs in cPanel Node.js App interface
3. Contact your hosting provider for:
   - Node.js version support
   - Memory limit increases
   - Port configuration help
4. Consult Next.js documentation: https://nextjs.org/docs

---

**Deployment Preparation Complete!** 🎉

Your application is now ready for cPanel deployment. Follow the guides in the `docs/` folder for step-by-step instructions.

**Good luck with your deployment!** 🚀
