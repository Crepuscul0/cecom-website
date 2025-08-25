#!/usr/bin/env node

/**
 * Script para migrar contenido del RSS de Extreme Networks desde JSON a Supabase
 * Uso: node scripts/migrate-rss-to-supabase.js [--limit=20] [--dry-run]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateRSSToSupabase() {
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const dryRun = args.includes('--dry-run');
  
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 20;
  
  console.log('🚀 Iniciando migración del RSS a Supabase...');
  console.log(`📊 Límite de artículos: ${limit}`);
  console.log(`🧪 Modo prueba: ${dryRun ? 'SÍ' : 'NO'}`);
  console.log('─'.repeat(50));

  try {
    // Read JSON data
    const postsPath = path.join(__dirname, '..', 'data', 'blog', 'posts.json');
    const categoriesPath = path.join(__dirname, '..', 'data', 'blog', 'categories.json');
    
    if (!fs.existsSync(postsPath)) {
      console.error('❌ No se encontró el archivo posts.json');
      return;
    }

    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    const categories = fs.existsSync(categoriesPath) 
      ? JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
      : [];
    
    console.log(`📝 Posts encontrados: ${posts.length}`);
    console.log(`📂 Categorías encontradas: ${categories.length}`);

    if (dryRun) {
      console.log('\n⚠️  MODO PRUEBA - Mostrando primeros 5 posts:');
      posts.slice(0, 5).forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.title}`);
        console.log(`     Slug: ${post.slug}`);
        console.log(`     Fecha: ${post.publishedDate}`);
        console.log('');
      });
      return;
    }

    // Get category mapping from Supabase
    console.log('🔍 Obteniendo categorías de Supabase...');
    const { data: dbCategories, error: categoryError } = await supabase
      .from('blog_categories')
      .select('id, slug');
    
    if (categoryError) {
      console.error('❌ Error obteniendo categorías:', categoryError);
      console.log('🔧 Intentando usar MCP para obtener categorías...');
      
      // Fallback: usar las categorías que sabemos que existen
      const fallbackCategories = [
        { id: 'f3c265c9-390a-4572-994a-db7d2ca5948b', slug: 'cybersecurity' },
        { id: 'adaf9619-2df4-40c1-8c06-b4a189f7d3fd', slug: 'networking' },
        { id: '07e91ca1-9780-4154-a71e-0af7c2cfc9ac', slug: 'technology-solutions' }
      ];
      dbCategories = fallbackCategories;
    }

    const categoryMap = {};
    if (dbCategories) {
      dbCategories.forEach(cat => {
        categoryMap[cat.slug] = cat.id;
      });
    }

    // Map JSON category IDs to slugs
    const jsonCategoryMap = {};
    categories.forEach(cat => {
      jsonCategoryMap[cat.id] = cat.slug;
    });

    // Get existing posts to avoid duplicates
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug');
    
    const existingSlugs = new Set(existingPosts?.map(p => p.slug) || []);

    // Prepare posts for insertion
    const postsToInsert = posts
      .filter(post => !existingSlugs.has(post.slug))
      .slice(0, limit)
      .map(post => {
        const categorySlug = jsonCategoryMap[post.category] || 'cybersecurity';
        const categoryId = categoryMap[categorySlug] || categoryMap['cybersecurity'];
        
        return {
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          slug: post.slug,
          category_id: categoryId,
          featured_image: '/blog/cybersecurity-placeholder.jpg',
          published_date: new Date(post.publishedDate).toISOString(),
          status: post.status,
          author: post.author || 'CECOM Team',
          meta_title: post.seo?.metaTitle || post.title,
          meta_description: post.seo?.metaDescription || post.excerpt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

    console.log(`📥 Posts a insertar: ${postsToInsert.length}`);

    if (postsToInsert.length === 0) {
      console.log('ℹ️  No hay posts nuevos para insertar');
      return;
    }

    // Insert posts in batches
    const batchSize = 5;
    let totalInserted = 0;

    for (let i = 0; i < postsToInsert.length; i += batchSize) {
      const batch = postsToInsert.slice(i, i + batchSize);
      
      console.log(`📤 Insertando lote ${Math.floor(i / batchSize) + 1}...`);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(batch)
        .select('title');
      
      if (error) {
        console.error(`❌ Error insertando lote ${Math.floor(i / batchSize) + 1}:`, error);
      } else {
        totalInserted += batch.length;
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} insertado (${batch.length} posts)`);
        
        // Show inserted posts
        batch.forEach(post => {
          console.log(`   • ${post.title}`);
        });
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 Migración completada!');
    console.log(`📊 Total insertado: ${totalInserted} posts`);
    
    // Verify the data
    const { data: finalCount } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact' });
    
    console.log(`📈 Total posts en Supabase: ${finalCount?.length || 'Error obteniendo conteo'}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  migrateRSSToSupabase();
}

module.exports = { migrateRSSToSupabase };
