#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌍 Testing Admin Translations...\n');

// Read translation files
const esTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/es.json'), 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8'));

// Check if Admin section exists in both files
const hasAdminES = esTranslations.Admin !== undefined;
const hasAdminEN = enTranslations.Admin !== undefined;

console.log(`✅ Spanish Admin translations: ${hasAdminES ? 'Found' : 'Missing'}`);
console.log(`✅ English Admin translations: ${hasAdminEN ? 'Found' : 'Missing'}`);

if (hasAdminES && hasAdminEN) {
  // Check key sections
  const sections = ['title', 'auth', 'navigation', 'stats', 'tables', 'buttons'];
  
  console.log('\n📋 Translation sections:');
  sections.forEach(section => {
    const hasES = esTranslations.Admin[section] !== undefined;
    const hasEN = enTranslations.Admin[section] !== undefined;
    console.log(`   ${section}: ES ${hasES ? '✅' : '❌'} | EN ${hasEN ? '✅' : '❌'}`);
  });

  // Sample translations
  console.log('\n🔤 Sample translations:');
  console.log(`   Title: "${esTranslations.Admin.title}" / "${enTranslations.Admin.title}"`);
  console.log(`   Sign Out: "${esTranslations.Admin.auth.signOut}" / "${enTranslations.Admin.auth.signOut}"`);
  console.log(`   Categories: "${esTranslations.Admin.navigation.categories}" / "${enTranslations.Admin.navigation.categories}"`);
  
  console.log('\n🎉 Admin translations are ready for i18n!');
} else {
  console.log('\n❌ Admin translations are missing or incomplete.');
}

console.log('\n🔗 Test URLs:');
console.log('   Spanish: http://localhost:3000/es/admin');
console.log('   English: http://localhost:3000/en/admin');