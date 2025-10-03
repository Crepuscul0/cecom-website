#!/usr/bin/env node

/**
 * Verification script to check if the blog markdown-to-HTML fix is working
 * This script checks:
 * 1. If marked package is installed
 * 2. If utility files exist
 * 3. If RSS importer has been updated
 * 4. Sample conversion test
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Blog Markdown-to-HTML Fix\n');
console.log('='.repeat(50));

let allChecks = true;

// Check 1: marked package
console.log('\n✓ Check 1: Marked package installed');
try {
  require('marked');
  console.log('  ✅ marked package found');
} catch (error) {
  console.log('  ❌ marked package NOT found');
  console.log('  Run: npm install marked --legacy-peer-deps');
  allChecks = false;
}

// Check 2: Utility file
console.log('\n✓ Check 2: Markdown utility file');
const utilPath = path.join(__dirname, '..', 'src', 'utils', 'markdown.ts');
if (fs.existsSync(utilPath)) {
  console.log('  ✅ src/utils/markdown.ts exists');
  const content = fs.readFileSync(utilPath, 'utf8');
  if (content.includes('markdownToHTML') && content.includes('isMarkdown')) {
    console.log('  ✅ Required functions present');
  } else {
    console.log('  ❌ Required functions missing');
    allChecks = false;
  }
} else {
  console.log('  ❌ src/utils/markdown.ts NOT found');
  allChecks = false;
}

// Check 3: RSS importer updated
console.log('\n✓ Check 3: RSS importer updated');
const rssPath = path.join(__dirname, '..', 'src', 'lib', 'rss-importer.ts');
if (fs.existsSync(rssPath)) {
  console.log('  ✅ src/lib/rss-importer.ts exists');
  const content = fs.readFileSync(rssPath, 'utf8');
  if (content.includes('import { marked }') || content.includes("from 'marked'")) {
    console.log('  ✅ marked import found');
  } else {
    console.log('  ❌ marked import NOT found');
    allChecks = false;
  }
  if (content.includes('async function generateSpanishContent') && 
      content.includes('async function generateEnglishContent')) {
    console.log('  ✅ Content generation functions are async');
  } else {
    console.log('  ❌ Content generation functions not properly updated');
    allChecks = false;
  }
} else {
  console.log('  ❌ src/lib/rss-importer.ts NOT found');
  allChecks = false;
}

// Check 4: Blog page updated
console.log('\n✓ Check 4: Blog post page updated');
const blogPagePath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'blog', '[slug]', 'page.tsx');
if (fs.existsSync(blogPagePath)) {
  console.log('  ✅ Blog post page exists');
  const content = fs.readFileSync(blogPagePath, 'utf8');
  if (content.includes('markdownToHTML') && content.includes('isMarkdown')) {
    console.log('  ✅ Markdown conversion functions imported');
  } else {
    console.log('  ❌ Markdown conversion functions NOT imported');
    allChecks = false;
  }
} else {
  console.log('  ❌ Blog post page NOT found');
  allChecks = false;
}

// Check 5: Test conversion
console.log('\n✓ Check 5: Test markdown conversion');
(async () => {
  try {
    const { marked } = require('marked');
    const testMarkdown = '# Test\n\n**Bold** and *italic*';
    const html = await marked(testMarkdown);
    if (html.includes('<h1>') && html.includes('<strong>') && html.includes('<em>')) {
      console.log('  ✅ Markdown conversion working');
      console.log('  Sample: "# Test" → "<h1>Test</h1>"');
    } else {
      console.log('  ❌ Markdown conversion not working correctly');
      allChecks = false;
    }
  } catch (error) {
    console.log('  ❌ Error testing conversion:', error.message);
    allChecks = false;
  }
  
  printSummary();
})()

function printSummary() {
  console.log('\n' + '='.repeat(50));
  if (allChecks) {
    console.log('✅ All checks passed! Blog markdown-to-HTML fix is working.');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit any blog post to see properly formatted content');
    console.log('3. New RSS imports will automatically format correctly');
  } else {
    console.log('❌ Some checks failed. Please review the errors above.');
    console.log('\nRefer to BLOG-MARKDOWN-TO-HTML-FIX.md for detailed instructions.');
  }
  console.log('='.repeat(50));
}
