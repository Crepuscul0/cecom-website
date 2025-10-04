# How to Get Working Vertiv Product Images

## Problem
The Vertiv product images are returning 404 errors because the URLs were estimated rather than verified.

## Solution Steps

### Step 1: Manual Research (Recommended)
1. Visit the official Vertiv website: https://www.vertiv.com/en-us/products/
2. Navigate to each product category:
   - **Power Management**: https://www.vertiv.com/en-us/products/critical-power/
   - **Thermal Management**: https://www.vertiv.com/en-us/products/thermal-management/
   - **IT Infrastructure**: https://www.vertiv.com/en-us/products/infrastructure/
   - **Monitoring**: https://www.vertiv.com/en-us/products/monitoring/

3. Find the specific product pages and copy the actual image URLs
4. Update the database using the provided SQL script

### Step 2: Product-Specific URLs to Research

#### Power Management Products:
- **Liebert GXT5**: Search for "GXT5" on Vertiv website
- **Liebert EXL S1**: Search for "EXL S1" on Vertiv website  
- **Liebert GXE**: Search for "GXE" on Vertiv website
- **Geist Rack PDU**: Search for "Geist PDU" on Vertiv website

#### Thermal Management Products:
- **Liebert CRV**: Search for "CRV" cooling systems
- **Liebert DSE**: Search for "DSE" precision cooling
- **Liebert PCW**: Search for "PCW" chilled water systems

#### IT Infrastructure Products:
- **VR Rack**: Search for "VR Rack" server racks
- **Avocent ACS8000**: Search for "ACS8000" console servers
- **SmartCabinet**: Search for "SmartCabinet" edge infrastructure

#### Monitoring Products:
- **Trellis Platform**: Search for "Trellis" DCIM software
- **Geist Environmental Monitoring**: Search for "Geist monitoring"

### Step 3: Alternative Solutions

#### Option A: Use Vertiv's Image CDN
Many Vertiv images follow this pattern:
```
https://www.vertiv.com/globalassets/products/[category]/[subcategory]/[product-name]/[image-file].jpg
```

#### Option B: Use Product Datasheets
1. Download product datasheets from Vertiv
2. Extract product images from PDFs
3. Host images locally in your `/public/images/products/vertiv/` folder
4. Update URLs to point to local images

#### Option C: Use Placeholder Images (Temporary)
The script includes placeholder image options that are guaranteed to work while you research actual images.

### Step 4: Update Database
Once you have verified working URLs, run the SQL script:
```bash
# Connect to your Supabase database and run:
psql -f scripts/update-vertiv-images.sql
```

### Step 5: Verify Images Work
After updating, test the URLs in your application to ensure they load correctly.

## Quick Fix (Temporary)
If you need a quick solution, uncomment the "Method 3" section in the SQL script to use placeholder images with proper Vertiv branding colors.

## Long-term Solution
1. Create a `/public/images/products/vertiv/` directory
2. Download and store product images locally
3. Update database to use local image paths
4. This ensures images are always available and load faster