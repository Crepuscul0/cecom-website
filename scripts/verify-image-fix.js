#!/usr/bin/env node

/**
 * Verification script to check if the blog image fix is complete
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Blog Image Fix\n');
console.log('='.repeat(50));

let allChecks = true;

// Check 1: RSS Importer updated
console.log('\n✓ Check 1: RSS Importer updated');
const rssPath = path.join(__dirname, '..', 'src', 'lib', 'rss-importer.ts');
if (fs.existsSync(rssPath)) {
  const content = fs.readFileSync(rssPath, 'utf8');
  if (content.includes('featuredImage: null')) {
    console.log('  ✅ RSS importer sets featuredImage to null');
  } else {
    console.log('  ❌ RSS importer NOT updated');
    allChecks = false;
  }
} else {
  console.log('  ❌ RSS importer file NOT found');
  allChecks = false;
}

// Check 2: BlogCard updated
console.log('\n✓ Check 2: BlogCard component updated');
const blogCardPath = path.join(__dirname, '..', 'src', 'components', 'blog', 'BlogCard.tsx');
if (fs.existsSync(blogCardPath)) {
  const content = fs.readFileSync(blogCardPath, 'utf8');
  if (content.includes('hasValidImage') && content.includes('bg-gradient-to-br')) {
    console.log('  ✅ BlogCard handles missing images with gradient');
  } else {
    console.log('  ❌ BlogCard NOT properly updated');
    allChecks = false;
  }
} else {
  console.log('  ❌ BlogCard file NOT found');
  allChecks = false;
}

// Check 3: Blog detail page updated
console.log('\n✓ Check 3: Blog detail page updated');
const blogPagePath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'blog', '[slug]', 'page.tsx');
if (fs.existsSync(blogPagePath)) {
  const content = fs.readFileSync(blogPagePath, 'utf8');
  if (content.includes('!post.featuredImage.includes(\'example.com\')') || 
      content.includes('!post.featuredImage.includes("example.com")')) {
    console.log('  ✅ Blog detail page filters invalid images');
  } else {
    console.log('  ❌ Blog detail page NOT properly updated');
    allChecks = false;
  }
} else {
  console.log('  ❌ Blog detail page NOT found');
  allChecks = false;
}

// Check 4: SQL script exists
console.log('\n✓ Check 4: SQL cleanup script exists');
const sqlPath = path.join(__dirname, 'remove-broken-images.sql');
if (fs.existsSync(sqlPath)) {
  console.log('  ✅ SQL script available');
  console.log('  📝 Run this in Supabase SQL Editor to remove broken images');
} else {
  console.log('  ❌ SQL script NOT found');
  allChecks = false;
}

// Check 5: Documentation exists
console.log('\n✓ Check 5: Documentation created');
const docPath = path.join(__dirname, '..', 'BLOG-IMAGE-FIX-SUMMARY.md');
if (fs.existsSync(docPath)) {
  console.log('  ✅ Documentation available');
} else {
  console.log('  ⚠️  Documentation NOT found (optional)');
}

console.log('\n' + '='.repeat(50));

if (allChecks) {
  console.log('✅ All checks passed! Image fix is ready.');
  console.log('\n📋 Next steps:');
  console.log('1. Run SQL script in Supabase SQL Editor:');
  console.log('   scripts/remove-broken-images.sql');
  console.log('2. Verify with: node scripts/check-rss-images.js');
  console.log('3. Test in browser: npm run dev');
  console.log('4. Visit: http://localhost:3000/es/blog');
} else {
  console.log('❌ Some checks failed. Please review the errors above.');
}

console.log('='.repeat(50));
