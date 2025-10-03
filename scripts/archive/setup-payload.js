#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Payload CMS...');

// Check if Supabase is configured
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

if (envContent.includes('placeholder')) {
  console.log('⚠️  Necesitas configurar Supabase primero.');
  console.log('');
  console.log('📋 Pasos para configurar:');
  console.log('1. Ve a https://supabase.com y crea un proyecto');
  console.log('2. En Settings > API, copia:');
  console.log('   - Project URL');
  console.log('   - anon/public key');
  console.log('   - service_role key');
  console.log('3. En Settings > Database, copia la Connection String');
  console.log('4. Actualiza el archivo .env.local con estos valores');
  console.log('');
  console.log('💡 O ejecuta: npm run setup:supabase');
  process.exit(1);
}

// Create admin route
const adminRoute = `import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  redirect('/admin');
}`;

const adminPath = path.join(process.cwd(), 'src/app/admin.tsx');
if (!fs.existsSync(adminPath)) {
  fs.writeFileSync(adminPath, adminRoute);
}

// Create payload admin CSS
const adminCSS = `/* Payload Admin Custom Styles */
.payload-admin {
  --primary: #0066cc;
  --primary-foreground: #ffffff;
}

.nav__brand {
  color: var(--primary) !important;
}

.nav__brand::after {
  content: " - CECOM";
  font-weight: normal;
  opacity: 0.7;
}`;

const cssDir = path.join(process.cwd(), 'src/app/(payload)');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

const cssPath = path.join(cssDir, 'custom.css');
fs.writeFileSync(cssPath, adminCSS);

console.log('✅ Payload CMS configurado correctamente');
console.log('');
console.log('🎯 Próximos pasos:');
console.log('1. Ejecuta: npm run dev');
console.log('2. Ve a: http://localhost:3000/admin');
console.log('3. Crea tu primer usuario administrador');
console.log('');
console.log('📚 Colecciones disponibles:');
console.log('   - Productos (products)');
console.log('   - Categorías (categories)');
console.log('   - Proveedores (vendors)');
console.log('   - Páginas (pages)');
console.log('   - Artículos (news-articles)');
console.log('   - Medios (media)');