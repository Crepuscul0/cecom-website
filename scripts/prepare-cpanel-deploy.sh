#!/bin/bash

# ============================================================================
# cPanel Deployment Preparation Script
# ============================================================================
# This script prepares your Next.js app for cPanel deployment
# Run this before uploading to cPanel
# ============================================================================

set -e  # Exit on error

echo "🚀 Preparing CECOM Website for cPanel Deployment"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Clean previous builds
echo -e "${YELLOW}📦 Step 1: Cleaning previous builds...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Build the application
echo -e "${YELLOW}🔨 Step 3: Building application...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi
echo ""

# Step 4: Create deployment directory
echo -e "${YELLOW}📁 Step 4: Creating deployment package...${NC}"
DEPLOY_DIR="cpanel-deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
echo "Copying files..."
cp -r .next "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/"
cp -r messages "$DEPLOY_DIR/"
cp -r prisma "$DEPLOY_DIR/" 2>/dev/null || echo "No prisma folder found, skipping..."
cp server.js "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp next.config.mjs "$DEPLOY_DIR/"
cp i18n.ts "$DEPLOY_DIR/"
cp middleware.ts "$DEPLOY_DIR/"
cp payload.config.ts "$DEPLOY_DIR/"
cp components.json "$DEPLOY_DIR/"
cp tailwind.config.ts "$DEPLOY_DIR/"
cp tsconfig.json "$DEPLOY_DIR/"
cp postcss.config.js "$DEPLOY_DIR/"
cp .htaccess "$DEPLOY_DIR/"
cp .env.production.example "$DEPLOY_DIR/"

echo -e "${GREEN}✅ Files copied${NC}"
echo ""

# Step 5: Create deployment instructions
cat > "$DEPLOY_DIR/DEPLOY-INSTRUCTIONS.txt" << 'EOF'
CECOM Website - cPanel Deployment Instructions
===============================================

QUICK STEPS:
1. Upload all files in this folder to your cPanel domain root (e.g., public_html/)
2. Create .env.local file with your production environment variables (see .env.production.example)
3. In cPanel, go to Software → Setup Node.js App
4. Create new application:
   - Node.js version: 18.x or 20.x
   - Application mode: Production
   - Application root: /home/username/public_html (your path)
   - Application URL: yourdomain.com
   - Application startup file: server.js
5. Click "Run NPM Install" (wait 5-10 minutes)
6. Click "Start App"
7. Note the port number from Application URL
8. Update .htaccess line 13 with the correct port
9. Visit your domain

IMPORTANT:
- DO NOT upload node_modules folder (install on server)
- Create .env.local on server with production values
- Update .htaccess with correct port number
- Ensure domain DNS points to cPanel server

For detailed instructions, see:
docs/CPANEL-DEPLOYMENT-GUIDE.md

Troubleshooting:
- Check stdout.log and stderr.log in cPanel Node.js App
- Verify all environment variables are set
- Ensure port in .htaccess matches app port
- Restart app if needed

EOF

echo -e "${GREEN}✅ Deployment instructions created${NC}"
echo ""

# Step 6: Calculate package size
PACKAGE_SIZE=$(du -sh "$DEPLOY_DIR" | cut -f1)
echo -e "${YELLOW}📊 Deployment Package Info:${NC}"
echo "   Location: $DEPLOY_DIR"
echo "   Size: $PACKAGE_SIZE"
echo ""

# Step 7: Create ZIP file (optional)
echo -e "${YELLOW}📦 Step 5: Creating ZIP file...${NC}"
ZIP_FILE="${DEPLOY_DIR}.zip"
cd "$DEPLOY_DIR"
zip -r "../$ZIP_FILE" . -x "*.DS_Store" > /dev/null
cd ..
ZIP_SIZE=$(du -sh "$ZIP_FILE" | cut -f1)
echo -e "${GREEN}✅ ZIP file created: $ZIP_FILE ($ZIP_SIZE)${NC}"
echo ""

# Step 8: Final checklist
echo -e "${GREEN}✅ Deployment package ready!${NC}"
echo ""
echo -e "${YELLOW}📋 Pre-Upload Checklist:${NC}"
echo "   [ ] Build completed successfully"
echo "   [ ] .env.production.example reviewed"
echo "   [ ] server.js present"
echo "   [ ] .htaccess present"
echo "   [ ] All config files included"
echo ""
echo -e "${YELLOW}📋 Post-Upload Checklist:${NC}"
echo "   [ ] Create .env.local on server"
echo "   [ ] Setup Node.js app in cPanel"
echo "   [ ] Run NPM Install"
echo "   [ ] Update .htaccess with correct port"
echo "   [ ] Start application"
echo "   [ ] Test all features"
echo ""
echo -e "${YELLOW}📦 Next Steps:${NC}"
echo "   1. Upload $ZIP_FILE to cPanel File Manager"
echo "   2. Extract the ZIP file"
echo "   3. Follow instructions in DEPLOY-INSTRUCTIONS.txt"
echo "   4. See docs/CPANEL-DEPLOYMENT-GUIDE.md for detailed guide"
echo ""
echo -e "${GREEN}🎉 Preparation complete!${NC}"
