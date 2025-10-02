# 🚀 Quick Setup Guide - CECOM Email System

## Step 1: Create Environment File

Create a `.env.local` file in your project root with these **minimum required** variables:

```bash
# Supabase (You should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email System (Required)
ADMIN_EMAIL=admin@cecom.do
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# SMTP (Optional - leave empty for console logging)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=CECOM
SMTP_FROM_EMAIL=info@cecom.do

# Rate Limiting (Optional - leave empty to disable)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Step 2: Test the System

### Test Contact Form:
1. Go to `http://localhost:3000/contact` (or `/es/contact`)
2. Fill out and submit the form
3. Check your browser console - you should see:
   ```
   📧 Email would be sent:
   To: your-email@example.com
   Subject: Thank you for contacting CECOM
   From: CECOM <info@cecom.do>
   ---
   ```
4. Check your Supabase dashboard → `contact_submissions` table

### Test Newsletter:
1. Go to any blog page
2. Use the newsletter signup in the sidebar
3. Check console for email logs
4. Check Supabase dashboard → `newsletter_subscribers` table

## Step 3: Add Corporate Email (When Ready)

When you want real email sending, just update these variables:

```bash
SMTP_HOST=mail.cecom.do
SMTP_PORT=587
SMTP_USER=noreply@cecom.do
SMTP_PASS=your_password
```

## Step 4: Add Rate Limiting (Optional)

For production, sign up for [Upstash Redis](https://upstash.com/) (free tier available) and add:

```bash
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## ✅ What Works Right Now

- ✅ Contact form submission with auto-confirmation emails
- ✅ Newsletter subscription with welcome emails  
- ✅ Admin notification emails
- ✅ Database storage for all submissions
- ✅ Bilingual support (Spanish/English)
- ✅ Unsubscribe functionality
- ✅ Error handling and validation

## 🔧 Troubleshooting

**"Failed to execute 'json' on 'Response'"** → Fixed! The APIs now handle missing Redis gracefully.

**No emails being sent** → Expected! Check console logs. Add SMTP variables when ready.

**Database errors** → Make sure your Supabase connection is working and tables exist.

## 🎯 Next Steps

1. **Test everything works** with console logging
2. **Add your corporate SMTP** when ready for production
3. **Customize email templates** in `src/lib/email.ts`
4. **Monitor submissions** in Supabase dashboard

The system is **production-ready** and **modular** - start simple and enhance as needed!