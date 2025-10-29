import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit. Please compress your image.' },
        { status: 400 }
      );
    }

    // Create unique filename with multiple layers of uniqueness
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex'); // 16 character random string
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Sanitize original filename (remove special chars, keep only alphanumeric and hyphens)
    const originalName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 30); // Limit length
    
    // Format: product-{sanitized-name}-{timestamp}-{random}.{ext}
    let filename = `product-${originalName}-${timestamp}-${randomString}.${extension}`;

    // Ensure the products directory exists
    const productsDir = join(process.cwd(), 'public', 'products');
    if (!existsSync(productsDir)) {
      await mkdir(productsDir, { recursive: true });
    }

    // Extra safety: Check if file exists and generate new name if needed (extremely unlikely)
    let filepath = join(productsDir, filename);
    let attempts = 0;
    while (existsSync(filepath) && attempts < 5) {
      const newRandomString = crypto.randomBytes(8).toString('hex');
      filename = `product-${originalName}-${timestamp}-${newRandomString}.${extension}`;
      filepath = join(productsDir, filename);
      attempts++;
    }

    if (existsSync(filepath)) {
      return NextResponse.json(
        { error: 'Unable to generate unique filename after multiple attempts' },
        { status: 500 }
      );
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filepath, buffer);

    // Return the public URL path
    const imageUrl = `/products/${filename}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
