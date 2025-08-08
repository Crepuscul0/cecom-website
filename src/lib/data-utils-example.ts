/**
 * Example usage of data utility functions
 * This file demonstrates how to use the data-utils functions
 */

import {
  getCategories,
  getVendors,
  getProducts,
  getCategoryById,
  getVendorById,
  getProductById,
  getProductsByCategory,
  getProductsByVendor,
  saveCategories,
  saveVendors,
  saveProducts,
  validateCategory,
  validateVendor,
  validateProduct
} from './data-utils';

// Example: Reading data
export async function exampleReadData() {
  console.log('=== Reading Data Examples ===');
  
  // Get all categories
  const categories = await getCategories();
  console.log('Categories:', categories.map(c => c.name.en));
  
  // Get all vendors
  const vendors = await getVendors();
  console.log('Vendors:', vendors.map(v => v.name));
  
  // Get all products
  const products = await getProducts();
  console.log('Products:', products.map(p => p.name.en));
  
  // Get specific items by ID
  const cyberCategory = await getCategoryById('cybersecurity');
  console.log('Cybersecurity category:', cyberCategory?.name.en);
  
  const watchguardVendor = await getVendorById('watchguard');
  console.log('WatchGuard vendor:', watchguardVendor?.name);
  
  // Get products by category
  const cyberProducts = await getProductsByCategory('cybersecurity');
  console.log('Cybersecurity products:', cyberProducts.map(p => p.name.en));
  
  // Get products by vendor
  const watchguardProducts = await getProductsByVendor('watchguard');
  console.log('WatchGuard products:', watchguardProducts.map(p => p.name.en));
}

// Example: Adding new data
export async function exampleAddData() {
  console.log('=== Adding Data Examples ===');
  
  // Add a new category
  const categories = await getCategories();
  const newCategory = {
    id: 'cloud-services',
    name: {
      en: 'Cloud Services',
      es: 'Servicios en la Nube'
    },
    description: {
      en: 'Cloud computing and storage solutions',
      es: 'Soluciones de computación y almacenamiento en la nube'
    },
    slug: 'cloud-services',
    order: categories.length + 1,
    icon: 'cloud'
  };
  
  // Validate before adding
  if (validateCategory(newCategory)) {
    categories.push(newCategory);
    await saveCategories(categories);
    console.log('Added new category:', newCategory.name.en);
  }
  
  // Add a new vendor
  const vendors = await getVendors();
  const newVendor = {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '/logos/microsoft.png',
    website: 'https://www.microsoft.com',
    description: {
      en: 'Leading technology company providing cloud and productivity solutions',
      es: 'Empresa tecnológica líder que proporciona soluciones de nube y productividad'
    }
  };
  
  if (validateVendor(newVendor)) {
    vendors.push(newVendor);
    await saveVendors(vendors);
    console.log('Added new vendor:', newVendor.name);
  }
  
  // Add a new product
  const products = await getProducts();
  const newProduct = {
    id: 'microsoft-azure',
    name: {
      en: 'Microsoft Azure',
      es: 'Microsoft Azure'
    },
    description: {
      en: 'Comprehensive cloud computing platform with integrated services',
      es: 'Plataforma integral de computación en la nube con servicios integrados'
    },
    features: {
      en: [
        'Virtual machines',
        'Storage solutions',
        'AI and machine learning',
        'Database services',
        'Security and compliance'
      ],
      es: [
        'Máquinas virtuales',
        'Soluciones de almacenamiento',
        'IA y aprendizaje automático',
        'Servicios de base de datos',
        'Seguridad y cumplimiento'
      ]
    },
    categoryId: 'cloud-services',
    vendorId: 'microsoft',
    image: '/products/microsoft-azure.jpg',
    order: products.length + 1,
    active: true
  };
  
  if (validateProduct(newProduct)) {
    products.push(newProduct);
    await saveProducts(products);
    console.log('Added new product:', newProduct.name.en);
  }
}

// Example: Updating existing data
export async function exampleUpdateData() {
  console.log('=== Updating Data Examples ===');
  
  const products = await getProducts();
  const productToUpdate = products.find(p => p.id === 'watchguard-firebox-t15');
  
  if (productToUpdate) {
    // Update product description
    productToUpdate.description.en = 'Updated: Entry-level firewall with advanced threat protection for small businesses';
    productToUpdate.description.es = 'Actualizado: Firewall de nivel básico con protección avanzada contra amenazas para pequeñas empresas';
    
    // Add a new feature
    productToUpdate.features.en.push('24/7 support');
    productToUpdate.features.es.push('Soporte 24/7');
    
    await saveProducts(products);
    console.log('Updated product:', productToUpdate.name.en);
  }
}

// Run examples (uncomment to test)
// exampleReadData().catch(console.error);
// exampleAddData().catch(console.error);
// exampleUpdateData().catch(console.error);