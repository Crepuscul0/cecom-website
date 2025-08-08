#!/usr/bin/env node

/**
 * Test script to verify Payload configuration
 * This script tests the Payload config without connecting to database
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const path = require('path')
const fs = require('fs')

const testPayloadConfig = async () => {
  console.log('🧪 Testing Payload CMS configuration...')
  
  try {
    // Test environment variables
    console.log('\n🔧 Checking environment variables...')
    const requiredEnvVars = [
      'PAYLOAD_SECRET',
      'SUPABASE_DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    const missingVars = []
    const placeholderVars = []
    
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      if (!value) {
        missingVars.push(envVar)
      } else if (value.includes('placeholder')) {
        placeholderVars.push(envVar)
      } else {
        console.log(`✅ ${envVar}: Set`)
      }
    }
    
    if (missingVars.length > 0) {
      console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`)
    }
    
    if (placeholderVars.length > 0) {
      console.warn(`⚠️  Placeholder values detected: ${placeholderVars.join(', ')}`)
      console.warn('   Please update .env.local with actual Supabase values')
    }
    
    // Test Payload config file structure
    console.log('\n📋 Testing Payload configuration file...')
    const configPath = path.join(process.cwd(), 'payload.config.ts')
    
    if (fs.existsSync(configPath)) {
      console.log('✅ Payload config file exists')
      
      // Read and analyze the config file content
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      // Check for required imports
      const requiredImports = [
        'buildConfig',
        'postgresAdapter',
        'slateEditor'
      ]
      
      for (const importName of requiredImports) {
        if (configContent.includes(importName)) {
          console.log(`✅ Import '${importName}': Found`)
        } else {
          console.error(`❌ Import '${importName}': Missing`)
        }
      }
      
      // Check for collection definitions
      console.log('\n📁 Testing collection definitions...')
      const expectedCollections = ['users', 'categories', 'vendors', 'products', 'pages', 'news-articles', 'media']
      
      for (const collection of expectedCollections) {
        if (configContent.includes(`slug: '${collection}'`)) {
          console.log(`✅ Collection '${collection}': Defined`)
        } else {
          console.error(`❌ Collection '${collection}': Missing`)
        }
      }
      
      // Check for localization
      if (configContent.includes('localization:')) {
        console.log('✅ Localization: Configured')
        if (configContent.includes("'en'") && configContent.includes("'es'")) {
          console.log('   Languages: English, Spanish')
        }
      } else {
        console.error('❌ Localization: Not configured')
      }
      
      // Check for database configuration
      if (configContent.includes('postgresAdapter')) {
        console.log('✅ Database: PostgreSQL adapter configured')
      } else {
        console.error('❌ Database: Not configured')
      }
      
    } else {
      console.error('❌ Payload config file not found')
    }
    
    console.log('\n🎉 Payload configuration test completed!')
    
    if (placeholderVars.length > 0) {
      console.log('\n📝 Next steps:')
      console.log('1. Update .env.local with actual Supabase values')
      console.log('2. Run: npm run setup:supabase to create Supabase project')
      console.log('3. Run: npm run setup:storage to create storage buckets')
      console.log('4. Run: npm run migrate:data to import existing data')
    } else {
      console.log('\n📝 Configuration looks good! Ready to run migration.')
    }
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message)
    process.exit(1)
  }
}

// Run test
testPayloadConfig()