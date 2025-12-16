#!/usr/bin/env python3
"""
FTP Automated Deployment Script for cPanel
Uploads deployment package to cPanel via FTP
"""

import ftplib
import os
import sys
from pathlib import Path
from datetime import datetime

# Configuration
FTP_HOST = "ftp.cecom.com.do"
FTP_USER = "v.gonzalez@cecom.com.do"
FTP_PASS = "ex6IW5N?BItt"
FTP_PORT = 21

# Colors for terminal output
class Colors:
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def print_header(text):
    print(f"\n{Colors.BLUE}{'='*70}{Colors.NC}")
    print(f"{Colors.BLUE}  {text}{Colors.NC}")
    print(f"{Colors.BLUE}{'='*70}{Colors.NC}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.NC}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.NC}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.NC}")

def print_info(text):
    print(f"{Colors.YELLOW}📡 {text}{Colors.NC}")

def test_ftp_connection():
    """Test FTP connection"""
    print_info("Testing FTP connection...")
    
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        
        # Get current directory
        current_dir = ftp.pwd()
        print_success(f"Connected! Current directory: {current_dir}")
        
        # List files
        print_info("Listing remote directory...")
        files = []
        ftp.retrlines('LIST', files.append)
        for file in files:
            print(f"  {file}")
        
        ftp.quit()
        return True, current_dir
        
    except Exception as e:
        print_error(f"Connection failed: {str(e)}")
        return False, None

def upload_file(ftp, local_path, remote_path):
    """Upload a single file"""
    try:
        with open(local_path, 'rb') as file:
            ftp.storbinary(f'STOR {remote_path}', file)
        return True
    except Exception as e:
        print_error(f"Failed to upload {local_path}: {str(e)}")
        return False

def deploy_package():
    """Main deployment function"""
    print_header("FTP Automated Deployment to cPanel")
    
    # Step 1: Check if deployment package exists
    package_files = [
        "cecom-cpanel-fast-images.zip",
        "cecom-cpanel-with-modules.zip",
        "cecom-cpanel-deployment.zip"
    ]
    
    package_file = None
    for pkg in package_files:
        if os.path.exists(pkg):
            package_file = pkg
            break
    
    if not package_file:
        print_error("No deployment package found!")
        print_info("Please build first: npm run build")
        return False
    
    print_success(f"Found deployment package: {package_file}")
    file_size = os.path.getsize(package_file) / (1024 * 1024)  # MB
    print_info(f"Package size: {file_size:.2f} MB")
    
    # Step 2: Test connection
    success, remote_dir = test_ftp_connection()
    if not success:
        return False
    
    print()
    
    # Step 3: Upload package
    print_info(f"Uploading {package_file}...")
    print_warning("This may take several minutes depending on your connection...")
    
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        
        # Set binary mode
        ftp.voidcmd('TYPE I')
        
        # Upload with progress
        remote_filename = f"deploy-{datetime.now().strftime('%Y%m%d-%H%M%S')}.zip"
        
        uploaded = 0
        total_size = os.path.getsize(package_file)
        
        def progress_callback(block):
            nonlocal uploaded
            uploaded += len(block)
            percent = (uploaded / total_size) * 100
            print(f"\r  Progress: {percent:.1f}% ({uploaded/(1024*1024):.1f}/{total_size/(1024*1024):.1f} MB)", end='', flush=True)
        
        with open(package_file, 'rb') as file:
            ftp.storbinary(f'STOR {remote_filename}', file, callback=progress_callback)
        
        print()  # New line after progress
        print_success(f"Upload complete! Remote file: {remote_filename}")
        
        # Verify upload
        print_info("Verifying upload...")
        remote_size = ftp.size(remote_filename)
        if remote_size == total_size:
            print_success(f"Verification passed! Size: {remote_size/(1024*1024):.2f} MB")
        else:
            print_warning(f"Size mismatch! Local: {total_size}, Remote: {remote_size}")
        
        ftp.quit()
        
        # Step 4: Print next steps
        print()
        print_header("Next Steps (Manual)")
        print("1. Login to cPanel File Manager")
        print(f"2. Navigate to: {remote_dir}")
        print(f"3. Find and extract: {remote_filename}")
        print("4. Delete the ZIP file after extraction")
        print("5. Restart Node.js app in cPanel")
        print()
        print_warning("Note: Extraction and restart must be done via cPanel interface")
        print()
        
        return True
        
    except Exception as e:
        print_error(f"Upload failed: {str(e)}")
        return False

def main():
    """Main entry point"""
    try:
        success = deploy_package()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print()
        print_warning("Deployment cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
