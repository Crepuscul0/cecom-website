#!/usr/bin/env node

const http = require('http');

const testEndpoint = (path, description) => {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${description}: ${res.statusCode} - ${Array.isArray(json) ? json.length : 'object'} items`);
          resolve(json);
        } catch (e) {
          console.log(`❌ ${description}: ${res.statusCode} - Invalid JSON`);
          reject(e);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: Connection failed`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ ${description}: Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

async function runTests() {
  console.log('🧪 Testing Catalog API Endpoints...\n');
  
  try {
    // Test categories
    await testEndpoint('/api/catalog/categories?locale=en', 'Categories (EN)');
    await testEndpoint('/api/catalog/categories?locale=es', 'Categories (ES)');
    
    // Test vendors
    await testEndpoint('/api/catalog/vendors', 'Vendors');
    
    // Test products
    await testEndpoint('/api/catalog/products?locale=en', 'All Products');
    await testEndpoint('/api/catalog/products?locale=en&categoryId=cybersecurity', 'Cybersecurity Products');
    await testEndpoint('/api/catalog/products?locale=en&vendorId=watchguard', 'WatchGuard Products');
    await testEndpoint('/api/catalog/products?locale=en&search=firewall', 'Search: firewall');
    await testEndpoint('/api/catalog/products?locale=en&categoryId=cybersecurity&vendorId=watchguard', 'Combined Filter');
    
    console.log('\n✅ All tests passed! The catalog is working correctly.');
    
  } catch (error) {
    console.log('\n❌ Some tests failed:', error.message);
    process.exit(1);
  }
}

runTests();