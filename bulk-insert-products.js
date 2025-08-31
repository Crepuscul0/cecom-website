#!/usr/bin/env node
/**
 * Bulk upsert Extreme Networks products into Supabase
 *
 * Usage:
 *  node scripts/bulk-insert-products.js [--file=path/to/catalog.json] [--limit=50] [--dry-run]
 *
 * Defaults:
 *  --file defaults to data/scraped/extreme/wired-access-catalog.json
 *
 * Upsert key: (vendor_id + name.en)
 * Writes JSONB: name, description, features
 * Sets: external_image_url, external_datasheet_url, order, active
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY exist in .env.local');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find(a => a.startsWith('--file='));
  const limitArg = args.find(a => a.startsWith('--limit='));
  const dryRun = args.includes('--dry-run');
  const useAnonForWrites = args.includes('--use-anon');

  // Choose API key: anon for dry-run (read-only), service role for writes (unless --use-anon)
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  const keyToUse = dryRun || useAnonForWrites ? anonKey : supabaseServiceKey;
  if (!keyToUse) {
    console.error(`❌ Missing Supabase API key for ${dryRun || useAnonForWrites ? 'anon (dry-run/writes)' : 'service_role'} in .env.local`);
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, keyToUse, { auth: { persistSession: false } });

  const filePath = fileArg
    ? path.resolve(process.cwd(), fileArg.split('=')[1])
    : path.join(process.cwd(), 'data', 'scraped', 'extreme', 'wired-access-catalog.json');

  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

  console.log('🚀 Bulk upsert Extreme products → Supabase');
  console.log(`📄 File: ${filePath}`);
  console.log(`🧪 Dry-run: ${dryRun ? 'YES' : 'NO'}`);
  if (limit) console.log(`🔢 Limit: ${limit}`);
  console.log('─'.repeat(50));

  if (!fs.existsSync(filePath)) {
    console.error('❌ Catalog file not found');
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(catalog)) {
    console.error('❌ Catalog JSON must be an array');
    process.exit(1);
  }
  console.log(`📝 Items in catalog: ${catalog.length}`);

  // Map vendor slug -> DB vendor name
  const vendorSlugToName = {
    extreme: 'Extreme Networks',
  };

  // Determine which categories and vendors we need
  const neededCategorySlugs = new Set();
  const neededVendorNames = new Set();
  for (const item of catalog) {
    if (item.categoryId) neededCategorySlugs.add(item.categoryId);
    const vendorName = vendorSlugToName[item.vendorId] || item.vendorId;
    if (vendorName) neededVendorNames.add(vendorName);
  }

  // Fetch categories by slug
  const categoryMap = {};
  if (neededCategorySlugs.size) {
    const slugs = Array.from(neededCategorySlugs);
    const { data: categories, error: catErr } = await supabase
      .from('categories')
      .select('id, slug')
      .in('slug', slugs);
    if (catErr) {
      console.error('❌ Error fetching categories:', catErr);
      process.exit(1);
    }
    for (const c of categories || []) categoryMap[c.slug] = c.id;
  }

  // Fetch vendors by name (no slug column available)
  const vendorMap = {};
  if (neededVendorNames.size) {
    const { data: vendors, error: vErr } = await supabase
      .from('vendors')
      .select('id, name');
    if (vErr) {
      console.error('❌ Error fetching vendors:', vErr);
      process.exit(1);
    }
    for (const v of vendors || []) vendorMap[v.name] = v.id;
  }

  let toProcess = [...catalog];
  if (limit) toProcess = toProcess.slice(0, limit);

  let inserted = 0;
  let updated = 0;
  const errors = [];

  for (const item of toProcess) {
    try {
      const enName = item?.name?.en?.trim();
      if (!enName) {
        console.warn(`⚠️  Skipping item without English name: ${item?.id || '(no id)'}`);
        continue;
      }

      const vendorName = vendorSlugToName[item.vendorId] || item.vendorId;
      const vendorId = vendorMap[vendorName];
      if (!vendorId) {
        console.warn(`⚠️  Skipping ${enName}: vendor not found in DB → ${vendorName}`);
        continue;
      }

      const categoryId = categoryMap[item.categoryId] || null;

      // Find existing by vendor + name.en
      const { data: existing, error: findErr } = await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', vendorId)
        .contains('name', { en: enName })
        .limit(1);

      if (findErr) throw findErr;

      const payload = {
        name: item.name || { en: enName, es: enName },
        description: item.description || null,
        features: item.features || null,
        category_id: categoryId,
        vendor_id: vendorId,
        external_image_url: item.image || null,
        external_datasheet_url: item.datasheet || null,
        order: Number.isFinite(item.order) ? item.order : 0,
        active: typeof item.active === 'boolean' ? item.active : true,
        updated_at: new Date().toISOString(),
      };

      if (dryRun) {
        console.log(`• [DRY] ${existing && existing.length ? 'Update' : 'Insert'}: ${enName}`);
        continue;
      }

      if (existing && existing.length) {
        const id = existing[0].id;
        const { error: upErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', id);
        if (upErr) throw upErr;
        updated += 1;
        console.log(`✅ Updated: ${enName}`);
      } else {
        const { error: insErr } = await supabase
          .from('products')
          .insert({ ...payload, created_at: new Date().toISOString() });
        if (insErr) throw insErr;
        inserted += 1;
        console.log(`✅ Inserted: ${enName}`);
      }
    } catch (e) {
      console.error(`❌ Error processing item ${item?.name?.en || item?.id || '(unknown)'}:`, e.message || e);
      errors.push(e);
    }
  }

  console.log('\n🎉 Done');
  console.log(`📊 Inserted: ${inserted}`);
  console.log(`🛠  Updated: ${updated}`);
  if (errors.length) console.log(`⚠️  Errors: ${errors.length}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });
}

module.exports = { main };