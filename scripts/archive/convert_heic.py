#!/usr/bin/env python3

import os
import sys
import argparse
from pathlib import Path
from PIL import Image
import pillow_heif

def convert_heic_to_png(input_path, output_path):
    """Convert a single HEIC file to PNG format."""
    try:
        # Register HEIF opener with Pillow
        pillow_heif.register_heif_opener()
        
        # Open and convert the image
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (HEIC might be in different color modes)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Save as PNG
            img.save(output_path, 'PNG')
        
        print(f"✅ Converted: {input_path} → {output_path}")
        return True
    except Exception as e:
        print(f"❌ Error converting {input_path}: {str(e)}")
        return False

def process_directory(input_dir, output_dir):
    """Convert all HEIC files in a directory to PNG format."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Find all HEIC files
    heic_files = list(input_path.glob("*.heic")) + list(input_path.glob("*.HEIC"))
    
    if not heic_files:
        print("No HEIC files found in the input directory.")
        return
    
    print(f"Found {len(heic_files)} HEIC file(s) to convert...")
    
    success_count = 0
    for heic_file in heic_files:
        # Create output filename by replacing extension
        output_file = output_path / f"{heic_file.stem}.png"
        
        if convert_heic_to_png(heic_file, output_file):
            success_count += 1
    
    print(f"🎉 Conversion completed! {success_count}/{len(heic_files)} files converted successfully.")

def main():
    parser = argparse.ArgumentParser(
        description="Convert HEIC images to PNG format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/convert_heic.py ./images ./converted
  python scripts/convert_heic.py ./photo.heic ./photo.png
  python scripts/convert_heic.py ./images  # Uses current directory as input
        """
    )
    
    parser.add_argument(
        'input',
        nargs='?',
        default='.',
        help='Input directory or file (default: current directory)'
    )
    
    parser.add_argument(
        'output',
        nargs='?',
        help='Output directory or file (default: "converted" folder in input directory)'
    )
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    
    if not input_path.exists():
        print(f"❌ Error: Input path '{input_path}' does not exist.")
        sys.exit(1)
    
    if input_path.is_file():
        # Single file conversion
        if not args.output:
            print("❌ Error: Output path required for single file conversion.")
            sys.exit(1)
        
        output_path = Path(args.output)
        convert_heic_to_png(input_path, output_path)
    
    else:
        # Directory conversion
        if args.output:
            output_dir = Path(args.output)
        else:
            output_dir = input_path / "converted"
        
        process_directory(input_path, output_dir)

if __name__ == "__main__":
    main() 