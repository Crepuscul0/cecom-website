#!/bin/bash

# ============================================================================
# FTP Automated Deployment Script for cPanel
# ============================================================================
# This script automates deployment to cPanel via FTP
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# FTP Configuration
FTP_HOST="ftp.cecom.com.do"
FTP_USER="v.gonzalez@cecom.com.do"
FTP_PASS="ex6IW5N?BItt"
FTP_PORT="21"
REMOTE_DIR="/cecom-website"  # Adjust this to your actual remote directory

# Local paths
LOCAL_BUILD_DIR=".next"
LOCAL_PUBLIC_DIR="public"
LOCAL_MESSAGES_DIR="messages"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  FTP Automated Deployment to cPanel${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to test FTP connection
test_ftp_connection() {
    echo -e "${YELLOW}📡 Testing FTP connection...${NC}"
    
    ftp -n <<EOF
open $FTP_HOST $FTP_PORT
user $FTP_USER $FTP_PASS
pwd
bye
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ FTP connection successful!${NC}"
        return 0
    else
        echo -e "${RED}❌ FTP connection failed!${NC}"
        return 1
    fi
}

# Function to upload files via FTP
upload_via_ftp() {
    local local_file=$1
    local remote_path=$2
    
    echo -e "${YELLOW}📤 Uploading: $local_file${NC}"
    
    ftp -n <<EOF
open $FTP_HOST $FTP_PORT
user $FTP_USER $FTP_PASS
binary
cd $REMOTE_DIR
put $local_file $remote_path
bye
EOF
}

# Function to create remote directory
create_remote_dir() {
    local dir_path=$1
    
    echo -e "${YELLOW}📁 Creating directory: $dir_path${NC}"
    
    ftp -n <<EOF
open $FTP_HOST $FTP_PORT
user $FTP_USER $FTP_PASS
mkdir $REMOTE_DIR/$dir_path
bye
EOF
}

# Main deployment function
deploy() {
    echo -e "${YELLOW}🚀 Starting deployment...${NC}"
    echo ""
    
    # Step 1: Test connection
    if ! test_ftp_connection; then
        echo -e "${RED}❌ Cannot connect to FTP server. Aborting.${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}📦 Preparing deployment package...${NC}"
    
    # Step 2: Create ZIP of updated files
    if [ -f "cecom-cpanel-fast-images.zip" ]; then
        echo -e "${GREEN}✅ Using existing cecom-cpanel-fast-images.zip${NC}"
        ZIP_FILE="cecom-cpanel-fast-images.zip"
    else
        echo -e "${YELLOW}Creating new deployment package...${NC}"
        ZIP_FILE="ftp-deploy-$(date +%Y%m%d-%H%M%S).zip"
        zip -r $ZIP_FILE .next public messages server.js package.json next.config.mjs .htaccess -x "*.DS_Store" "*.git*"
    fi
    
    echo ""
    echo -e "${YELLOW}📤 Uploading to cPanel...${NC}"
    
    # Step 3: Upload ZIP file
    upload_via_ftp "$ZIP_FILE" "$(basename $ZIP_FILE)"
    
    echo ""
    echo -e "${GREEN}✅ Upload complete!${NC}"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Next Steps (Manual):${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "1. Login to cPanel File Manager"
    echo "2. Navigate to: $REMOTE_DIR"
    echo "3. Extract the uploaded ZIP file"
    echo "4. Delete the ZIP file"
    echo "5. Restart Node.js app in cPanel"
    echo ""
    echo -e "${YELLOW}⚠️  Note: Extraction and restart must be done via cPanel${NC}"
    echo ""
}

# Run deployment
deploy
