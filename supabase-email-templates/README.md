# 📧 CECOM Email Templates for Supabase

Custom branded email templates for authentication emails.

---

## 📁 Templates Included

1. **`reset-password.html`** - Password reset email
2. **`confirm-signup.html`** - Email confirmation for new users

---

## 🎨 Design Features

- ✅ CECOM branding with blue gradient header
- ✅ Professional layout
- ✅ Mobile responsive
- ✅ Clear call-to-action buttons
- ✅ Security warnings
- ✅ Fallback text links
- ✅ Company footer

---

## 🚀 How to Apply Templates

### **Step 1: Access Supabase Dashboard**

1. Go to: https://supabase.com/dashboard
2. Select your project: **CECOM CMS**
3. Navigate to: **Authentication** → **Email Templates**

---

### **Step 2: Update Reset Password Template**

1. Click on **"Reset Password"** template
2. Copy the content from `reset-password.html`
3. Paste into the template editor
4. Click **"Save"**

**Template Variables Used:**
- `{{ .ConfirmationURL }}` - The password reset link

---

### **Step 3: Update Confirm Signup Template**

1. Click on **"Confirm Signup"** template
2. Copy the content from `confirm-signup.html`
3. Paste into the template editor
4. Click **"Save"**

**Template Variables Used:**
- `{{ .ConfirmationURL }}` - The email confirmation link

---

## 📋 Template Customization

### **Change Colors:**

Current brand colors:
```css
Primary Blue: #2563eb
Dark Blue: #1e40af
Light Blue: #3b82f6
```

To change, find and replace these hex codes in the HTML.

### **Change Company Name:**

Find and replace "CECOM" with your desired name.

### **Change Domain:**

Find and replace "cecom.com.do" with your domain.

---

## 🧪 Testing

### **Test Password Reset:**

1. Go to: https://cecom.com.do/auth
2. Click "¿Olvidaste tu contraseña?"
3. Enter your email
4. Check your inbox
5. Verify the email looks correct

### **Test Signup Confirmation:**

1. Create a new account
2. Check your inbox
3. Verify the email looks correct

---

## 📱 Mobile Responsive

The templates are designed to work on:
- ✅ Desktop email clients (Outlook, Apple Mail, etc.)
- ✅ Web email (Gmail, Yahoo, etc.)
- ✅ Mobile devices (iOS Mail, Android Gmail, etc.)

---

## 🎯 Email Preview

### **Reset Password Email:**
```
┌─────────────────────────────────┐
│   CECOM (Blue Gradient Header)  │
│   Technology Solutions          │
├─────────────────────────────────┤
│                                 │
│   Restablecer Contraseña        │
│                                 │
│   Hola,                         │
│                                 │
│   Recibimos una solicitud...    │
│                                 │
│   [Restablecer Contraseña]      │
│                                 │
│   ⚠️ Este enlace expira en 1h   │
│                                 │
├─────────────────────────────────┤
│   CECOM Footer                  │
│   cecom.com.do                  │
└─────────────────────────────────┘
```

---

## 🔐 Security Features

- ✅ Clear expiration warnings
- ✅ Instructions to ignore if not requested
- ✅ No sensitive information exposed
- ✅ Secure HTTPS links only

---

## 📝 Supabase Template Variables

Available variables you can use:

- `{{ .ConfirmationURL }}` - Confirmation/reset link
- `{{ .Token }}` - Raw token (not recommended to show)
- `{{ .TokenHash }}` - Token hash
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email

---

## 🎨 Customization Tips

### **Add Logo:**

Replace the text "CECOM" with an image:

```html
<img src="https://cecom.com.do/logos/cecom-logo-white.svg" 
     alt="CECOM" 
     style="height: 40px; width: auto;">
```

### **Change Button Color:**

Find the button style and change `background-color`:

```html
style="background-color: #your-color-here;"
```

### **Add Social Links:**

Add to the footer:

```html
<p style="margin: 8px 0 0;">
  <a href="https://facebook.com/cecom">Facebook</a> | 
  <a href="https://twitter.com/cecom">Twitter</a>
</p>
```

---

## ✅ Checklist

After applying templates:

```
□ Reset password template updated
□ Confirm signup template updated
□ Test password reset flow
□ Test signup confirmation flow
□ Check mobile rendering
□ Verify links work correctly
□ Check spam folder if not received
```

---

## 🆘 Troubleshooting

### **Emails not sending:**
- Check Supabase email settings
- Verify SMTP configuration
- Check spam folder

### **Template not updating:**
- Clear browser cache
- Wait a few minutes for propagation
- Try in incognito mode

### **Styling broken:**
- Ensure no syntax errors in HTML
- Test in different email clients
- Use inline styles (required for emails)

---

## 📚 Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Email HTML Best Practices](https://www.campaignmonitor.com/css/)
- [Test Email Rendering](https://www.emailonacid.com/)

---

**Templates are ready to use!** 🎉

Just copy and paste them into your Supabase dashboard.
