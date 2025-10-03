#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Testing Icon Picker...\n');

// Check if IconPicker file exists and has content
const iconPickerPath = path.join(__dirname, '../src/components/admin/IconPicker.tsx');
const iconPickerExists = fs.existsSync(iconPickerPath);

console.log(`📁 IconPicker file: ${iconPickerExists ? '✅ Found' : '❌ Missing'}`);

if (iconPickerExists) {
  const content = fs.readFileSync(iconPickerPath, 'utf8');
  
  // Check for key components
  const hasLucideIcons = content.includes('from \'lucide-react\'');
  const hasAvailableIcons = content.includes('AVAILABLE_ICONS');
  const hasIconCategories = content.includes('ICON_CATEGORIES');
  const hasSearchFunctionality = content.includes('searchTerm');
  const hasOnIconSelect = content.includes('onIconSelect');
  
  console.log('\n🔍 Component features:');
  console.log(`   Lucide React icons: ${hasLucideIcons ? '✅' : '❌'}`);
  console.log(`   Available icons list: ${hasAvailableIcons ? '✅' : '❌'}`);
  console.log(`   Icon categories: ${hasIconCategories ? '✅' : '❌'}`);
  console.log(`   Search functionality: ${hasSearchFunctionality ? '✅' : '❌'}`);
  console.log(`   Icon selection handler: ${hasOnIconSelect ? '✅' : '❌'}`);
  
  // Count available icons
  const iconMatches = content.match(/(\w+): { icon: \w+, name: '[^']+', category: '[^']+' }/g);
  const iconCount = iconMatches ? iconMatches.length : 0;
  
  console.log(`\n📊 Available icons: ${iconCount}`);
  
  // Check CategorySidebar integration
  const categorySidebarPath = path.join(__dirname, '../src/components/catalog/CategorySidebar.tsx');
  if (fs.existsSync(categorySidebarPath)) {
    const sidebarContent = fs.readFileSync(categorySidebarPath, 'utf8');
    const hasUpdatedIcons = sidebarContent.includes('shield: Shield') && sidebarContent.includes('network: Network');
    console.log(`   CategorySidebar updated: ${hasUpdatedIcons ? '✅' : '❌'}`);
  }
  
  if (hasLucideIcons && hasAvailableIcons && hasOnIconSelect) {
    console.log('\n🎉 IconPicker is ready to use!');
    console.log('\n🔗 Test it at:');
    console.log('   1. Go to http://localhost:3000/en/admin');
    console.log('   2. Click "+ New Category"');
    console.log('   3. Click on the Icon field');
    console.log('   4. Search and select an icon');
  } else {
    console.log('\n⚠️  IconPicker needs attention - some features are missing');
  }
} else {
  console.log('\n❌ IconPicker file is missing or empty');
}

console.log('\n📋 Icon categories available:');
console.log('   🛡️  Security: shield, lock');
console.log('   🌐 Networking: wifi, network, router, cable, bluetooth');
console.log('   📞 Communication: phone, smartphone, headphones, radio');
console.log('   💻 Computing: monitor, laptop, tablet, cpu, memory');
console.log('   💾 Storage: server, database, harddrive, cloud');
console.log('   🖨️  Peripherals: printer, camera, keyboard, mouse, usb');
console.log('   🎮 Entertainment: tv, gamepad, watch');
console.log('   ⚡ General: zap, grid');