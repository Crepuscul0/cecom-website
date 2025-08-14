#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testValidation() {
  console.log('🔍 Testing Admin Validation Functions...\n');

  try {
    // Test 1: Check existing categories
    console.log('📋 Current categories:');
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug');
    
    categories?.forEach(cat => {
      console.log(`   - ${cat.name?.en || cat.name} (slug: ${cat.slug})`);
    });

    // Test 2: Check existing vendors
    console.log('\n🏢 Current vendors:');
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id, name');
    
    vendors?.forEach(vendor => {
      console.log(`   - ${vendor.name}`);
    });

    // Test 3: Check existing products
    console.log('\n📦 Current products:');
    const { data: products } = await supabase
      .from('products')
      .select('id, name, category_id');
    
    products?.forEach(product => {
      console.log(`   - ${product.name?.en || product.name} (category: ${product.category_id})`);
    });

    console.log('\n✅ Validation setup complete!');
    console.log('\n🧪 Test scenarios:');
    console.log('1. Try creating a category with name "Cybersecurity" - should fail');
    console.log('2. Try creating a vendor with name "WatchGuard" - should fail');
    console.log('3. Try creating a product with same name in same category - should fail');
    console.log('4. Try creating items with unique names - should succeed');
    
    console.log('\n🔗 Test at:');
    console.log('   Spanish: http://localhost:3000/es/admin');
    console.log('   English: http://localhost:3000/en/admin');

  } catch (error) {
    console.error('❌ Error during validation test:', error);
  }
}

testValidation();