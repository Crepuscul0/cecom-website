# cPanel Deployment Troubleshooting Guide

Common issues and solutions when deploying Next.js to cPanel.

---

## 🔴 Build & Installation Issues

### Issue: "Out of memory" during npm install

**Symptoms:**
- npm install fails
- Process killed
- "JavaScript heap out of memory" error

**Solutions:**

1. **Build locally and upload .next folder**
   ```bash
   # On your local machine
   npm run build
   # Upload the .next folder to cPanel
   ```

2. **Install dependencies in smaller batches**
   - Contact hosting provider to increase memory limit
   - Use `npm install --production` to skip dev dependencies

3. **Use lighter alternatives**
   - Remove unused dependencies
   - Check `package.json` for heavy packages

---

### Issue: "Cannot find module 'next'"

**Symptoms:**
- App won't start
- Error in stderr.log: "Cannot find module 'next'"

**Solutions:**

1. **Run NPM Install again**
   - Go to cPanel → Setup Node.js App
   - Click your app
   - Click "Run NPM Install"
   - Wait for completion

2. **Verify node_modules exists**
   - Check File Manager
   - Ensure node_modules folder is present
   - If missing, run NPM Install

3. **Check package.json**
   - Ensure package.json was uploaded
   - Verify it contains all dependencies

---

### Issue: Build fails with TypeScript errors

**Symptoms:**
- `npm run build` fails locally or on server
- TypeScript compilation errors

**Solutions:**

1. **Fix TypeScript errors locally first**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

2. **Skip type checking in build (temporary)**
   - Add to `next.config.mjs`:
   ```javascript
   typescript: {
     ignoreBuildErrors: true,
   },
   ```

3. **Update TypeScript**
   ```bash
   npm install typescript@latest
   ```

---

## 🔴 Server & Runtime Issues

### Issue: 502 Bad Gateway

**Symptoms:**
- Website shows "502 Bad Gateway"
- App appears running in cPanel

**Causes & Solutions:**

1. **App crashed on startup**
   - Check `stderr.log` in cPanel Node.js App
   - Look for error messages
   - Fix the error and restart

2. **Wrong port in .htaccess**
   - Get port from cPanel Node.js App (Application URL)
   - Update `.htaccess` line 13:
   ```apache
   RewriteRule ^(.*)$ http://localhost:YOUR_PORT/$1 [P,L]
   ```

3. **Environment variables missing**
   - Verify `.env.local` exists
   - Check all required variables are set
   - Restart app after adding variables

4. **Database connection failed**
   - Test Supabase connection
   - Verify DATABASE_URL is correct
   - Check Supabase project is active

---

### Issue: App won't start / Keeps stopping

**Symptoms:**
- Click "Start App" but it stops immediately
- Status shows "Stopped"

**Solutions:**

1. **Check stderr.log**
   - Go to cPanel → Setup Node.js App
   - Click your app
   - View stderr.log for errors

2. **Common startup errors:**

   **Missing environment variable:**
   ```
   Error: NEXT_PUBLIC_SUPABASE_URL is not defined
   ```
   Solution: Add to .env.local

   **Port already in use:**
   ```
   Error: listen EADDRINUSE: address already in use
   ```
   Solution: Stop app, wait 30 seconds, start again

   **Database connection:**
   ```
   Error: connect ECONNREFUSED
   ```
   Solution: Check DATABASE_URL, verify Supabase is accessible

3. **Restart Node.js service**
   - Contact hosting support
   - Ask them to restart Node.js service

---

### Issue: Port already in use

**Symptoms:**
- Error: "EADDRINUSE: address already in use"
- App won't start

**Solutions:**

1. **Stop and wait**
   - Stop the app in cPanel
   - Wait 30-60 seconds
   - Start again

2. **Change port (if allowed)**
   - Update `server.js`:
   ```javascript
   const port = process.env.PORT || 3001; // Try different port
   ```

3. **Kill existing process**
   - If SSH available:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```
   - Otherwise, contact hosting support

---

## 🔴 Routing & Access Issues

### Issue: 404 on all pages except homepage

**Symptoms:**
- Homepage loads fine
- All other pages return 404
- API routes return 404

**Solutions:**

1. **Check .htaccess**
   - Verify .htaccess is in domain root
   - Ensure RewriteEngine is On
   - Check RewriteRule syntax:
   ```apache
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
   ```

2. **Verify Apache mod_rewrite**
   - Contact hosting to enable mod_rewrite
   - Check if mod_proxy is enabled

3. **Test direct app URL**
   - Visit the Node.js app URL directly (with port)
   - If it works, issue is with .htaccess
   - If it doesn't, issue is with the app

---

### Issue: API routes return 404

**Symptoms:**
- `/api/*` routes return 404
- Frontend works but API calls fail

**Solutions:**

1. **Verify API routes exist**
   - Check `.next/server/app/api/` folder exists
   - Ensure build included API routes

2. **Check .htaccess proxy**
   - Ensure .htaccess proxies all requests
   - Verify port number is correct

3. **Test API directly**
   - Visit `http://localhost:PORT/api/your-route`
   - If works, issue is with proxy
   - If doesn't work, check API route code

---

### Issue: Admin panel not accessible

**Symptoms:**
- `/admin-panel` returns 404 or error
- PayloadCMS admin won't load

**Solutions:**

1. **Verify route exists**
   - Check `src/app/admin-panel/` folder was uploaded
   - Ensure build completed successfully

2. **Check authentication**
   - Verify Supabase connection
   - Check PAYLOAD_SECRET is set
   - Test login credentials

3. **Database connection**
   - Verify DATABASE_URL
   - Check PayloadCMS collections exist
   - Run migrations if needed

---

## 🔴 Asset & Resource Issues

### Issue: Images not loading

**Symptoms:**
- Broken image icons
- 404 on image requests
- Images work locally but not on cPanel

**Solutions:**

1. **Verify public folder uploaded**
   - Check `public/` folder exists in File Manager
   - Ensure all images are present

2. **Check image paths**
   - Use absolute paths: `/images/logo.png`
   - Not relative paths: `../images/logo.png`

3. **Next.js Image Optimization**
   - Verify `next.config.mjs` image configuration:
   ```javascript
   images: {
     domains: ['cecom.do', 'yourdomain.com'],
     remotePatterns: [
       { protocol: 'https', hostname: '**' }
     ]
   }
   ```

4. **Check .next/static folder**
   - Ensure `.next/static/` was uploaded
   - Verify postbuild script ran:
   ```bash
   npm run copy-static
   ```

---

### Issue: CSS not loading / Styling broken

**Symptoms:**
- Website has no styling
- Plain HTML visible
- Tailwind classes not applied

**Solutions:**

1. **Verify .next/static uploaded**
   - Check `.next/static/css/` exists
   - Ensure CSS files are present

2. **Check build output**
   - Rebuild locally: `npm run build`
   - Verify no CSS errors
   - Upload new .next folder

3. **Browser cache**
   - Hard refresh: Ctrl+Shift+R
   - Clear browser cache
   - Try incognito mode

---

### Issue: Fonts not loading

**Symptoms:**
- Fallback fonts displayed
- Console errors about fonts

**Solutions:**

1. **Check font files**
   - Verify `public/fonts/` uploaded (if using local fonts)
   - Check `.next/static/media/` for Next.js fonts

2. **Update font configuration**
   - If using Google Fonts, verify CDN access
   - Check font imports in CSS

---

## 🔴 Database & External Services

### Issue: Supabase connection fails

**Symptoms:**
- "Failed to fetch" errors
- Database queries timeout
- Authentication doesn't work

**Solutions:**

1. **Verify credentials**
   - Check `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

2. **Test connection**
   - Create test API route:
   ```typescript
   // src/app/api/test-supabase/route.ts
   import { createClient } from '@/lib/supabase'
   
   export async function GET() {
     const supabase = createClient()
     const { data, error } = await supabase.from('blog_posts').select('count')
     return Response.json({ data, error })
   }
   ```

3. **Check Supabase project**
   - Verify project is active (not paused)
   - Check if IP whitelist is enabled
   - Ensure RLS policies allow access

4. **Network issues**
   - Test from server: `curl https://xxx.supabase.co`
   - Contact hosting if blocked

---

### Issue: PayloadCMS not working

**Symptoms:**
- Admin panel errors
- Collections not loading
- Upload fails

**Solutions:**

1. **Verify environment variables**
   ```env
   DATABASE_URL=postgresql://...
   PAYLOAD_SECRET=your-secret-key-min-32-chars
   ```

2. **Check database connection**
   - Verify PostgreSQL accessible
   - Test connection string
   - Check database exists

3. **Run migrations**
   - If SSH available:
   ```bash
   npm run payload migrate
   ```

4. **Check file permissions**
   - Ensure upload directory writable
   - Verify storage configuration

---

### Issue: Email not sending

**Symptoms:**
- Contact form submits but no email
- No errors shown

**Solutions:**

1. **Verify SMTP configuration**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

2. **Test SMTP connection**
   - Create test API route
   - Check SMTP logs
   - Verify credentials

3. **Check spam folder**
   - Emails might be marked as spam
   - Configure SPF/DKIM records

4. **Firewall issues**
   - Contact hosting about SMTP port access
   - Try different SMTP provider

---

## 🔴 Performance Issues

### Issue: Slow page loads

**Symptoms:**
- Pages take long to load
- High server response time

**Solutions:**

1. **Enable caching**
   - Add to `.htaccess`:
   ```apache
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType text/css "access plus 1 month"
   </IfModule>
   ```

2. **Optimize images**
   - Use WebP format
   - Compress images before upload
   - Use Next.js Image component

3. **Enable compression**
   - Add to `.htaccess`:
   ```apache
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/css application/javascript
   </IfModule>
   ```

4. **Upgrade hosting**
   - Check server resources
   - Consider VPS if shared hosting is slow

---

### Issue: High memory usage

**Symptoms:**
- App crashes randomly
- "Out of memory" errors
- Slow performance

**Solutions:**

1. **Optimize build**
   - Remove unused dependencies
   - Use dynamic imports
   - Optimize images

2. **Increase memory limit**
   - Contact hosting provider
   - Request memory increase for Node.js

3. **Monitor usage**
   - Check cPanel resource usage
   - Identify memory-heavy operations

---

## 🔴 Security Issues

### Issue: .env.local accessible via web

**Symptoms:**
- Can access `yourdomain.com/.env.local`
- Environment variables exposed

**Solutions:**

1. **Block access in .htaccess**
   ```apache
   <FilesMatch "^\.env">
     Order allow,deny
     Deny from all
   </FilesMatch>
   ```

2. **Move outside public directory**
   - Place .env.local outside web root
   - Update path in application

---

### Issue: Unauthorized access to admin

**Symptoms:**
- Admin panel accessible without login
- Security warnings

**Solutions:**

1. **Verify authentication**
   - Check Supabase auth is working
   - Test login flow
   - Verify middleware is active

2. **Check RLS policies**
   - Ensure Supabase RLS is enabled
   - Verify policies are correct

---

## 📞 Getting Help

If issues persist:

1. **Check logs**
   - stdout.log (normal output)
   - stderr.log (errors)
   - Browser console (client errors)

2. **Contact hosting support**
   - Provide error messages
   - Share relevant logs
   - Ask about Node.js configuration

3. **Community resources**
   - Next.js Discord
   - Stack Overflow
   - cPanel forums

4. **Professional help**
   - Hire Next.js developer
   - Contact web hosting consultant

---

## 🔍 Diagnostic Commands

If SSH is available:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check running processes
ps aux | grep node

# Check port usage
netstat -tulpn | grep :3000

# Check disk space
df -h

# Check memory usage
free -m

# View app logs
tail -f /path/to/app/stderr.log

# Test app directly
curl http://localhost:3000
```

---

**Last Updated**: January 2025
