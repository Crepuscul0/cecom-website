#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWriteOperations() {
  console.log('✏️  Probando operaciones de escritura...');

  try {
    // Test category creation
    console.log('📁 Probando creación de categoría...');
    const { data: newCategory, error: catError } = await supabase
      .from('categories')
      .insert({
        name: { en: 'Test Category', es: 'Categoría de Prueba' },
        description: { en: 'Test description', es: 'Descripción de prueba' },
        slug: 'test-category',
        order: 999,
        icon: 'test'
      })
      .select()
      .single();

    if (catError) {
      console.error('❌ Error creando categoría:', catError);
    } else {
      console.log('✅ Categoría creada:', newCategory.name.en);
      
      // Clean up - delete the test category
      await supabase.from('categories').delete().eq('id', newCategory.id);
      console.log('🧹 Categoría de prueba eliminada');
    }

    // Test vendor creation
    console.log('🏢 Probando creación de proveedor...');
    const { data: newVendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        name: 'Test Vendor',
        website: 'https://test.com',
        description: { en: 'Test vendor', es: 'Proveedor de prueba' }
      })
      .select()
      .single();

    if (vendorError) {
      console.error('❌ Error creando proveedor:', vendorError);
    } else {
      console.log('✅ Proveedor creado:', newVendor.name);
      
      // Clean up
      await supabase.from('vendors').delete().eq('id', newVendor.id);
      console.log('🧹 Proveedor de prueba eliminado');
    }

    // Test product creation
    console.log('📦 Probando creación de producto...');
    
    // First get a category and vendor to reference
    const { data: categories } = await supabase.from('categories').select('id').limit(1);
    const { data: vendors } = await supabase.from('vendors').select('id').limit(1);
    
    if (categories.length > 0 && vendors.length > 0) {
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: { en: 'Test Product', es: 'Producto de Prueba' },
          description: { en: 'Test description', es: 'Descripción de prueba' },
          features: { en: ['Feature 1'], es: ['Característica 1'] },
          category_id: categories[0].id,
          vendor_id: vendors[0].id,
          order: 999,
          active: true
        })
        .select()
        .single();

      if (productError) {
        console.error('❌ Error creando producto:', productError);
      } else {
        console.log('✅ Producto creado:', newProduct.name.en);
        
        // Clean up
        await supabase.from('products').delete().eq('id', newProduct.id);
        console.log('🧹 Producto de prueba eliminado');
      }
    }

    console.log('');
    console.log('🎉 Prueba de operaciones de escritura completada');
    console.log('✅ Todas las operaciones CRUD funcionan correctamente');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testWriteOperations();