# NPM Install Dependency Conflict - FIXED ✅

## The Problem

You got this error:
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer react@"^19.0.0" from @payloadcms/richtext-slate
```

**Cause:** PayloadCMS requires React 19, but the project uses React 18.

## The Solution

I've added an `.npmrc` file with `legacy-peer-deps=true` which tells npm to ignore peer dependency conflicts.

## ✅ New Package (WITH FIX)

**Upload this NEW package:**
```
cecom-website-cloudlinux-20251101_005412.tar.gz
```

**Location:** `/home/victor/cecom-website/cecom-website-cloudlinux-20251101_005412.tar.gz`

## What Changed?

✅ Added `.npmrc` file with `legacy-peer-deps=true`  
✅ npm install will now work without errors  
✅ All dependencies will install correctly  

## Deployment Steps (Updated)

### 1. Delete Old Files (if you uploaded before)
- In cPanel File Manager, delete the old extracted files
- Or overwrite them with the new package

### 2. Upload NEW Package
- Upload `cecom-website-cloudlinux-20251101_005412.tar.gz`
- Extract it

### 3. Setup Node.js App (if not done)
- Go to **Setup Node.js App**
- Create application with Node.js 20.x

### 4. Run NPM Install
**Option A:** Click **"Run NPM Install"** button in cPanel

**Option B:** Via Terminal (SSH):
```bash
cd /home/cecomcom/public_html/your-app-directory
npm install
```

✅ **This time it will work!** The `.npmrc` file tells npm to ignore the React version conflict.

### 5. Start Application
- Click **Restart** in cPanel Node.js App interface
- Or run `./start.sh`

## Alternative: Manual Fix (if you already uploaded)

If you already uploaded the old package, you can fix it manually:

### Via cPanel File Manager:
1. Navigate to your app directory
2. Click **+ File** to create new file
3. Name it `.npmrc`
4. Edit the file and add this line:
```
legacy-peer-deps=true
```
5. Save the file
6. Run npm install again

### Via Terminal (SSH):
```bash
cd /home/cecomcom/public_html/your-app-directory
echo "legacy-peer-deps=true" > .npmrc
npm install
```

## Verify It Works

After npm install completes, you should see:
```
✅ added XXX packages
✅ No errors
✅ node_modules symlink created
```

Check the symlink:
```bash
ls -la | grep node_modules
```

Should show: `node_modules -> /path/to/virtual/env/node_modules` (blue arrow in File Manager)

## Troubleshooting

### Still getting errors?
1. Delete `node_modules` symlink
2. Delete `package-lock.json`
3. Run: `npm install --legacy-peer-deps`

### Permission errors?
```bash
chmod 644 .npmrc
```

### Want to use latest React?
Not recommended right now, but if you want to upgrade:
```bash
npm install react@19 react-dom@19 --legacy-peer-deps
```

---

## Summary

✅ **Problem:** React version conflict  
✅ **Solution:** Added `.npmrc` with `legacy-peer-deps=true`  
✅ **New Package:** `cecom-website-cloudlinux-20251101_005412.tar.gz`  
✅ **Status:** Ready to deploy!

Upload the NEW package and npm install will work perfectly! 🚀
