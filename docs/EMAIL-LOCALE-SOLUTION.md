# 📧 Email Locale Solution

## 🎯 Goal
Send emails in the user's preferred language (Spanish or English) based on their registration choice.

---

## 🔍 Current Situation

**Problem:**
- Email templates are currently hardcoded in Spanish
- No way to detect user's language preference
- Supabase sends same template to all users

---

## ✅ Solution Options

### **Option 1: Store Locale in User Profile** (Recommended)

#### **Step 1: Add Locale Column to Database**

```sql
-- Add locale column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN preferred_locale VARCHAR(5) DEFAULT 'es';

-- Update existing users
UPDATE user_profiles 
SET preferred_locale = 'es' 
WHERE preferred_locale IS NULL;
```

#### **Step 2: Capture Locale During Registration**

Update `SignUpForm.tsx` to capture and store locale:

```typescript
// Get current locale
const locale = useLocale(); // 'en' or 'es'

// Include in signup
const { error } = await signUp(email, password, {
  first_name: firstName,
  last_name: lastName,
  preferred_locale: locale // Store user's choice
});
```

#### **Step 3: Use Supabase Custom SMTP (Advanced)**

Supabase doesn't natively support per-user template selection, but you can:

1. **Disable Supabase default emails**
2. **Send custom emails via your own SMTP**
3. **Select template based on user's `preferred_locale`**

---

### **Option 2: Bilingual Email Template** (Quick Solution)

Create ONE template with BOTH languages:

```html
<!-- Spanish Section -->
<div lang="es">
  <h2>Restablecer Contraseña</h2>
  <p>Hola,</p>
  <p>Recibimos una solicitud para restablecer tu contraseña...</p>
</div>

<!-- Divider -->
<hr style="margin: 30px 0; border: 1px solid #e5e7eb;" />

<!-- English Section -->
<div lang="en">
  <h2>Reset Password</h2>
  <p>Hello,</p>
  <p>We received a request to reset your password...</p>
</div>
```

**Pros:**
- ✅ Simple to implement
- ✅ Works immediately
- ✅ No code changes needed

**Cons:**
- ❌ Email is longer
- ❌ Both languages shown to everyone
- ❌ Less professional

---

### **Option 3: Custom Email Service** (Best Long-term)

Build your own email service that:

1. **Hooks into Supabase auth events**
2. **Reads user's `preferred_locale` from database**
3. **Selects appropriate template**
4. **Sends via your SMTP (SendGrid, AWS SES, etc.)**

#### **Implementation:**

```typescript
// src/lib/email-service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string, 
  resetUrl: string,
  locale: 'en' | 'es'
) {
  const templates = {
    es: {
      subject: 'Restablecer Contraseña - CECOM',
      html: getSpanishTemplate(resetUrl)
    },
    en: {
      subject: 'Reset Password - CECOM',
      html: getEnglishTemplate(resetUrl)
    }
  };

  const template = templates[locale];

  await resend.emails.send({
    from: 'CECOM <noreply@cecom.com.do>',
    to: email,
    subject: template.subject,
    html: template.html
  });
}
```

#### **Supabase Webhook:**

```typescript
// src/app/api/webhooks/auth/route.ts
export async function POST(request: Request) {
  const event = await request.json();

  if (event.type === 'user.password_reset_requested') {
    const user = event.user;
    
    // Get user's locale from database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferred_locale')
      .eq('id', user.id)
      .single();

    // Send email in user's language
    await sendPasswordResetEmail(
      user.email,
      event.reset_url,
      profile?.preferred_locale || 'es'
    );
  }

  return Response.json({ success: true });
}
```

---

## 📊 Comparison

| Solution | Complexity | Cost | User Experience | Maintenance |
|----------|-----------|------|-----------------|-------------|
| **Bilingual Template** | ⭐ Easy | Free | ⭐⭐ Fair | ⭐⭐⭐ Easy |
| **Store Locale + Custom SMTP** | ⭐⭐⭐ Hard | $$ | ⭐⭐⭐ Excellent | ⭐⭐ Medium |
| **Supabase Default** | ⭐ Easy | Free | ⭐ Poor (one language) | ⭐⭐⭐ Easy |

---

## 🎯 Recommended Approach

### **Phase 1: Quick Fix (Now)**
Use **bilingual template** - both languages in one email

### **Phase 2: Better Solution (Later)**
1. Add `preferred_locale` column to database
2. Capture locale during registration
3. Implement custom email service with Resend/SendGrid
4. Create separate EN/ES templates
5. Send appropriate template based on user's locale

---

## 🚀 Implementation Steps

### **Immediate (Bilingual Template):**

1. Update email templates to include both languages
2. Apply to Supabase dashboard
3. Done! ✅

### **Long-term (Custom Service):**

1. **Database:**
   ```sql
   ALTER TABLE user_profiles ADD COLUMN preferred_locale VARCHAR(5) DEFAULT 'es';
   ```

2. **Signup Form:**
   ```typescript
   // Capture locale during registration
   const locale = useLocale();
   await signUp(email, password, { preferred_locale: locale });
   ```

3. **Email Service:**
   - Choose provider (Resend, SendGrid, AWS SES)
   - Create separate EN/ES templates
   - Build email sending function

4. **Webhook:**
   - Create API endpoint for Supabase webhooks
   - Fetch user's locale
   - Send appropriate template

5. **Disable Supabase Emails:**
   - Turn off default Supabase email templates
   - Use your custom service instead

---

## 💡 Example: Bilingual Template

```html
<!DOCTYPE html>
<html>
<body>
  <!-- Logo Header -->
  <div style="text-align: center; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px;">
    <img src="https://cecom.com.do/logos/cecom-logo-white.svg" alt="CECOM" style="height: 50px;" />
  </div>

  <!-- Spanish Content -->
  <div style="padding: 40px;" lang="es">
    <h2>🇪🇸 Restablecer Contraseña</h2>
    <p>Hola,</p>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
      Restablecer Contraseña
    </a>
  </div>

  <!-- Divider -->
  <hr style="margin: 0 40px; border: 1px solid #e5e7eb;" />

  <!-- English Content -->
  <div style="padding: 40px;" lang="en">
    <h2>🇺🇸 Reset Password</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password.</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
      Reset Password
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 40px; background: #f9fafb;">
    <p>CECOM | Technology Solutions</p>
    <p>cecom.com.do</p>
  </div>
</body>
</html>
```

---

## 📝 Summary

**Your Question:** Can email templates remember user's locale?

**Answer:** 
- ✅ Yes, but requires custom implementation
- 🚀 **Quick solution:** Bilingual template (both languages)
- 🎯 **Best solution:** Store locale + custom email service
- ⏰ **Timeline:** Bilingual now, custom service later

---

## 🔗 Resources

- [Supabase Auth Webhooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [Resend Email Service](https://resend.com)
- [SendGrid](https://sendgrid.com)
- [AWS SES](https://aws.amazon.com/ses/)

---

**Would you like me to implement the bilingual template now, or set up the database for the custom solution?** 🚀
