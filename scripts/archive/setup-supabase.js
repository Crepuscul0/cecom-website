#!/usr/bin/env node

/**
 * Setup script for Supabase project and Payload CMS integration
 * This script helps configure the Supabase project for CECOM website
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 CECOM Website - Supabase Setup Script')
console.log('=========================================')

// Check if environment variables are set
const checkEnvironment = () => {
  console.log('\n📋 Checking environment variables...')
  
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found')
    console.log('📝 Please copy .env.example to .env.local and update the values')
    return false
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_DATABASE_URL',
    'PAYLOAD_SECRET'
  ]
  
  const missingVars = requiredVars.filter(varName => {
    return !envContent.includes(`${varName}=`) || 
           envContent.includes(`${varName}=placeholder`) ||
           envContent.includes(`${varName}=your_`)
  })
  
  if (missingVars.length > 0) {
    console.log('❌ Missing or placeholder environment variables:')
    missingVars.forEach(varName => console.log(`   - ${varName}`))
    console.log('\n📝 Please update .env.local with actual Supabase values')
    return false
  }
  
  console.log('✅ Environment variables configured')
  return true
}

// Instructions for manual Supabase setup
const showSupabaseInstructions = () => {
  console.log('\n🔧 Supabase Project Setup Instructions')
  console.log('=====================================')
  console.log('')
  console.log('1. Go to https://supabase.com/dashboard')
  console.log('2. Create a new project named "cecom-website"')
  console.log('3. Wait for the project to be ready')
  console.log('4. Go to Settings > API')
  console.log('5. Copy the following values to your .env.local file:')
  console.log('   - Project URL → NEXT_PUBLIC_SUPABASE_URL')
  console.log('   - anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.log('   - service_role key → SUPABASE_SERVICE_ROLE_KEY')
  console.log('6. Go to Settings > Database')
  console.log('7. Copy the connection string → SUPABASE_DATABASE_URL')
  console.log('   (Make sure to replace [YOUR-PASSWORD] with your actual password)')
  console.log('')
  console.log('8. Create storage buckets:')
  console.log('   - Go to Storage in the dashboard')
  console.log('   - Create bucket "media" (public)')
  console.log('   - Create bucket "documents" (public)')
  console.log('   - Create bucket "logos" (public)')
  console.log('')
  console.log('9. Run this script again after updating .env.local')
}

// Create storage buckets setup SQL
const generateStorageSQL = () => {
  return `
-- Create storage buckets for CECOM website
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('media', 'media', true, 52428800, '{"image/*","application/pdf"}'),
  ('documents', 'documents', true, 52428800, '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}'),
  ('logos', 'logos', true, 10485760, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('media', 'documents', 'logos'));
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('media', 'documents', 'logos') AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (bucket_id IN ('media', 'documents', 'logos') AND auth.uid()::text = owner);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id IN ('media', 'documents', 'logos') AND auth.uid()::text = owner);
`
}

// Main setup function
const main = async () => {
  try {
    if (!checkEnvironment()) {
      showSupabaseInstructions()
      return
    }
    
    console.log('\n✅ Environment configured!')
    console.log('\n📝 Next steps:')
    console.log('1. Run: npm run payload:generate-types')
    console.log('2. Run: npm run dev')
    console.log('3. Visit: http://localhost:3000/admin to set up Payload CMS')
    console.log('')
    console.log('🗄️  Storage SQL (run in Supabase SQL editor):')
    console.log(generateStorageSQL())
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

main()