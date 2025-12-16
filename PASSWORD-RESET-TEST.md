# 🧪 Password Reset - Testing Guide

## ✅ What Was Fixed

### **1. Enabled URL Detection**
**File**: `src/lib/supabase.ts`
- Changed `detectSessionInUrl: false` → `detectSessionInUrl: true`
- Now Supabase automatically detects and processes auth tokens from URL

### **2. Simplified Reset Page**
**File**: `src/app/auth/reset-password/page.tsx`
- Removed manual token extraction
- Just checks for valid session after Supabase processes URL
- Added 500ms delay to let Supabase process the hash

---

## 🧪 How to Test

### **Step 1: Start Dev Server**
```bash
npm run dev
```

### **Step 2: Request Password Reset**
1. Go to: http://localhost:3000/auth
2. Click: "¿Olvidaste tu contraseña?"
3. Enter your email: admin@cecom.com.do
4. Click: "Enviar enlace de recuperación"
5. See success message

### **Step 3: Check Email**
1. Open your email inbox
2. Find email from Supabase
3. Click the reset password link

### **Step 4: Reset Password**
1. Should redirect to: http://localhost:3000/auth/reset-password#access_token=...
2. **Should NOT see "auth session missing" error**
3. Should see password reset form
4. Enter new password (min 6 chars)
5. Confirm password
6. Click "Actualizar Contraseña"

### **Step 5: Verify Success**
1. Should see success message
2. Auto-redirect to /auth in 2 seconds
3. Login with new password
4. Should work! ✅

---

## 🔍 What to Look For

### **✅ Success Indicators:**
- Reset page loads without errors
- Form is visible and functional
- Password update succeeds
- Redirect to login works
- Can login with new password

### **❌ Error Indicators:**
- "auth session missing" error
- "Enlace de recuperación inválido o expirado"
- Form doesn't appear
- Password update fails

---

## 🐛 If Still Having Issues

### **Check Browser Console:**
```javascript
// Open DevTools Console and run:
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data.session)
console.log('Error:', error)
```

### **Check URL:**
The reset URL should look like:
```
http://localhost:3000/auth/reset-password#access_token=xxx&refresh_token=yyy&type=recovery
```

### **Check Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard
2. Select: CECOM CMS project
3. Navigate to: Authentication → Users
4. Find your user
5. Check if email is confirmed

---

## 🔧 Troubleshooting

### **Issue: "auth session missing"**
**Solution**: 
- Clear browser cache and cookies
- Try in incognito mode
- Check that `detectSessionInUrl: true` in supabase.ts

### **Issue: Link expired**
**Solution**:
- Links expire after 1 hour
- Request a new reset link
- Use it immediately

### **Issue: Email not received**
**Solution**:
- Check spam folder
- Verify email in Supabase dashboard
- Check Supabase email settings

### **Issue: Password update fails**
**Solution**:
- Ensure password is at least 6 characters
- Ensure passwords match
- Check browser console for errors

---

## 📊 Expected Flow

```
1. Request reset
   ↓
2. Receive email
   ↓
3. Click link
   ↓
4. Supabase detects tokens in URL ✅
   ↓
5. Session established ✅
   ↓
6. Form appears ✅
   ↓
7. Enter new password
   ↓
8. Update succeeds ✅
   ↓
9. Redirect to login ✅
   ↓
10. Login with new password ✅
```

---

## ✅ Verification Checklist

```
□ Dev server running
□ Navigate to /auth
□ Click forgot password link
□ Enter email
□ Check inbox
□ Email received
□ Click reset link
□ Page loads without error
□ Form is visible
□ Enter new password
□ Confirm password
□ Click update button
□ Success message appears
□ Redirect to login
□ Login with new password works
```

---

## 🎯 Key Changes

| What | Before | After |
|------|--------|-------|
| URL Detection | ❌ Disabled | ✅ Enabled |
| Session Handling | ❌ Manual | ✅ Automatic |
| Error Handling | ❌ Complex | ✅ Simple |
| Reliability | ❌ Inconsistent | ✅ Reliable |

---

**Test it now and it should work!** 🚀

If you still see "auth session missing", let me know and we'll debug further.
