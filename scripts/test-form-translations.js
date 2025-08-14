#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📝 Testing Form Translations...\n');

// Read translation files
const esTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/es.json'), 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8'));

// Check if Forms section exists in both files
const hasFormsES = esTranslations.Admin?.forms !== undefined;
const hasFormsEN = enTranslations.Admin?.forms !== undefined;

console.log(`✅ Spanish Form translations: ${hasFormsES ? 'Found' : 'Missing'}`);
console.log(`✅ English Form translations: ${hasFormsEN ? 'Found' : 'Missing'}`);

if (hasFormsES && hasFormsEN) {
  // Check form sections
  const formTypes = ['category', 'vendor', 'product', 'validation'];
  
  console.log('\n📋 Form translation sections:');
  formTypes.forEach(formType => {
    const hasES = esTranslations.Admin.forms[formType] !== undefined;
    const hasEN = enTranslations.Admin.forms[formType] !== undefined;
    console.log(`   ${formType}: ES ${hasES ? '✅' : '❌'} | EN ${hasEN ? '✅' : '❌'}`);
  });

  // Sample form translations
  console.log('\n🔤 Sample form translations:');
  console.log(`   Category New: "${esTranslations.Admin.forms.category.newTitle}" / "${enTranslations.Admin.forms.category.newTitle}"`);
  console.log(`   Save Button: "${esTranslations.Admin.forms.category.save}" / "${enTranslations.Admin.forms.category.save}"`);
  console.log(`   Add Feature: "${esTranslations.Admin.forms.product.addFeature}" / "${enTranslations.Admin.forms.product.addFeature}"`);
  
  console.log('\n🎉 Form translations are ready for i18n!');
  
  // Check component files exist
  console.log('\n📁 Checking modular form components:');
  const formComponents = [
    'src/components/admin/forms/FormModal.tsx',
    'src/components/admin/forms/FormInput.tsx',
    'src/components/admin/forms/CategoryFormModal.tsx',
    'src/components/admin/forms/VendorFormModal.tsx',
    'src/components/admin/forms/ProductFormModal.tsx'
  ];
  
  formComponents.forEach(component => {
    const exists = fs.existsSync(path.join(__dirname, '..', component));
    console.log(`   ${component}: ${exists ? '✅' : '❌'}`);
  });
  
} else {
  console.log('\n❌ Form translations are missing or incomplete.');
}

console.log('\n🔗 Test the forms at:');
console.log('   Spanish: http://localhost:3000/es/admin (click + Nueva Categoría)');
console.log('   English: http://localhost:3000/en/admin (click + New Category)');