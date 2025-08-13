#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📦 Migrando datos JSON a Payload CMS...');

// Read existing data
const dataDir = path.join(process.cwd(), 'data');

const categories = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalog/categories.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalog/products.json'), 'utf8'));
const vendors = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalog/vendors.json'), 'utf8'));
const settings = JSON.parse(fs.readFileSync(path.join(dataDir, 'cms/settings.json'), 'utf8'));

console.log(`📊 Datos encontrados:`);
console.log(`   - ${categories.length} categorías`);
console.log(`   - ${products.length} productos`);
console.log(`   - ${vendors.length} proveedores`);

// Create migration script for Payload
const migrationScript = `
// Migration script - Run this after Payload is set up
// This will populate your CMS with existing data

import payload from 'payload';

async function migrate() {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    local: true,
  });

  console.log('🚀 Iniciando migración...');

  // Migrate categories
  const categories = ${JSON.stringify(categories, null, 2)};
  for (const category of categories) {
    await payload.create({
      collection: 'categories',
      data: {
        name: category.name,
        description: category.description,
        slug: category.id,
        order: category.order || 0,
        icon: category.icon,
      },
    });
  }
  console.log('✅ Categorías migradas');

  // Migrate vendors
  const vendors = ${JSON.stringify(vendors, null, 2)};
  for (const vendor of vendors) {
    await payload.create({
      collection: 'vendors',
      data: {
        name: vendor.name,
        website: vendor.website,
        description: vendor.description,
      },
    });
  }
  console.log('✅ Proveedores migrados');

  // Migrate products
  const products = ${JSON.stringify(products, null, 2)};
  for (const product of products) {
    // Find category and vendor IDs
    const category = await payload.find({
      collection: 'categories',
      where: { slug: { equals: product.categoryId } },
    });
    
    const vendor = await payload.find({
      collection: 'vendors',
      where: { name: { equals: product.vendorId } },
    });

    await payload.create({
      collection: 'products',
      data: {
        name: product.name,
        description: product.description,
        features: product.features?.map(f => ({ feature: f })) || [],
        category: category.docs[0]?.id,
        vendor: vendor.docs[0]?.id,
        order: product.order || 0,
        active: product.active !== false,
      },
    });
  }
  console.log('✅ Productos migrados');

  console.log('🎉 Migración completada');
  process.exit(0);
}

migrate().catch(console.error);
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts/migrate-data-to-payload.mjs'), migrationScript);

console.log('✅ Script de migración creado');
console.log('');
console.log('📋 Para migrar tus datos:');
console.log('1. Configura Payload CMS primero');
console.log('2. Crea un usuario admin en /admin');
console.log('3. Ejecuta: node scripts/migrate-data-to-payload.mjs');