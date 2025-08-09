# Scripts

This directory contains utility scripts for the project.

## HEIC to PNG Converter

A Python script to convert HEIC images to PNG format.

### Installation

```bash
pip install -r scripts/requirements.txt
```

### Usage

```bash
# Convert all HEIC files in current directory
python scripts/convert_heic.py

# Convert all HEIC files in a specific directory
python scripts/convert_heic.py ./images

# Convert all HEIC files with custom output directory
python scripts/convert_heic.py ./images ./converted

# Convert a single file
python scripts/convert_heic.py ./photo.heic ./photo.png
```

### Features

- Converts HEIC files to PNG format
- Handles both single files and entire directories
- Preserves image quality
- Automatic output directory creation
- Progress reporting and error handling

## Other Scripts

- `migrate-data.js` - Data migration utilities
- `setup-supabase.js` - Supabase setup and configuration
- `setup-storage.js` - Storage setup utilities 
- `standardize-dark-theme.js` - Rewrites hardcoded light classes to theme tokens. Run with:

```bash
npm run theme:standardize
```