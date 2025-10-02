# 📧 SMTP Troubleshooting Guide

## Current Issue
Getting `[Error: Greeting never received] { code: 'ETIMEDOUT', command: 'CONN' }` when trying to send emails.

## ✅ What I Fixed
1. **Port 465 + SSL**: Changed `SMTP_SECURE=true` (port 465 requires SSL)
2. **Email consistency**: Fixed admin email to match `noreply@cecom.do`
3. **Connection timeouts**: Added longer timeout values
4. **TLS settings**: Added `rejectUnauthorized: false` for development

## 🔧 Alternative SMTP Configurations to Try

### Option 1: Port 587 with STARTTLS (Recommended)
```bash
SMTP_HOST=mail.cecom.com.do
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@cecom.do
SMTP_PASS=fn?cXCx#&X3i
```

### Option 2: Port 465 with SSL (Current)
```bash
SMTP_HOST=mail.cecom.com.do
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@cecom.do
SMTP_PASS=fn?cXCx#&X3i
```

### Option 3: Alternative Host
```bash
SMTP_HOST=smtp.cecom.com.do
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@cecom.do
SMTP_PASS=fn?cXCx#&X3i
```

## 🧪 Testing Steps

1. **Test current config** - Try the contact form again
2. **Check server logs** for detailed SMTP connection info
3. **Try Option 1** if current fails (port 587)
4. **Contact your email provider** for correct SMTP settings

## 📊 What's Working Now

✅ **Database**: Contact forms save successfully  
✅ **Rate limiting**: Upstash Redis working  
✅ **Form validation**: All validation working  
✅ **Email templates**: Templates render correctly  

❌ **SMTP connection**: Timeout connecting to mail server

## 🔍 Debug Information

The logs show:
- ✅ Form submission processed
- ✅ Database insert successful  
- ✅ Email template generated
- ❌ SMTP connection timeout

## 📞 Next Steps

1. **Try the updated config** (port 465 + SSL)
2. **If still failing**, try port 587 + STARTTLS
3. **Contact CECOM IT** to verify:
   - SMTP server address
   - Port and security settings
   - Account credentials
   - Firewall/network restrictions

## 🚀 Temporary Solution

If SMTP continues to fail, the system will:
- ✅ Still save all contact submissions to database
- ✅ Show success message to users
- ❌ Skip email sending (logged as error)
- 📧 You can manually follow up using the database records

The core functionality works - just need to get SMTP connection working!