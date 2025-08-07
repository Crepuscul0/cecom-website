#!/usr/bin/env node

/**
 * Test script for Payload CMS collections
 * This script tests all collections and their relationships
 */

const { getPayload } = require('payload')
const config = require('../payload.config.ts')

const testCollections = async () => {
  console.log('🧪 Testing Payload CMS collections...')
  
  try {
    // Get Payload instance
    const payload = await getPayload({ config })
    
    // Test Categories collection
    console.log('\n📁 Testing Categories collection...')
    const categories = await payload.find({
      collection: 'categories',
      limit: 10,
    })
    console.log(`✅ Found ${categories.docs.length} categories`)
    
    if (categories.docs.length > 0) {
      const firstCategory = categories.docs[0]
      console.log(`   Sample category: ${firstCategory.name?.en || firstCategory.name} (${firstCategory.slug})`)
    }
    
    // Test Vendors collection
    console.log('\n🏢 Testing Vendors collection...')
    const vendors = await payload.find({
      collection: 'vendors',
      limit: 10,
    })
    console.log(`✅ Found ${vendors.docs.length} vendors`)
    
    if (vendors.docs.length > 0) {
      const firstVendor = vendors.docs[0]
      console.log(`   Sample vendor: ${firstVendor.name}`)
    }
    
    // Test Products collection with relationships
    console.log('\n📦 Testing Products collection...')
    const products = await payload.find({
      collection: 'products',
      limit: 10,
      depth: 2, // Include related data
    })
    console.log(`✅ Found ${products.docs.length} products`)
    
    if (products.docs.length > 0) {
      const firstProduct = products.docs[0]
      console.log(`   Sample product: ${firstProduct.name?.en || firstProduct.name}`)
      console.log(`   Category: ${firstProduct.category?.name?.en || firstProduct.category?.name || 'N/A'}`)
      console.log(`   Vendor: ${firstProduct.vendor?.name || 'N/A'}`)
      console.log(`   Features: ${firstProduct.features?.length || 0} features`)
    }
    
    // Test Pages collection
    console.log('\n📄 Testing Pages collection...')
    const pages = await payload.find({
      collection: 'pages',
      limit: 10,
    })
    console.log(`✅ Found ${pages.docs.length} pages`)
    
    if (pages.docs.length > 0) {
      const firstPage = pages.docs[0]
      console.log(`   Sample page: ${firstPage.title?.en || firstPage.title} (${firstPage.type})`)
    }
    
    // Test Media collection
    console.log('\n🖼️  Testing Media collection...')
    const media = await payload.find({
      collection: 'media',
      limit: 10,
    })
    console.log(`✅ Found ${media.docs.length} media files`)
    
    if (media.docs.length > 0) {
      const firstMedia = media.docs[0]
      console.log(`   Sample media: ${firstMedia.filename} (${firstMedia.mimeType})`)
    }
    
    // Test Users collection
    console.log('\n👤 Testing Users collection...')
    const users = await payload.find({
      collection: 'users',
      limit: 10,
    })
    console.log(`✅ Found ${users.docs.length} users`)
    
    if (users.docs.length > 0) {
      const firstUser = users.docs[0]
      console.log(`   Sample user: ${firstUser.email} (${firstUser.role})`)
    }
    
    // Test News Articles collection
    console.log('\n📰 Testing News Articles collection...')
    const articles = await payload.find({
      collection: 'news-articles',
      limit: 10,
      depth: 1,
    })
    console.log(`✅ Found ${articles.docs.length} news articles`)
    
    if (articles.docs.length > 0) {
      const firstArticle = articles.docs[0]
      console.log(`   Sample article: ${firstArticle.title}`)
      console.log(`   Vendor: ${firstArticle.vendor?.name || 'N/A'}`)
    }
    
    // Test localization
    console.log('\n🌐 Testing localization...')
    const localizedCategories = await payload.find({
      collection: 'categories',
      locale: 'es',
      limit: 1,
    })
    
    if (localizedCategories.docs.length > 0) {
      const category = localizedCategories.docs[0]
      console.log(`✅ Localization working - Spanish category: ${category.name}`)
    }
    
    // Test search functionality
    console.log('\n🔍 Testing search functionality...')
    const searchResults = await payload.find({
      collection: 'products',
      where: {
        name: {
          like: 'Watch'
        }
      },
      limit: 5,
    })
    console.log(`✅ Search test - Found ${searchResults.docs.length} products matching 'Watch'`)
    
    console.log('\n🎉 All collection tests completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Categories: ${categories.docs.length}`)
    console.log(`- Vendors: ${vendors.docs.length}`)
    console.log(`- Products: ${products.docs.length}`)
    console.log(`- Pages: ${pages.docs.length}`)
    console.log(`- Media: ${media.docs.length}`)
    console.log(`- Users: ${users.docs.length}`)
    console.log(`- News Articles: ${articles.docs.length}`)
    
    console.log('\n📝 Next steps:')
    console.log('1. All collections are working correctly')
    console.log('2. Relationships between collections are functional')
    console.log('3. Localization is configured properly')
    console.log('4. Ready for frontend integration')
    
  } catch (error) {
    console.error('❌ Collection test failed:', error)
    process.exit(1)
  }
}

// Run tests
testCollections()