# 📚 cPanel Deployment Documentation

Complete documentation for deploying the CECOM website to cPanel without SSH access.

---

## 📖 Documentation Index

### 🚀 Getting Started

1. **[DEPLOYMENT-SUMMARY.md](../../DEPLOYMENT-SUMMARY.md)** - Start here!
   - Overview of all changes made
   - Quick reference for what was created
   - Essential information at a glance

2. **[CPANEL-QUICK-START.md](../CPANEL-QUICK-START.md)** - For experienced developers
   - 5-minute deployment guide
   - Essential commands only
   - Minimal explanations

3. **[CPANEL-VISUAL-GUIDE.md](../CPANEL-VISUAL-GUIDE.md)** - Step-by-step with visuals
   - Visual diagrams and examples
   - Screenshots descriptions
   - Perfect for first-time deployers

### 📋 Detailed Guides

4. **[CPANEL-DEPLOYMENT-GUIDE.md](../CPANEL-DEPLOYMENT-GUIDE.md)** - Complete reference
   - All deployment methods explained
   - Detailed configuration instructions
   - Security and performance tips
   - Post-deployment checklist

### 🐛 Troubleshooting

5. **[CPANEL-TROUBLESHOOTING.md](../CPANEL-TROUBLESHOOTING.md)** - Problem solving
   - Common issues and solutions
   - Error message explanations
   - Diagnostic commands
   - How to get help

---

## 🎯 Which Guide Should I Use?

### Choose Based on Your Experience:

```
┌─────────────────────────────────────────────┐
│  Are you experienced with Next.js & cPanel? │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
       YES                 NO
        │                   │
        ▼                   ▼
┌───────────────┐   ┌──────────────────┐
│ Quick Start   │   │  Visual Guide    │
│ Guide         │   │  (Recommended)   │
└───────────────┘   └──────────────────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Need more help? │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Full Deployment │
        │     Guide       │
        └─────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Having issues?  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Troubleshooting │
        │     Guide       │
        └─────────────────┘
```

---

## 🚀 Quick Start Path

### For Experienced Developers:

1. Read **DEPLOYMENT-SUMMARY.md** (5 min)
2. Follow **CPANEL-QUICK-START.md** (15 min)
3. Deploy! (30 min)

**Total Time: ~50 minutes**

---

## 🎓 Learning Path

### For First-Time Deployers:

1. Read **DEPLOYMENT-SUMMARY.md** (10 min)
2. Review **CPANEL-VISUAL-GUIDE.md** (20 min)
3. Reference **CPANEL-DEPLOYMENT-GUIDE.md** as needed (30 min)
4. Deploy following the visual guide (60 min)
5. Keep **CPANEL-TROUBLESHOOTING.md** handy

**Total Time: ~2 hours**

---

## 📁 File Structure

```
cecom-website/
├── DEPLOYMENT-SUMMARY.md          ← Overview of changes
├── server.js                      ← Node.js entry point
├── .htaccess                      ← Apache proxy config
├── .cpanel.yml                    ← Git deployment config
├── .env.production.example        ← Environment template
│
├── docs/
│   ├── CPANEL-DEPLOYMENT-GUIDE.md    ← Complete guide
│   ├── CPANEL-QUICK-START.md         ← Fast deployment
│   ├── CPANEL-VISUAL-GUIDE.md        ← Step-by-step visual
│   ├── CPANEL-TROUBLESHOOTING.md     ← Problem solving
│   └── deployment/
│       └── README.md                  ← This file
│
└── scripts/
    └── prepare-cpanel-deploy.sh   ← Deployment script
```

---

## 🔑 Key Concepts

### Why Not Static Export?

Your app uses these features that require a Node.js server:
- ✗ API routes (21 endpoints)
- ✗ Supabase authentication with cookies
- ✗ PayloadCMS admin panel
- ✗ Dynamic server-side rendering
- ✗ Middleware for internationalization

**Solution**: Deploy as Node.js application using cPanel's "Setup Node.js App"

### How It Works

```
User Request
    ↓
Domain (cecom.do)
    ↓
Apache (.htaccess)
    ↓
Proxy to Node.js App (port 3000+)
    ↓
Next.js Server (server.js)
    ↓
Your Application
    ↓
Response to User
```

### Critical Files

1. **server.js** - Custom Node.js server
   - Entry point for cPanel
   - Replaces `next start`

2. **.htaccess** - Apache configuration
   - Proxies requests to Node.js app
   - Must update with correct port

3. **.env.local** - Environment variables
   - Created on server (not in Git)
   - Contains all secrets and config

---

## ⚙️ Deployment Methods

### Method 1: Automated Script (Recommended)
```bash
./scripts/prepare-cpanel-deploy.sh
```
- Builds app
- Creates package
- Generates ZIP
- Ready to upload

### Method 2: Manual Build
```bash
npm run build
# Manually create ZIP with required files
```

### Method 3: FTP Upload
- Build locally
- Upload via FTP client
- No ZIP needed

### Method 4: Git Version Control
- Use cPanel Git integration
- Automatic deployment with `.cpanel.yml`
- Requires Git support in cPanel

**See full guide for detailed instructions on each method.**

---

## 🔧 Configuration Requirements

### Server Requirements:
- ✅ cPanel with Node.js support
- ✅ Node.js 18.x or 20.x
- ✅ Minimum 512MB RAM (2GB+ recommended)
- ✅ Apache with mod_rewrite
- ✅ File Manager or FTP access

### Application Requirements:
- ✅ Supabase project configured
- ✅ PostgreSQL database accessible
- ✅ PayloadCMS collections created
- ✅ All environment variables ready
- ✅ Domain DNS configured

---

## 📋 Deployment Checklist

### Pre-Deployment:
- [ ] Read documentation
- [ ] Gather all credentials
- [ ] Test build locally
- [ ] Prepare environment variables
- [ ] Backup current site (if updating)

### During Deployment:
- [ ] Run preparation script
- [ ] Upload files to cPanel
- [ ] Create .env.local
- [ ] Setup Node.js app
- [ ] Install dependencies
- [ ] Update .htaccess with port
- [ ] Start application

### Post-Deployment:
- [ ] Test all pages
- [ ] Verify features work
- [ ] Check both languages
- [ ] Test forms
- [ ] Monitor logs
- [ ] Set up monitoring

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ **Application Running**
- Status shows "Running" in cPanel
- No errors in stderr.log

✅ **Domain Accessible**
- Homepage loads at your domain
- All pages accessible
- No 404 errors

✅ **Features Working**
- Images display correctly
- Navigation works
- Forms submit successfully
- Blog posts load from Supabase
- Product catalog displays
- Admin panel accessible
- Both EN/ES languages work

✅ **Performance Good**
- Pages load in < 3 seconds
- No console errors
- Mobile responsive

---

## 🐛 Common Issues Quick Reference

| Issue | Quick Fix | Full Guide |
|-------|-----------|------------|
| 502 Bad Gateway | Check stderr.log, verify .env.local | Troubleshooting §2.1 |
| Module Not Found | Run NPM Install again | Troubleshooting §1.2 |
| Images Not Loading | Upload public/ folder | Troubleshooting §3.1 |
| API Routes 404 | Update .htaccess port | Troubleshooting §2.4 |
| Port Already in Use | Stop app, wait, restart | Troubleshooting §2.3 |
| Out of Memory | Build locally, upload .next | Troubleshooting §1.1 |

**See CPANEL-TROUBLESHOOTING.md for detailed solutions.**

---

## 📞 Support Resources

### Documentation:
- This documentation set
- Next.js docs: https://nextjs.org/docs
- cPanel docs: https://docs.cpanel.net

### Community:
- Next.js Discord
- Stack Overflow
- cPanel Forums

### Professional Help:
- Your hosting provider support
- Next.js consultants
- Web development agencies

---

## 🔄 Maintenance

### Regular Tasks:

**Weekly:**
- Check application logs
- Monitor error rates
- Verify backups

**Monthly:**
- Update dependencies
- Review security advisories
- Check performance metrics

**As Needed:**
- Deploy updates
- Fix issues
- Add features

### Update Process:
1. Build locally
2. Test thoroughly
3. Create deployment package
4. Upload to cPanel
5. Restart application
6. Verify everything works

---

## 📊 Monitoring

### What to Monitor:

1. **Application Status**
   - Check cPanel regularly
   - Ensure app stays running

2. **Error Logs**
   - Review stderr.log daily
   - Fix issues promptly

3. **Performance**
   - Page load times
   - Server response times
   - Resource usage

4. **Uptime**
   - Use monitoring service
   - Get alerts for downtime

### Recommended Tools:
- UptimeRobot (free uptime monitoring)
- Google Analytics (traffic & performance)
- Sentry (error tracking)
- LogRocket (session replay)

---

## 🔒 Security Best Practices

### Essential Security:

1. **Environment Variables**
   - Never commit .env.local
   - Use strong secrets
   - Rotate keys regularly

2. **Access Control**
   - Strong admin passwords
   - Enable 2FA where possible
   - Limit admin access

3. **HTTPS**
   - Always use SSL certificate
   - Force HTTPS redirect
   - Update HSTS headers

4. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

5. **Backups**
   - Regular database backups
   - File system backups
   - Test restore process

**See deployment guide for detailed security configuration.**

---

## 🎓 Learning Resources

### Next.js:
- [Official Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

### cPanel:
- [cPanel Documentation](https://docs.cpanel.net)
- [Node.js Selector](https://docs.cpanel.net/cpanel/software/application-manager/)

### Deployment:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🎉 Conclusion

You now have everything you need to deploy your Next.js application to cPanel!

### Next Steps:

1. **Choose your guide** based on experience level
2. **Gather credentials** for all services
3. **Run the preparation script**
4. **Follow the deployment guide**
5. **Test thoroughly**
6. **Monitor and maintain**

### Remember:

- 📖 Documentation is your friend
- 🐛 Check troubleshooting guide first
- 📞 Don't hesitate to ask for help
- ✅ Test everything after deployment
- 🔄 Keep backups updated

**Good luck with your deployment!** 🚀

---

**Documentation Version**: 1.0  
**Last Updated**: January 2025  
**Next.js Version**: 15.4.4  
**Supported Node.js**: 18.x, 20.x
