#!/bin/bash

# ============================================================================
# Complete cPanel Deployment Script
# ============================================================================
# This script builds and packages everything needed for cPanel deployment
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  CECOM Website - Complete cPanel Deployment Package${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Clean previous builds
echo -e "${YELLOW}📦 Step 1: Cleaning previous builds...${NC}"
rm -rf .next
rm -rf cpanel-deployment-package
rm -f cecom-complete-with-modules.zip
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Build the application
echo -e "${YELLOW}🔨 Step 3: Building Next.js application...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 4: Create deployment package directory
echo -e "${YELLOW}📁 Step 4: Creating deployment package...${NC}"
mkdir -p cpanel-deployment-package

# Copy standalone build
cp -r .next/standalone/* cpanel-deployment-package/

# Copy static files to standalone
mkdir -p cpanel-deployment-package/public
cp -r public/* cpanel-deployment-package/public/

mkdir -p cpanel-deployment-package/.next/static
cp -r .next/static/* cpanel-deployment-package/.next/static/

# Copy messages
cp -r messages cpanel-deployment-package/

# Copy configuration files
cp next.config.mjs cpanel-deployment-package/
cp package.json cpanel-deployment-package/
cp package-lock.json cpanel-deployment-package/

# Copy .htaccess to parent level (not in standalone)
cp .htaccess cpanel-deployment-package/../.htaccess-for-parent

echo -e "${GREEN}✅ Deployment package created${NC}"
echo ""

# Step 5: Install production dependencies in package
echo -e "${YELLOW}📦 Step 5: Installing production dependencies...${NC}"
cd cpanel-deployment-package
npm install --production --omit=dev
cd ..
echo -e "${GREEN}✅ Production dependencies installed${NC}"
echo ""

# Step 6: Create ZIP file
echo -e "${YELLOW}📦 Step 6: Creating ZIP file...${NC}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ZIP_NAME="cecom-cpanel-deploy-${TIMESTAMP}.zip"

cd cpanel-deployment-package
zip -r ../${ZIP_NAME} . -x "*.DS_Store" "*.git*" > /dev/null 2>&1
cd ..

FILE_SIZE=$(ls -lh ${ZIP_NAME} | awk '{print $5}')
echo -e "${GREEN}✅ ZIP created: ${ZIP_NAME} (${FILE_SIZE})${NC}"
echo ""

# Step 7: Create deployment instructions
echo -e "${YELLOW}📝 Step 7: Creating deployment instructions...${NC}"

cat > DEPLOY-INSTRUCTIONS-${TIMESTAMP}.txt << EOF
═══════════════════════════════════════════════════════════════
  CECOM Website - cPanel Deployment Instructions
═══════════════════════════════════════════════════════════════

Package: ${ZIP_NAME}
Size: ${FILE_SIZE}
Created: $(date)

═══════════════════════════════════════════════════════════════
  DEPLOYMENT STEPS
═══════════════════════════════════════════════════════════════

1. UPLOAD VIA FTP (Automated)
   ─────────────────────────────────────────────────────────────
   Run: python3 scripts/ftp-deploy.py
   
   Or manually upload ${ZIP_NAME} to cPanel

2. EXTRACT IN CPANEL
   ─────────────────────────────────────────────────────────────
   - Login to cPanel File Manager
   - Navigate to /home/cecomcom/
   - Upload ${ZIP_NAME}
   - Right-click → Extract
   - Extract to: cecom-website/standalone/
   - Delete ZIP after extraction

3. CREATE .env.local
   ─────────────────────────────────────────────────────────────
   Location: /home/cecomcom/cecom-website/standalone/.env.local
   
   Required variables:
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="https://..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   PAYLOAD_SECRET="..."
   NODE_ENV="production"
   NEXT_PUBLIC_SITE_URL="https://cecom.com.do"

4. SETUP NODE.JS APP (First Time Only)
   ─────────────────────────────────────────────────────────────
   - Go to: Software → Setup Node.js App
   - Click: "CREATE APPLICATION"
   
   Configuration:
   Node.js version:      20.19.4
   Application mode:     Production
   Application root:     cecom-website/standalone
   Application URL:      cecom.com.do
   Application startup:  server.js
   
   - Click: "CREATE"
   - SKIP: "Run NPM Install" (already included!)

5. NOTE THE PORT
   ─────────────────────────────────────────────────────────────
   After creation, note the port number from:
   Application URL: http://127.0.0.1:XXXX
   
   Example: If you see http://127.0.0.1:3456
   Your port is: 3456

6. UPDATE .htaccess
   ─────────────────────────────────────────────────────────────
   Location: /home/cecomcom/cecom-website/.htaccess
   
   Update line 14:
   RewriteRule ^(.*)$ http://localhost:YOUR_PORT/\$1 [P,L]
   
   Replace YOUR_PORT with the actual port number

7. START APP
   ─────────────────────────────────────────────────────────────
   - Setup Node.js App → START
   - Wait for status: "Running"

8. TEST
   ─────────────────────────────────────────────────────────────
   Visit: https://cecom.com.do
   
   Check:
   ✓ Homepage loads
   ✓ Images load fast
   ✓ All pages work
   ✓ Forms submit
   ✓ Blog displays
   ✓ Admin accessible

═══════════════════════════════════════════════════════════════
  FOR UPDATES (After First Deployment)
═══════════════════════════════════════════════════════════════

1. Upload new ZIP via FTP
2. Extract to: cecom-website/standalone/ (overwrite)
3. Restart app in cPanel
4. Test website

No need to recreate Node.js app or update .htaccess!

═══════════════════════════════════════════════════════════════
  TROUBLESHOOTING
═══════════════════════════════════════════════════════════════

App won't start?
→ Check stderr.log in cPanel
→ Verify .env.local exists in standalone/
→ Check Node.js version (20.19.4)

502 Bad Gateway?
→ Verify .htaccess port matches app port
→ Check app is running in cPanel

Images not loading?
→ Verify public/ folder in standalone/
→ Check .next/static/ exists

═══════════════════════════════════════════════════════════════
  PACKAGE CONTENTS
═══════════════════════════════════════════════════════════════

✓ server.js              - Node.js entry point
✓ .next/                 - Build output (optimized)
✓ node_modules/          - All dependencies
✓ public/                - Static assets
✓ messages/              - Translations (EN/ES)
✓ package.json           - Dependencies list
✓ next.config.mjs        - Next.js config
✓ All other configs

═══════════════════════════════════════════════════════════════

Ready to deploy! 🚀
EOF

echo -e "${GREEN}✅ Instructions created: DEPLOY-INSTRUCTIONS-${TIMESTAMP}.txt${NC}"
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ DEPLOYMENT PACKAGE READY!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Package:${NC} ${ZIP_NAME}"
echo -e "${GREEN}Size:${NC} ${FILE_SIZE}"
echo -e "${GREEN}Instructions:${NC} DEPLOY-INSTRUCTIONS-${TIMESTAMP}.txt"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload via FTP: ${BLUE}python3 scripts/ftp-deploy.py${NC}"
echo "2. Extract in cPanel to: ${BLUE}cecom-website/standalone/${NC}"
echo "3. Create .env.local in standalone/"
echo "4. Setup Node.js app (if first time)"
echo "5. Start app and test!"
echo ""
echo -e "${GREEN}🚀 Ready to deploy!${NC}"
echo ""
