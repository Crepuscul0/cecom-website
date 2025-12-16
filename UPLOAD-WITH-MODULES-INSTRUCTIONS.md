# ✅ DEPLOYMENT PACKAGE WITH NODE_MODULES READY!

## 📦 File Information

**Filename**: `cecom-cpanel-with-modules.zip`  
**Location**: `/home/victor/cecom-website/cecom-cpanel-with-modules.zip`  
**Size**: 444 MB  
**Contains**: Everything including node_modules (no NPM install needed!)

---

## 🚀 Deployment Instructions

### **STEP 1: Upload to cPanel**

1. **Login to cPanel**
   - URL: `https://yourdomain.com:2083`

2. **Go to File Manager**

3. **Navigate to your domain root**
   - Usually: `public_html/` or `public_html/cecom.com.do/`

4. **Upload the ZIP file**
   - Click "Upload"
   - Select `cecom-cpanel-with-modules.zip`
   - Wait for upload (may take 10-20 minutes due to size)

5. **Extract the ZIP**
   - Right-click on the ZIP file
   - Select "Extract"
   - Extract to current directory
   - Delete ZIP after extraction

---

### **STEP 2: Create .env.local**

1. **In File Manager, create new file**: `.env.local`

2. **Add your production values** (from your local `.env.local`)

---

### **STEP 3: Setup Node.js App**

1. **Go to**: Software → Setup Node.js App

2. **Click**: "Create Application"

3. **Configure**:
   ```
   Node.js version:      20.19.4
   Application mode:     Production
   Application root:     /home/cecomcom/cecom-website
   Application URL:      cecom.com.do
   Application startup:  server.js
   ```

4. **Click**: "CREATE"

---

### **STEP 4: SKIP NPM INSTALL ⚠️**

**IMPORTANT**: Do NOT click "Run NPM Install"!

The node_modules are already included in the ZIP.

---

### **STEP 5: Note the Port**

After creating the app, note the "Application URL":
- Example: `http://127.0.0.1:3456`
- The number after `:` is your port (e.g., 3456)

---

### **STEP 6: Update .htaccess**

1. **In File Manager, edit** `.htaccess`

2. **Find line 14**:
   ```apache
   RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
   ```

3. **Change to YOUR port**:
   ```apache
   RewriteRule ^(.*)$ http://localhost:3456/$1 [P,L]
   ```

4. **Save**

---

### **STEP 7: Start the App**

1. **Go to**: Setup Node.js App

2. **Click**: "Start App"

3. **Wait for status**: "Running"

---

### **STEP 8: Test**

Visit: `https://cecom.com.do`

**Test these pages**:
- ✅ Homepage
- ✅ Solutions
- ✅ Blog
- ✅ Contact
- ✅ Admin panel
- ✅ Spanish version

---

## ✅ Deployment Checklist

```
□ Upload ZIP (444 MB)
□ Extract files
□ Create .env.local
□ Setup Node.js app (server.js)
□ SKIP NPM Install (already included!)
□ Note the port number
□ Update .htaccess
□ Start app
□ Test website
```

---

## 🎯 Key Differences from Previous Package

| Previous Package | This Package |
|------------------|--------------|
| 175 MB | 444 MB |
| No node_modules | ✅ Includes node_modules |
| Needs NPM Install | ❌ Skip NPM Install |
| May fail on low memory | ✅ Works on any cPanel |

---

## ⚠️ Important Notes

1. **DO NOT run NPM Install** - modules are already there
2. **Larger upload** - will take longer (10-20 min)
3. **Works on any cPanel** - no memory issues
4. **Update .htaccess** - don't forget the port!

---

## 🐛 Troubleshooting

### **App won't start**
- Check stderr.log for errors
- Verify .env.local exists and has all variables
- Ensure server.js is the startup file

### **502 Bad Gateway**
- Check port in .htaccess matches app port
- Verify app is running in cPanel

### **Images not loading**
- Verify public/ folder was extracted
- Check .next/static/ exists

---

## 📞 Need Help?

Check these guides:
- `docs/CPANEL-DEPLOYMENT-GUIDE.md`
- `docs/CPANEL-TROUBLESHOOTING.md`
- `MEMORY-REQUIREMENTS-REPORT.md`

---

**Ready to upload!** 🚀

The file is at: `/home/victor/cecom-website/cecom-cpanel-with-modules.zip`
