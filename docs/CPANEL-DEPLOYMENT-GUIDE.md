# cPanel Deployment Guide for CECOM Website

This guide provides step-by-step instructions for deploying the Next.js application to cPanel **without SSH access**.

## 📋 Prerequisites

- cPanel account with Node.js support (version 18.x or higher)
- FTP/File Manager access
- Domain configured in cPanel
- Supabase project credentials
- At least 2GB RAM available (for build process)

---

## 🚀 Deployment Methods

### Method 1: Manual Upload via File Manager (Recommended for First Deploy)

#### Step 1: Build Locally

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

#### Step 2: Prepare Files for Upload

Create a ZIP file with these files/folders:
- ✅ `.next/` folder (entire build output)
- ✅ `public/` folder
- ✅ `node_modules/` folder (or install on server)
- ✅ `server.js`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `next.config.mjs`
- ✅ `i18n.ts`
- ✅ `middleware.ts`
- ✅ `payload.config.ts`
- ✅ `messages/` folder
- ✅ `prisma/` folder (if using)
- ✅ `.env.local` (create separately on server)
- ❌ **EXCLUDE**: `node_modules/` (install on server instead)
- ❌ **EXCLUDE**: `.git/`, `docs/`, `scripts/`, `.next/cache/`

**Important**: If ZIP is too large, upload without `node_modules` and install on server.

#### Step 3: Upload to cPanel

1. Login to cPanel
2. Go to **File Manager**
3. Navigate to your domain's root directory (e.g., `public_html/`)
4. Upload the ZIP file
5. Extract the ZIP file
6. Delete the ZIP file after extraction

#### Step 4: Create Environment File

In File Manager, create `.env.local` with your production values:

```env
# Database
DATABASE_URL=your_supabase_postgres_url
DIRECT_URL=your_supabase_direct_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PayloadCMS
PAYLOAD_SECRET=your_payload_secret_key

# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Email (if using)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password

# Other services
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

#### Step 5: Setup Node.js Application in cPanel

1. Go to **Software** → **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or 20.x (match your local version)
   - **Application mode**: Production
   - **Application root**: Path to your files (e.g., `/home/username/public_html`)
   - **Application URL**: Your domain (e.g., `cecom.do`)
   - **Application startup file**: `server.js`
   - **Environment variables**: Add if needed (or use .env.local)
4. Click **Create**

#### Step 6: Install Dependencies

1. In the Node.js App interface, scroll to **Detected configuration files**
2. Click **Run NPM Install**
3. Wait for installation to complete (may take 5-10 minutes)
4. Check for errors in the log

#### Step 7: Start the Application

1. Click **Start App** button
2. Note the application URL (usually includes port number)
3. Visit your domain to verify it's working

#### Step 8: Configure Domain Redirect

If your app runs on a port (e.g., `http://localhost:3000`), you need to redirect your domain:

**Option A: Using .htaccess** (Already created)
- The `.htaccess` file in your root will proxy requests to the Node.js app
- Update the port number in `.htaccess` to match your app's port

**Option B: Using cPanel Proxy**
1. Go to **Domains** → **Domains**
2. Click your domain
3. Enable **Proxy** and set it to your Node.js app URL

---

### Method 2: FTP Upload

#### Step 1: Build Locally
```bash
npm run build
```

#### Step 2: Upload via FTP Client

Use FileZilla, Cyberduck, or any FTP client:

1. Connect to your cPanel FTP:
   - Host: `ftp.yourdomain.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21

2. Upload these files/folders:
   - `.next/`
   - `public/`
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `next.config.mjs`
   - All config files
   - `messages/` folder

3. Create `.env.local` on server

4. Follow Steps 5-8 from Method 1

---

### Method 3: Git Version Control (If Available)

If your cPanel supports Git Version Control:

#### Step 1: Setup Git Repository in cPanel

1. Go to **Files** → **Git Version Control**
2. Click **Create**
3. Configure:
   - **Clone URL**: Your GitHub/GitLab repository URL
   - **Repository Path**: `/home/username/repositories/cecom-website`
   - **Repository Name**: cecom-website

#### Step 2: Configure Deployment

1. The `.cpanel.yml` file will automate deployment
2. Update the `DEPLOYPATH` in `.cpanel.yml` to your actual path
3. Push changes to your repository
4. cPanel will automatically deploy

#### Step 3: Build on Server

Since cPanel may have memory limits for builds:

**Option A**: Build locally and commit `.next/` folder
```bash
npm run build
git add .next
git commit -m "Add build files"
git push
```

**Option B**: Build on server (if enough RAM)
- SSH into server (if available)
- Run `npm run build`

---

## 🔧 Configuration Details

### Port Configuration

cPanel assigns a random port to your Node.js app. To find it:

1. Go to **Setup Node.js App**
2. Click your application
3. Look for **Application URL** - it will show the port
4. Update `.htaccess` with this port number

### Environment Variables

You can set environment variables in two ways:

**Method 1: .env.local file** (Recommended)
- Create in File Manager
- More secure, not visible in cPanel interface

**Method 2: cPanel Node.js App Interface**
- Go to Setup Node.js App
- Click your app
- Scroll to **Environment Variables**
- Add each variable

### Memory Limits

If you encounter memory errors during `npm install` or app startup:

1. **Contact hosting provider** to increase Node.js memory limit
2. **Build locally** and upload `.next/` folder (don't build on server)
3. **Optimize dependencies**: Remove unused packages

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module 'next'"

**Solution**: Run NPM Install again
1. Go to Setup Node.js App
2. Stop the app
3. Click "Run NPM Install"
4. Start the app

### Issue 2: App won't start / Port already in use

**Solution**: 
1. Stop the app in cPanel
2. Wait 30 seconds
3. Start again
4. If persists, contact hosting support

### Issue 3: 502 Bad Gateway

**Causes**:
- App crashed on startup
- Wrong port in .htaccess
- Environment variables missing

**Solution**:
1. Check `stderr.log` in application folder
2. Verify `.env.local` has all required variables
3. Check port number in .htaccess matches app port
4. Restart the app

### Issue 4: Images not loading

**Causes**:
- Next.js Image Optimization requires server
- External image domains not configured

**Solution**:
1. Verify `next.config.mjs` has correct image domains
2. Check `public/` folder was uploaded
3. Ensure `.next/static/` folder exists

### Issue 5: API routes return 404

**Causes**:
- .htaccess not configured correctly
- App not proxying requests properly

**Solution**:
1. Verify .htaccess is in the correct location
2. Check RewriteRule points to correct port
3. Ensure `server.js` is handling all routes

### Issue 6: Supabase connection fails

**Solution**:
1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is active
3. Verify IP whitelist in Supabase (if applicable)
4. Test connection from server

### Issue 7: PayloadCMS admin not accessible

**Solution**:
1. Verify `PAYLOAD_SECRET` is set
2. Check database connection
3. Ensure `/admin` route is not blocked
4. Check `payload.config.ts` is uploaded

---

## 📊 Monitoring & Logs

### View Application Logs

1. Go to **Setup Node.js App**
2. Click your application
3. View logs:
   - **stdout.log**: Normal output
   - **stderr.log**: Errors and warnings

### Check Application Status

```bash
# In cPanel Terminal (if available)
ps aux | grep node
```

### Restart Application

1. Go to Setup Node.js App
2. Click **Stop App**
3. Wait 10 seconds
4. Click **Start App**

---

## 🔄 Updating the Application

### Method 1: Manual Update

1. Build locally: `npm run build`
2. Upload new `.next/` folder via FTP/File Manager
3. Replace old files
4. Restart app in cPanel

### Method 2: Git Update

1. Push changes to repository
2. In cPanel Git Version Control, click **Update**
3. Rebuild if necessary
4. Restart app

---

## ⚡ Performance Optimization

### 1. Enable Compression

Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### 2. Enable Caching

Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. Use CDN

Consider using Cloudflare or similar CDN:
1. Point domain to Cloudflare
2. Enable caching rules
3. Enable minification
4. Keep cPanel as origin server

---

## 🔒 Security Checklist

- [ ] `.env.local` has correct production values
- [ ] `.env.local` is not accessible via web (use .htaccess to block)
- [ ] Supabase RLS policies are enabled
- [ ] PayloadCMS admin has strong password
- [ ] HTTPS is enabled (SSL certificate installed)
- [ ] Security headers are set in .htaccess
- [ ] Unnecessary files removed (docs, scripts, .git)
- [ ] Database backups configured
- [ ] Rate limiting enabled (via Upstash)

---

## 📞 Support

If you encounter issues:

1. Check logs in cPanel Node.js App interface
2. Review this troubleshooting guide
3. Contact your hosting provider for:
   - Node.js version support
   - Memory limit increases
   - Port configuration issues
4. Check Next.js documentation: https://nextjs.org/docs

---

## 📝 Deployment Checklist

Before deploying:

- [ ] Test build locally: `npm run build && npm start`
- [ ] All environment variables documented
- [ ] Database migrations completed
- [ ] Supabase project configured
- [ ] PayloadCMS collections created
- [ ] Domain DNS configured
- [ ] SSL certificate ready
- [ ] Backup of current site (if updating)

During deployment:

- [ ] Files uploaded successfully
- [ ] `.env.local` created with correct values
- [ ] Node.js app created in cPanel
- [ ] NPM install completed without errors
- [ ] App started successfully
- [ ] Domain redirects to app
- [ ] All pages load correctly
- [ ] API routes working
- [ ] Images loading
- [ ] Forms submitting
- [ ] Admin panel accessible

After deployment:

- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags
- [ ] Test contact form
- [ ] Check blog posts loading
- [ ] Verify product catalog
- [ ] Test internationalization (EN/ES)
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerts

---

## 🎯 Quick Reference

### File Structure on Server
```
/home/username/public_html/
├── .next/                 # Build output
├── public/                # Static assets
├── messages/              # i18n translations
├── prisma/                # Database schema
├── server.js              # Entry point
├── package.json           # Dependencies
├── next.config.mjs        # Next.js config
├── payload.config.ts      # PayloadCMS config
├── middleware.ts          # Next.js middleware
├── i18n.ts               # i18n config
├── .env.local            # Environment variables
├── .htaccess             # Apache config
└── node_modules/         # Dependencies

```

### Essential Commands
```bash
# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start

# Check Node.js version
node --version

# Check npm version
npm --version
```

### Important URLs
- cPanel: `https://yourdomain.com:2083`
- Node.js App: Check in cPanel Setup Node.js App
- Application: `https://yourdomain.com`
- Admin Panel: `https://yourdomain.com/admin-panel`

---

**Last Updated**: January 2025  
**Next.js Version**: 15.4.4  
**Node.js Version**: 18.x - 20.x
