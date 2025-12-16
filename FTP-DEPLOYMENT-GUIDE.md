# 🚀 FTP Automated Deployment Guide

## ✅ FTP Connection Successful!

I've successfully connected to your cPanel FTP server and created automated deployment scripts.

---

## 📦 What Was Created

### **1. Python FTP Deployment Script** (Recommended)
**File**: `scripts/ftp-deploy.py`

**Features:**
- ✅ Automatic FTP connection
- ✅ Upload progress indicator
- ✅ File verification
- ✅ Error handling
- ✅ Colored output

### **2. Bash FTP Deployment Script** (Alternative)
**File**: `scripts/ftp-deploy.sh`

**Features:**
- ✅ Simple bash script
- ✅ Works with basic FTP client
- ✅ Good for quick deployments

---

## 🚀 How to Use

### **Method 1: Python Script (Recommended)**

```bash
# From project root
python3 scripts/ftp-deploy.py
```

**What it does:**
1. Finds your deployment package (cecom-cpanel-fast-images.zip)
2. Connects to FTP server
3. Uploads with progress indicator
4. Verifies upload
5. Shows next steps

**Output:**
```
✅ Found deployment package: cecom-cpanel-fast-images.zip
📡 Package size: 192.82 MB
✅ Connected! Current directory: /
📡 Uploading...
  Progress: 100.0% (192.8/192.8 MB)
✅ Upload complete! Remote file: deploy-20251102-221622.zip
✅ Verification passed!
```

---

### **Method 2: Bash Script**

```bash
# From project root
./scripts/ftp-deploy.sh
```

---

## 📋 Complete Deployment Workflow

### **Step 1: Build & Package (Local)**

```bash
# Build the application
npm run build

# The deployment package is already created:
# cecom-cpanel-fast-images.zip (193 MB)
```

### **Step 2: Upload via FTP (Automated)**

```bash
# Run the FTP deployment script
python3 scripts/ftp-deploy.py
```

**Time**: 5-10 minutes (depending on connection)

### **Step 3: Extract in cPanel (Manual)**

1. **Login to cPanel**
   - URL: https://cecom.com.do:2083

2. **Go to File Manager**

3. **Navigate to root directory** (`/`)

4. **Find the uploaded ZIP**
   - Named: `deploy-YYYYMMDD-HHMMSS.zip`

5. **Right-click → Extract**
   - Extract to: `/cecom-website/` or your app directory

6. **Delete the ZIP** after extraction

### **Step 4: Restart App (Manual)**

1. **Go to**: Setup Node.js App

2. **Click**: "RESTART"

3. **Test**: Visit https://cecom.com.do

---

## 🔐 FTP Credentials (Stored in Script)

```
FTP Host:     ftp.cecom.com.do
FTP Port:     21
Username:     v.gonzalez@cecom.com.do
Password:     ex6IW5N?BItt (stored in script)
Remote Dir:   / (FTP root)
```

⚠️ **Security Note**: Credentials are hardcoded in the script for convenience. Keep the script secure!

---

## 📊 Deployment Comparison

| Method | Upload Time | Automation | Ease of Use |
|--------|-------------|------------|-------------|
| **FTP Script** | 5-10 min | High | ⭐⭐⭐⭐⭐ |
| **cPanel Upload** | 10-15 min | None | ⭐⭐⭐ |
| **Manual FTP Client** | 10-15 min | Low | ⭐⭐ |

---

## 🎯 Quick Deployment Commands

### **Full Deployment (Build + Upload)**

```bash
# Build and upload in one go
npm run build && python3 scripts/ftp-deploy.py
```

### **Quick Update (Already Built)**

```bash
# Just upload existing package
python3 scripts/ftp-deploy.py
```

---

## 🔧 Troubleshooting

### **Issue: Connection Timeout**

```bash
# Increase timeout in script
# Edit scripts/ftp-deploy.py line 68:
ftp.connect(FTP_HOST, FTP_PORT, timeout=60)  # Increase to 60 seconds
```

### **Issue: Upload Interrupted**

```bash
# The script will show where it failed
# Just run it again - it creates a new timestamped file
python3 scripts/ftp-deploy.py
```

### **Issue: Wrong Directory**

```bash
# Check current FTP directory
ftp -n <<EOF
open ftp.cecom.com.do 21
user v.gonzalez@cecom.com.do ex6IW5N?BItt
pwd
ls
bye
EOF
```

### **Issue: Permission Denied**

- Contact hosting provider
- Verify FTP user has write permissions
- Check if directory exists

---

## 📁 FTP Directory Structure

```
/ (FTP Root)
├── deploy-20251102-221622.zip  ← Uploaded package
├── .ftpquota
└── (extract contents here or in subdirectory)
```

**After extraction:**
```
/cecom-website/  (or your app directory)
├── .next/
├── public/
├── messages/
├── node_modules/  (if included)
├── server.js
├── package.json
├── next.config.mjs
├── .htaccess
└── .env.local  (create manually if not exists)
```

---

## 🚀 Advanced: Fully Automated Deployment

For even more automation, you could:

### **Option 1: Add to package.json**

```json
{
  "scripts": {
    "deploy": "npm run build && python3 scripts/ftp-deploy.py",
    "deploy:quick": "python3 scripts/ftp-deploy.py"
  }
}
```

Then just run:
```bash
npm run deploy
```

### **Option 2: Create Alias**

Add to `~/.bashrc` or `~/.zshrc`:
```bash
alias deploy-cecom="cd /home/victor/cecom-website && npm run build && python3 scripts/ftp-deploy.py"
```

Then just run:
```bash
deploy-cecom
```

---

## 📊 Upload Progress Tracking

The Python script shows real-time progress:

```
Progress: 45.2% (87.2/192.8 MB)
```

**Estimated times:**
- 10 Mbps: ~3 minutes
- 50 Mbps: ~30 seconds
- 100 Mbps: ~15 seconds

---

## 🔄 Update Workflow

### **For Code Changes:**

```bash
# 1. Make changes
# 2. Build
npm run build

# 3. Update deployment package
cd cpanel-deployment-package
rm -rf .next
cp -r ../.next .
cp ../next.config.mjs .
cd ..
zip -r cecom-cpanel-fast-images.zip cpanel-deployment-package/*

# 4. Upload
python3 scripts/ftp-deploy.py
```

### **For Quick Updates (Only .next):**

```bash
# 1. Build
npm run build

# 2. Create quick update package
cd .next
zip -r ../quick-update.zip .
cd ..

# 3. Upload manually or modify script
```

---

## 🎯 Best Practices

1. **Always build locally** before uploading
2. **Test locally first** with `npm start`
3. **Keep backups** of working deployments
4. **Use timestamped uploads** (script does this automatically)
5. **Verify upload** before extracting (script does this)
6. **Delete old ZIPs** after extraction to save space

---

## 📞 Support

### **FTP Issues:**
- Check credentials
- Verify FTP port (21)
- Test with FTP client (FileZilla)
- Contact hosting provider

### **Upload Issues:**
- Check internet connection
- Verify file exists locally
- Check disk space on server
- Try smaller package

### **Extraction Issues:**
- Use cPanel File Manager
- Check file permissions
- Verify ZIP is not corrupted
- Contact hosting support

---

## 🎉 Success Checklist

After deployment:

```
□ FTP upload completed (100%)
□ Upload verified (sizes match)
□ ZIP extracted in cPanel
□ Old ZIP deleted
□ .env.local exists and correct
□ .htaccess has correct port
□ Node.js app restarted
□ Website loads correctly
□ Images load fast
□ All features work
```

---

## 📝 Example Session

```bash
$ python3 scripts/ftp-deploy.py

==============================================================
  FTP Automated Deployment to cPanel
==============================================================

✅ Found deployment package: cecom-cpanel-fast-images.zip
📡 Package size: 192.82 MB
📡 Testing FTP connection...
✅ Connected! Current directory: /
📡 Uploading cecom-cpanel-fast-images.zip...
⚠️  This may take several minutes...
  Progress: 100.0% (192.8/192.8 MB)
✅ Upload complete! Remote file: deploy-20251102-221622.zip
✅ Verification passed! Size: 192.82 MB

==============================================================
  Next Steps (Manual)
==============================================================

1. Login to cPanel File Manager
2. Navigate to: /
3. Find and extract: deploy-20251102-221622.zip
4. Delete the ZIP file after extraction
5. Restart Node.js app in cPanel
```

---

## 🚀 You're All Set!

Your FTP deployment is now automated. Just run:

```bash
python3 scripts/ftp-deploy.py
```

And follow the manual steps in cPanel to complete the deployment.

**Deployment time**: 10-15 minutes total (5-10 min upload + 5 min manual steps)

---

**Created**: November 2, 2025  
**FTP Server**: ftp.cecom.com.do  
**Status**: ✅ Tested and Working
