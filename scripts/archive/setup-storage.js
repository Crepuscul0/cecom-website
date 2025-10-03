#!/usr/bin/env node

/**
 * Storage setup script for CECOM website
 * This script sets up Supabase storage buckets and policies
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const setupStorage = async () => {
  console.log('🗄️  Setting up Supabase Storage for CECOM website...')
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
    process.exit(1)
  }
  
  if (supabaseUrl.includes('placeholder') || serviceRoleKey.includes('placeholder')) {
    console.error('❌ Placeholder values detected in environment variables')
    console.error('Please update .env.local with actual Supabase values')
    process.exit(1)
  }
  
  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  // Storage bucket configuration
  const buckets = [
    {
      id: 'media',
      name: 'media',
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/*', 'application/pdf']
    },
    {
      id: 'documents',
      name: 'documents', 
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    },
    {
      id: 'logos',
      name: 'logos',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/*']
    }
  ]
  
  try {
    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }
    
    console.log('📋 Existing buckets:', existingBuckets?.map(b => b.name).join(', ') || 'none')
    
    // Create buckets
    for (const bucket of buckets) {
      const exists = existingBuckets?.some(b => b.id === bucket.id)
      
      if (exists) {
        console.log(`✅ Bucket '${bucket.id}' already exists`)
        continue
      }
      
      console.log(`🔨 Creating bucket '${bucket.id}'...`)
      
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      })
      
      if (error) {
        console.error(`❌ Error creating bucket '${bucket.id}':`, error.message)
      } else {
        console.log(`✅ Created bucket '${bucket.id}'`)
      }
    }
    
    // Set up RLS policies for storage buckets
    console.log('\n🔒 Setting up Row Level Security policies...')
    
    const policies = [
      // Media bucket policies
      {
        name: 'media_select_policy',
        sql: `
          CREATE POLICY "Public read access for media" ON storage.objects
          FOR SELECT USING (bucket_id = 'media');
        `
      },
      {
        name: 'media_insert_policy', 
        sql: `
          CREATE POLICY "Authenticated users can upload media" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
        `
      },
      {
        name: 'media_update_policy',
        sql: `
          CREATE POLICY "Authenticated users can update media" ON storage.objects
          FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
        `
      },
      {
        name: 'media_delete_policy',
        sql: `
          CREATE POLICY "Authenticated users can delete media" ON storage.objects
          FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
        `
      },
      // Documents bucket policies
      {
        name: 'documents_select_policy',
        sql: `
          CREATE POLICY "Public read access for documents" ON storage.objects
          FOR SELECT USING (bucket_id = 'documents');
        `
      },
      {
        name: 'documents_insert_policy',
        sql: `
          CREATE POLICY "Authenticated users can upload documents" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
        `
      },
      // Logos bucket policies
      {
        name: 'logos_select_policy',
        sql: `
          CREATE POLICY "Public read access for logos" ON storage.objects
          FOR SELECT USING (bucket_id = 'logos');
        `
      },
      {
        name: 'logos_insert_policy',
        sql: `
          CREATE POLICY "Authenticated users can upload logos" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
        `
      }
    ]
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: `DROP POLICY IF EXISTS "${policy.name}" ON storage.objects; ${policy.sql}` 
        })
        
        if (error) {
          console.warn(`⚠️  Policy ${policy.name} may already exist or failed:`, error.message)
        } else {
          console.log(`✅ Created policy: ${policy.name}`)
        }
      } catch (error) {
        console.warn(`⚠️  Could not create policy ${policy.name}:`, error.message)
      }
    }
    
    console.log('\n🎉 Storage setup completed!')
    console.log('\n📝 Next steps:')
    console.log('1. Run the SQL migration in Supabase dashboard to set up additional RLS policies')
    console.log('2. File: supabase/migrations/001_setup_storage.sql')
    console.log('3. Or run: npm run setup:supabase')
    console.log('4. Run: npm run migrate:data to import existing data')
    
  } catch (error) {
    console.error('❌ Storage setup failed:', error.message)
    process.exit(1)
  }
}

setupStorage()