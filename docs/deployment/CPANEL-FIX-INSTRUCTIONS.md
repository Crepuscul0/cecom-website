# 🔧 cPanel Deployment Fix

## ❌ Problem Identified

The app isn't starting because of incorrect directory structure in cPanel.

### **Current Setup (WRONG):**
```
Application root: cecom-website
Application startup file: server.js
```

This tries to run the root `server.js` which expects a standard Next.js structure, but we have a **standalone build** in a subfolder.

---

## ✅ Solution: Use Standalone Directory

### **Option 1: Extract to Standalone Folder (Recommended)**

When you extract the ZIP in cPanel:

1. **Extract the ZIP**
2. **Navigate into the extracted folder**
3. **Go into the `standalone/` subfolder**
4. **This is your application root!**

### **cPanel Configuration:**

```
Application root: /home/cecomcom/cecom-website/standalone
Application startup file: server.js
Application mode: Production
Node.js version: 20.19.4
```

The `standalone/` folder contains:
- ✅ `server.js` (Next.js standalone server)
- ✅ `.next/` (build output)
- ✅ `node_modules/` (dependencies)
- ✅ `public/` (static files)
- ✅ `messages/` (translations)
- ✅ `package.json`

---

## 🎯 Step-by-Step Fix

### **Step 1: Stop Current App**
In cPanel → Setup Node.js App → STOP APP

### **Step 2: Update Application Root**
Change from:
```
/home/cecomcom/cecom-website
```

To:
```
/home/cecomcom/cecom-website/standalone
```

### **Step 3: Verify Startup File**
Should be:
```
server.js
```
(This is the server.js INSIDE the standalone folder)

### **Step 4: Create .env.local**
In `/home/cecomcom/cecom-website/standalone/.env.local`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
PAYLOAD_SECRET="..."
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://cecom.com.do"
PORT=3000
```

### **Step 5: Start App**
Setup Node.js App → START

### **Step 6: Note the Port**
After starting, note the port number (e.g., 3456)

### **Step 7: Update .htaccess**
Edit `/home/cecomcom/cecom-website/.htaccess`:

```apache
RewriteRule ^(.*)$ http://localhost:YOUR_PORT/$1 [P,L]
```

Replace `YOUR_PORT` with the actual port.

### **Step 8: Test**
Visit: https://cecom.com.do

---

## 📁 Correct Directory Structure

After extraction, your structure should be:

```
/home/cecomcom/cecom-website/
├── standalone/              ← THIS IS YOUR APP ROOT!
│   ├── server.js           ← Startup file
│   ├── .next/              ← Build output
│   ├── node_modules/       ← Dependencies
│   ├── public/             ← Static files
│   ├── messages/           ← Translations
│   ├── package.json
│   └── .env.local          ← Create this!
├── .htaccess               ← Apache config (in parent)
├── node_modules/           ← Extra modules (not needed)
└── other files...
```

---

## 🔍 Why This Happens

Next.js `output: 'standalone'` creates a self-contained build in `.next/standalone/` that includes:
- Its own server.js
- Its own node_modules (only production deps)
- All necessary files

This is designed to run independently, which is perfect for cPanel!

---

## ⚠️ Common Mistakes

### **Mistake 1: Wrong Application Root**
❌ `/home/cecomcom/cecom-website`  
✅ `/home/cecomcom/cecom-website/standalone`

### **Mistake 2: Wrong server.js**
❌ Root server.js (custom one)  
✅ standalone/server.js (Next.js generated)

### **Mistake 3: Missing .env.local**
❌ No environment variables  
✅ Create .env.local in standalone/ folder

### **Mistake 4: Wrong .htaccess location**
❌ Inside standalone/  
✅ In parent directory (/home/cecomcom/cecom-website/)

---

## 🎯 Quick Fix Checklist

```
□ Stop app in cPanel
□ Change Application root to: .../standalone
□ Verify startup file: server.js
□ Create .env.local in standalone/ folder
□ Start app
□ Note the port number
□ Update .htaccess with correct port
□ Test website
```

---

## 📊 Before vs After

### **Before (Not Working):**
```
App Root: /home/cecomcom/cecom-website
Startup:  server.js (wrong one)
Status:   Error - can't find Next.js
```

### **After (Working):**
```
App Root: /home/cecomcom/cecom-website/standalone
Startup:  server.js (standalone build)
Status:   Running ✅
```

---

## 🚀 Alternative: Flatten the Structure

If you prefer not to use the standalone subfolder, you can:

1. Extract the ZIP
2. Move everything from `standalone/` to the root
3. Delete the empty `standalone/` folder
4. Use `/home/cecomcom/cecom-website` as app root

**Commands in cPanel Terminal:**
```bash
cd /home/cecomcom/cecom-website
mv standalone/* .
mv standalone/.next .
mv standalone/.env .
rmdir standalone
```

Then use:
```
Application root: /home/cecomcom/cecom-website
Application startup file: server.js
```

---

## 📞 Troubleshooting

### **App Still Won't Start?**

1. **Check stderr.log** in cPanel
2. **Verify .env.local exists** in the correct location
3. **Check file permissions** (should be 644)
4. **Verify Node.js version** (20.19.4)
5. **Check if port is available**

### **502 Bad Gateway?**

1. **Check .htaccess port** matches app port
2. **Verify app is running** in cPanel
3. **Check Apache logs**

### **Images Not Loading?**

1. **Verify public/ folder** is in standalone/
2. **Check .next/static/** exists
3. **Verify .htaccess** proxy rules

---

## ✅ Expected Result

After fixing:
- ✅ App starts successfully
- ✅ Website loads at https://cecom.com.do
- ✅ Images load fast
- ✅ All pages work
- ✅ Forms submit
- ✅ No errors in console

---

**The key is using the `standalone/` folder as your application root!**
