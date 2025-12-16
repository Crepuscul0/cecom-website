# 🎉 Deployment & Features Update

## ✅ What Was Added

### 1. **Complete cPanel Deployment Script** 🚀

**File**: `scripts/deploy-to-cpanel.sh`

**What it does:**
- Cleans previous builds
- Installs dependencies
- Builds the Next.js application
- Creates deployment package with standalone build
- Installs production dependencies
- Creates timestamped ZIP file
- Generates deployment instructions

**How to use:**
```bash
npm run deploy:cpanel
```

Or directly:
```bash
bash scripts/deploy-to-cpanel.sh
```

**Output:**
- `cecom-cpanel-deploy-YYYYMMDD-HHMMSS.zip` - Complete deployment package
- `DEPLOY-INSTRUCTIONS-YYYYMMDD-HHMMSS.txt` - Step-by-step instructions

---

### 2. **Password Reset Feature** 🔐

**New Files:**
- `src/components/auth/ForgotPasswordForm.tsx` - Password reset form
- Updated `src/lib/supabase.ts` - Added `resetPassword()` function
- Updated `src/components/auth/LoginForm.tsx` - Added "Forgot Password" link
- Updated `src/components/auth/AuthModal.tsx` - Added forgot password mode

**How it works:**
1. User clicks "¿Olvidaste tu contraseña?" on login form
2. Enters their email address
3. Receives password reset link via email
4. Clicks link to reset password
5. Returns to login

**Features:**
- ✅ Email validation
- ✅ Success/error messages
- ✅ Back to login button
- ✅ Secure Supabase integration
- ✅ Bilingual (ES/EN ready)

---

## 📦 New NPM Scripts

Added to `package.json`:

```json
{
  "scripts": {
    "deploy:cpanel": "bash scripts/deploy-to-cpanel.sh",
    "deploy:ftp": "python3 scripts/ftp-deploy.py"
  }
}
```

**Usage:**
```bash
# Create complete deployment package
npm run deploy:cpanel

# Upload to cPanel via FTP
npm run deploy:ftp
```

---

## 🚀 Complete Deployment Workflow

### **Step 1: Build & Package**
```bash
npm run deploy:cpanel
```

This creates:
- `cecom-cpanel-deploy-YYYYMMDD-HHMMSS.zip` (492 MB)
- `DEPLOY-INSTRUCTIONS-YYYYMMDD-HHMMSS.txt`

### **Step 2: Upload to cPanel**
```bash
npm run deploy:ftp
```

Or manually upload the ZIP file.

### **Step 3: Extract in cPanel**
- Navigate to `/home/cecomcom/`
- Extract ZIP to `cecom-website/standalone/`

### **Step 4: Configure**
- Create `.env.local` in `standalone/` folder
- Setup Node.js app (if first time)
- Update `.htaccess` with port

### **Step 5: Start & Test**
- Start app in cPanel
- Visit https://cecom.com.do
- Test all features including password reset

---

## 🔐 Password Reset Setup

### **Supabase Configuration**

The password reset feature requires Supabase email configuration:

1. **Go to Supabase Dashboard**
   - Project Settings → Auth → Email Templates

2. **Configure Reset Password Template**
   - Subject: "Restablecer contraseña - CECOM"
   - Redirect URL: `https://cecom.com.do/auth/reset-password`

3. **Test the feature:**
   - Try resetting password
   - Check email delivery
   - Verify reset link works

---

## 📁 File Structure

```
cecom-website/
├── scripts/
│   ├── deploy-to-cpanel.sh      ← NEW! Complete deployment script
│   └── ftp-deploy.py             ← Existing FTP upload script
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── LoginForm.tsx     ← UPDATED! Added forgot password link
│   │       ├── AuthModal.tsx     ← UPDATED! Added forgot mode
│   │       └── ForgotPasswordForm.tsx  ← NEW! Password reset form
│   └── lib/
│       └── supabase.ts           ← UPDATED! Added resetPassword()
├── package.json                  ← UPDATED! Added deploy scripts
└── DEPLOYMENT-AND-FEATURES-UPDATE.md  ← This file
```

---

## ✅ Testing Checklist

### **Deployment Script:**
```
□ Run npm run deploy:cpanel
□ Verify ZIP file created
□ Check instructions file generated
□ Verify package size (~492 MB)
□ Check all files included
```

### **Password Reset:**
```
□ Click "¿Olvidaste tu contraseña?" on login
□ Enter email address
□ Check email received
□ Click reset link
□ Reset password successfully
□ Login with new password
```

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server

# Building
npm run build                  # Build for production

# Deployment
npm run deploy:cpanel          # Create deployment package
npm run deploy:ftp             # Upload via FTP

# Testing
npm test                       # Run tests
npm run lint                   # Check code quality
```

---

## 📊 Deployment Package Contents

The `deploy-to-cpanel.sh` script creates a package with:

✅ **Standalone Build**
- `.next/` - Complete build output
- `server.js` - Node.js entry point
- `node_modules/` - Production dependencies only

✅ **Static Assets**
- `public/` - Images, logos, etc.
- `.next/static/` - Next.js static files

✅ **Translations**
- `messages/` - EN/ES translations

✅ **Configuration**
- `next.config.mjs` - Next.js config (unoptimized images)
- `package.json` - Dependencies list
- `.htaccess` - Apache proxy (in parent dir)

---

## 🔧 Troubleshooting

### **Deployment Script Issues:**

**Script won't run:**
```bash
chmod +x scripts/deploy-to-cpanel.sh
bash scripts/deploy-to-cpanel.sh
```

**Build fails:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

### **Password Reset Issues:**

**Email not received:**
- Check Supabase email configuration
- Verify email templates are set up
- Check spam folder
- Verify SMTP settings in Supabase

**Reset link doesn't work:**
- Verify redirect URL in Supabase
- Check that `/auth/reset-password` route exists
- Verify SSL certificate on domain

---

## 📝 Notes

1. **Deployment script is idempotent** - Safe to run multiple times
2. **Creates timestamped packages** - No overwrites
3. **Includes detailed instructions** - Each package has its own guide
4. **Production-ready** - Only includes necessary dependencies
5. **Password reset is secure** - Uses Supabase built-in auth

---

## 🎉 Summary

### **Added:**
- ✅ Complete deployment automation script
- ✅ Password reset functionality
- ✅ NPM scripts for easy deployment
- ✅ Comprehensive documentation

### **Improved:**
- ✅ Login form with forgot password link
- ✅ Better auth flow
- ✅ Easier deployment process
- ✅ Better user experience

---

**Everything is ready for production deployment!** 🚀

Run `npm run deploy:cpanel` to create your deployment package!
