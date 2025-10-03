#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
    console.log('🚀 Migrando datos existentes a Supabase...');

    try {
        // Read existing data files
        const dataDir = path.join(process.cwd(), 'data');

        const categories = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalog/categories.json'), 'utf8'));
        const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalog/products.json'), 'utf8'));
        const vendors = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalog/vendors.json'), 'utf8'));
        const heroContent = JSON.parse(fs.readFileSync(path.join(dataDir, 'content/hero.json'), 'utf8'));
        const aboutContent = JSON.parse(fs.readFileSync(path.join(dataDir, 'content/about.json'), 'utf8'));
        const contactContent = JSON.parse(fs.readFileSync(path.join(dataDir, 'content/contact.json'), 'utf8'));

        console.log(`📊 Datos encontrados:`);
        console.log(`   - ${categories.length} categorías`);
        console.log(`   - ${products.length} productos`);
        console.log(`   - ${vendors.length} proveedores`);

        // Clear existing data (optional)
        console.log('🧹 Limpiando datos existentes...');
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('pages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Migrate categories
        console.log('📁 Migrando categorías...');
        const categoryMap = new Map();

        for (const category of categories) {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    name: category.name,
                    description: category.description,
                    slug: category.id,
                    order: category.order || 0,
                    icon: category.icon
                })
                .select()
                .single();

            if (error) {
                console.error(`Error insertando categoría ${category.id}:`, error);
            } else {
                categoryMap.set(category.id, data.id);
                console.log(`✅ Categoría migrada: ${category.name.en || category.name}`);
            }
        }

        // Migrate vendors
        console.log('🏢 Migrando proveedores...');
        const vendorMap = new Map();

        for (const vendor of vendors) {
            const { data, error } = await supabase
                .from('vendors')
                .insert({
                    name: vendor.name,
                    website: vendor.website,
                    description: vendor.description
                })
                .select()
                .single();

            if (error) {
                console.error(`Error insertando proveedor ${vendor.name}:`, error);
            } else {
                vendorMap.set(vendor.id, data.id);
                console.log(`✅ Proveedor migrado: ${vendor.name}`);
            }
        }

        // Migrate products
        console.log('📦 Migrando productos...');

        for (const product of products) {
            const categoryId = categoryMap.get(product.categoryId);
            const vendorId = vendorMap.get(product.vendorId);

            const { data, error } = await supabase
                .from('products')
                .insert({
                    name: product.name,
                    description: product.description,
                    features: product.features ? { en: product.features.en || product.features, es: product.features.es || product.features } : null,
                    category_id: categoryId,
                    vendor_id: vendorId,
                    order: product.order || 0,
                    active: product.active !== false
                })
                .select()
                .single();

            if (error) {
                console.error(`Error insertando producto ${product.name.en || product.name}:`, error);
            } else {
                console.log(`✅ Producto migrado: ${product.name.en || product.name}`);
            }
        }

        // Migrate content pages
        console.log('📄 Migrando páginas de contenido...');

        const pages = [
            { ...heroContent, slug: 'hero', type: 'hero' },
            { ...aboutContent, slug: 'about', type: 'about' },
            { ...contactContent, slug: 'contact', type: 'contact' }
        ];

        for (const page of pages) {
            const { data, error } = await supabase
                .from('pages')
                .insert({
                    title: page.title,
                    slug: page.slug,
                    content: page.content || page.description,
                    type: page.type
                })
                .select()
                .single();

            if (error) {
                console.error(`Error insertando página ${page.slug}:`, error);
            } else {
                console.log(`✅ Página migrada: ${page.slug}`);
            }
        }

        console.log('🎉 ¡Migración completada exitosamente!');
        console.log('');
        console.log('🔗 Próximos pasos:');
        console.log('1. Ejecuta: npm run dev');
        console.log('2. Ve a: http://localhost:3000/admin');
        console.log('3. Crea tu usuario administrador');
        console.log('4. ¡Empieza a gestionar tu contenido!');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrateData();