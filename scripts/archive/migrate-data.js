#!/usr/bin/env node

/**
 * Data migration script for CECOM website
 * This script migrates existing JSON data to Payload CMS collections
 */

const path = require('path')
const fs = require('fs')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Import Payload
const { getPayload } = require('payload')
const config = require('../payload.config.ts')

const migrateData = async () => {
  console.log('🚀 Starting data migration to Payload CMS...')
  
  try {
    // Get Payload instance
    const payload = await getPayload({ config })
    
    // Read existing JSON data
    const dataDir = path.join(process.cwd(), 'data')
    
    // Migrate categories
    console.log('📁 Migrating categories...')
    const categoriesPath = path.join(dataDir, 'catalog', 'categories.json')
    if (fs.existsSync(categoriesPath)) {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
      
      for (const category of categories) {
        try {
          await payload.create({
            collection: 'categories',
            data: {
              name: category.name,
              description: category.description,
              slug: category.slug,
              order: category.order,
              icon: category.icon,
            },
          })
          console.log(`✅ Migrated category: ${category.name.en}`)
        } catch (error) {
          if (error.message.includes('duplicate')) {
            console.log(`⚠️  Category already exists: ${category.name.en}`)
          } else {
            console.error(`❌ Error migrating category ${category.name.en}:`, error.message)
          }
        }
      }
    }
    
    // Migrate vendors
    console.log('🏢 Migrating vendors...')
    const vendorsPath = path.join(dataDir, 'catalog', 'vendors.json')
    if (fs.existsSync(vendorsPath)) {
      const vendors = JSON.parse(fs.readFileSync(vendorsPath, 'utf8'))
      
      for (const vendor of vendors) {
        try {
          await payload.create({
            collection: 'vendors',
            data: {
              name: vendor.name,
              website: vendor.website,
              rssUrl: vendor.rssUrl,
              description: vendor.description,
            },
          })
          console.log(`✅ Migrated vendor: ${vendor.name}`)
        } catch (error) {
          if (error.message.includes('duplicate')) {
            console.log(`⚠️  Vendor already exists: ${vendor.name}`)
          } else {
            console.error(`❌ Error migrating vendor ${vendor.name}:`, error.message)
          }
        }
      }
    }
    
    // Get category and vendor IDs for products
    const categoriesResult = await payload.find({
      collection: 'categories',
      limit: 100,
    })
    const vendorsResult = await payload.find({
      collection: 'vendors',
      limit: 100,
    })
    
    const categoryMap = new Map()
    const vendorMap = new Map()
    
    categoriesResult.docs.forEach(cat => {
      categoryMap.set(cat.slug, cat.id)
    })
    
    vendorsResult.docs.forEach(vendor => {
      vendorMap.set(vendor.name.toLowerCase(), vendor.id)
    })
    
    // Migrate products
    console.log('📦 Migrating products...')
    const productsPath = path.join(dataDir, 'catalog', 'products.json')
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
      
      for (const product of products) {
        try {
          const categoryId = categoryMap.get(product.categoryId)
          const vendorId = vendorMap.get(product.vendorId?.toLowerCase())
          
          if (!categoryId) {
            console.warn(`⚠️  Category not found for product ${product.name.en}: ${product.categoryId}`)
            continue
          }
          
          if (!vendorId) {
            console.warn(`⚠️  Vendor not found for product ${product.name.en}: ${product.vendorId}`)
            continue
          }
          
          // Convert features array to Payload array format
          const featuresArray = []
          if (product.features) {
            // Handle localized features
            if (product.features.en && Array.isArray(product.features.en)) {
              product.features.en.forEach((feature, index) => {
                featuresArray.push({
                  feature: {
                    en: feature,
                    es: product.features.es?.[index] || feature
                  }
                })
              })
            }
          }
          
          await payload.create({
            collection: 'products',
            data: {
              name: product.name,
              description: product.description,
              features: featuresArray,
              category: categoryId,
              vendor: vendorId,
              order: product.order || 0,
              active: product.active !== false,
            },
          })
          console.log(`✅ Migrated product: ${product.name.en}`)
        } catch (error) {
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            console.log(`⚠️  Product already exists: ${product.name.en}`)
          } else {
            console.error(`❌ Error migrating product ${product.name.en}:`, error.message)
          }
        }
      }
    }
    
    // Migrate content pages
    console.log('📄 Migrating content pages...')
    const contentDir = path.join(dataDir, 'content')
    const contentFiles = [
      { file: 'about.json', type: 'about' },
      { file: 'hero.json', type: 'hero' },
      { file: 'contact.json', type: 'contact' }
    ]
    
    for (const { file: filename, type: pageType } of contentFiles) {
      const filePath = path.join(contentDir, filename)
      if (fs.existsSync(filePath)) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
          
          // Convert JSON content to rich text format for Payload
          const richTextContent = []
          
          if (pageType === 'about') {
            // Structure about content for rich text
            richTextContent.push({
              type: 'h2',
              children: [{ text: 'Mission' }]
            })
            richTextContent.push({
              type: 'paragraph',
              children: [{ text: content.mission?.en || '' }]
            })
            
            richTextContent.push({
              type: 'h2',
              children: [{ text: 'Vision' }]
            })
            richTextContent.push({
              type: 'paragraph',
              children: [{ text: content.vision?.en || '' }]
            })
            
            if (content.values && Array.isArray(content.values)) {
              richTextContent.push({
                type: 'h2',
                children: [{ text: 'Values' }]
              })
              
              content.values.forEach(value => {
                richTextContent.push({
                  type: 'h3',
                  children: [{ text: value.title?.en || '' }]
                })
                richTextContent.push({
                  type: 'paragraph',
                  children: [{ text: value.description?.en || '' }]
                })
              })
            }
            
            if (content.history) {
              richTextContent.push({
                type: 'h2',
                children: [{ text: 'History' }]
              })
              richTextContent.push({
                type: 'paragraph',
                children: [{ text: content.history?.en || '' }]
              })
            }
          } else {
            // For other content types, convert to simple rich text
            richTextContent.push({
              type: 'paragraph',
              children: [{ text: JSON.stringify(content, null, 2) }]
            })
          }
          
          await payload.create({
            collection: 'pages',
            data: {
              title: {
                en: `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page`,
                es: `Página de ${pageType}`,
              },
              slug: pageType,
              type: pageType,
              content: {
                en: richTextContent,
                es: richTextContent // For now, use same content for both languages
              },
            },
          })
          console.log(`✅ Migrated content page: ${pageType}`)
        } catch (error) {
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            console.log(`⚠️  Content page already exists: ${filename}`)
          } else {
            console.error(`❌ Error migrating content page ${filename}:`, error.message)
          }
        }
      }
    }
    
    // Create default admin user if none exists
    console.log('👤 Checking for admin user...')
    const usersResult = await payload.find({
      collection: 'users',
      limit: 1,
    })
    
    if (usersResult.docs.length === 0) {
      console.log('👤 Creating default admin user...')
      try {
        await payload.create({
          collection: 'users',
          data: {
            email: 'admin@cecom.do',
            password: 'admin123!',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
          },
        })
        console.log('✅ Created default admin user: admin@cecom.do (password: admin123!)')
        console.log('⚠️  Please change the password after first login!')
      } catch (error) {
        console.error('❌ Error creating admin user:', error.message)
      }
    } else {
      console.log('✅ Admin user already exists')
    }
    
    console.log('\n🎉 Data migration completed!')
    console.log('\n📊 Migration Summary:')
    console.log(`- Categories: ${categoriesResult.docs.length}`)
    console.log(`- Vendors: ${vendorsResult.docs.length}`)
    console.log('- Products: Check admin panel for count')
    console.log('- Content Pages: 3')
    console.log(`- Users: ${usersResult.docs.length > 0 ? 'Existing' : 'Created'}`)
    
    console.log('\n📝 Next steps:')
    console.log('1. Visit http://localhost:3000/admin to review migrated data')
    console.log('2. Login with admin@cecom.do / admin123! (change password!)')
    console.log('3. Upload vendor logos and product images')
    console.log('4. Review and edit content as needed')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateData()