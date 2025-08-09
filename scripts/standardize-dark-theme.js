#!/usr/bin/env node
/*
  Standardize dark theme classes across the codebase.
  - Converts hardcoded light-only Tailwind classes to token-based classes
  - Safe, idempotent string replacements
  Usage:
    node scripts/standardize-dark-theme.js --write   # apply changes
    node scripts/standardize-dark-theme.js           # dry run
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const targets = [path.join(projectRoot, 'src')];
const write = process.argv.includes('--write');

/**
 * Replacement rules: [RegExp, replacement]
 * Order matters: specific patterns first, then generic ones.
 */
const rules = [
  // Backdrops and overlays
  [/(bg-gray-500\s+bg-opacity-75)/g, 'bg-background/80 backdrop-blur-sm'],

  // Whites and text
  [/\bbg-white\/95\b/g, 'bg-background/80'],
  [/\bbg-white\b/g, 'bg-background'],
  [/\btext-gray-900\b/g, 'text-foreground'],
  [/\btext-gray-(?:500|600|700)\b/g, 'text-muted-foreground'],

  // Grays to tokens
  [/\bbg-gray-(?:50|100|200)\b/g, 'bg-muted'],
  [/\btext-gray-400\b/g, 'text-muted-foreground'],
  [/\bborder-gray-(?:100|200)\b/g, 'border-border'],

  // Blues to primary/accent tokens
  [/\bbg-blue-50\b/g, 'bg-accent'],
  [/\bhover:bg-blue-50\b/g, 'hover:bg-accent'],
  [/\bborder-blue-200\b/g, 'border-primary/20'],
  [/\btext-blue-700\b/g, 'text-primary'],
  [/\bhover:text-blue-600\b/g, 'hover:text-primary'],
  [/\btext-blue-600\b/g, 'text-primary'],
  [/\bbg-blue-(?:600|700)\b/g, 'bg-primary'],
  [/\bhover:bg-blue-700\b/g, 'hover:bg-primary/90'],
  [/\bfrom-blue-600\b/g, 'from-primary'],
  [/\bto-blue-800\b/g, 'to-primary/80'],
  [/\bfrom-blue-50\b/g, 'from-primary/10'],
  [/\bto-blue-100\b/g, 'to-primary/20'],

  // Gradients using gray -> muted
  [/bg-gradient-to-br\s+from-gray-50\s+to-gray-100/g, 'bg-gradient-to-br from-muted to-muted'],

  // Tweak white button borders
  [/\bborder-blue-200\b/g, 'border-primary/20'],
  [/\btext-blue-700\b/g, 'text-primary'],
];

const extensions = new Set(['.tsx', '.ts', '.css']);

function shouldProcess(filePath) {
  const ext = path.extname(filePath);
  if (!extensions.has(ext)) return false;
  // Skip type declarations and build info
  if (filePath.endsWith('.d.ts') || filePath.includes('node_modules')) return false;
  return true;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) continue;
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      files = files.concat(walk(full));
    } else if (entry.isFile()) {
      if (shouldProcess(full)) files.push(full);
    }
  }
  return files;
}

function applyRules(content) {
  let updated = content;
  for (const [pattern, replacement] of rules) {
    updated = updated.replace(pattern, replacement);
  }
  return updated;
}

function main() {
  let changed = 0;
  let scanned = 0;

  for (const target of targets) {
    if (!fs.existsSync(target)) continue;
    const files = walk(target);
    for (const file of files) {
      scanned++;
      const original = fs.readFileSync(file, 'utf8');
      const updated = applyRules(original);
      if (updated !== original) {
        changed++;
        if (write) {
          fs.writeFileSync(file, updated, 'utf8');
          console.log(`[updated] ${path.relative(projectRoot, file)}`);
        } else {
          console.log(`[would update] ${path.relative(projectRoot, file)}`);
        }
      }
    }
  }

  console.log(`\nScanned ${scanned} files. ${write ? 'Updated' : 'Would update'} ${changed} files.`);
  if (!write) {
    console.log('Run with --write to apply changes.');
  }
}

main();


