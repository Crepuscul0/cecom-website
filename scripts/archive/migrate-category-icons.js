#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping from old emoji/text icons to new Lucide icon keys
const ICON_MIGRATION_MAP = {
  '🛡️': 'shield',
  '🔒': 'lock',
  '📡': 'wifi',
  '🌐': 'network',
  '📞': 'phone',
  '💻': 'laptop',
  '🖥️': 'monitor',
  '⚡': 'zap',
  '🔌': 'zap',
  '☁️': 'cloud',
  '💾': 'harddrive',
  '🖨️': 'printer',
  '📷': 'camera',
  '🎮': 'gamepad',
  '📺': 'tv',
  '⌚': 'watch',
  '🎧': 'headphones',
  '📱': 'smartphone',
  '🖱️': 'mouse',
  '⌨️': 'keyboard',
  // Text-based mappings
  'shield': 'shield',
  'network': 'network',
  'wifi': 'wifi',
  'phone': 'phone',
  'monitor': 'monitor',
  'server': 'server',
  'zap': 'zap',
  'grid': 'grid',
  'lock': 'lock',
  'cloud': 'cloud',
  'database': 'database'
};

async function migrateCategoryIcons() {
  console.log('🔄 Migrating category icons from emojis to Lucide icons...\n');

  try {
    // Get all categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      throw error;
    }

    console.log(`📊 Found ${categories.length} categories to check\n`);

    let migratedCount = 0;

    for (const category of categories) {
      const currentIcon = category.icon;
      const newIcon = ICON_MIGRATION_MAP[currentIcon];

      if (newIcon && newIcon !== currentIcon) {
        console.log(`🔄 Migrating category "${category.name?.en || category.name}" from "${currentIcon}" to "${newIcon}"`);
        
        const { error: updateError } = await supabase
          .from('categories')
          .update({ icon: newIcon })
          .eq('id', category.id);

        if (updateError) {
          console.error(`❌ Error updating category ${category.id}:`, updateError);
        } else {
          migratedCount++;
          console.log(`✅ Successfully migrated category "${category.name?.en || category.name}"`);
        }
      } else if (!newIcon && currentIcon) {
        console.log(`⚠️  Category "${category.name?.en || category.name}" has unmapped icon: "${currentIcon}"`);
        console.log(`   Consider mapping it to one of: shield, wifi, network, phone, monitor, server, zap, etc.`);
      } else if (!currentIcon) {
        console.log(`ℹ️  Category "${category.name?.en || category.name}" has no icon set`);
      } else {
        console.log(`✅ Category "${category.name?.en || category.name}" already has valid icon: "${currentIcon}"`);
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`   - ${migratedCount} categories migrated`);
    console.log(`   - ${categories.length - migratedCount} categories unchanged`);
    
    console.log('\n📋 Available Lucide icons:');
    console.log('   Security: shield, lock');
    console.log('   Networking: wifi, network, router, cable, bluetooth');
    console.log('   Communication: phone, smartphone, headphones, radio');
    console.log('   Computing: monitor, laptop, tablet, cpu, memory');
    console.log('   Storage: server, database, harddrive, cloud');
    console.log('   Peripherals: printer, camera, keyboard, mouse, usb');
    console.log('   Entertainment: tv, gamepad, watch');
    console.log('   General: zap, grid');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrateCategoryIcons();