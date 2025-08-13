#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAccess() {
  console.log('🧪 Probando acceso a Supabase...');

  try {
    // Test categories
    console.log('📁 Probando categorías...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('order');

    if (catError) {
      console.error('❌ Error categorías:', catError);
    } else {
      console.log(`✅ Categorías: ${categories.length} encontradas`);
    }

    // Test vendors
    console.log('🏢 Probando proveedores...');
    const { data: vendors, error: vendError } = await supabase
      .from('vendors')
      .select('*')
      .order('name');

    if (vendError) {
      console.error('❌ Error proveedores:', vendError);
    } else {
      console.log(`✅ Proveedores: ${vendors.length} encontrados`);
    }

    // Test products
    console.log('📦 Probando productos...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .order('order');

    if (prodError) {
      console.error('❌ Error productos:', prodError);
    } else {
      console.log(`✅ Productos: ${products.length} encontrados`);
    }

    // Test user profiles
    console.log('👤 Probando perfiles de usuario...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'admin@cecom.com.do');

    if (profileError) {
      console.error('❌ Error perfiles:', profileError);
    } else {
      console.log(`✅ Perfiles: ${profiles.length} encontrados`);
      if (profiles.length > 0) {
        console.log('   Admin encontrado:', profiles[0].email, profiles[0].role);
      }
    }

    console.log('');
    console.log('🎉 Prueba de acceso completada');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testAccess();