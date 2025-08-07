import { describe, it, expect } from 'vitest';
import {
  getCategories,
  getVendors,
  getProducts,
  getCategoryById,
  getVendorById,
  getProductById,
  getProductsByCategory,
  getProductsByVendor,
  validateCategory,
  validateVendor,
  validateProduct
} from '../data-utils';

describe('Data Utils', () => {
  describe('Catalog data functions', () => {
    it('should read categories from JSON file', async () => {
      const categories = await getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
      expect(categories[0].name).toHaveProperty('en');
      expect(categories[0].name).toHaveProperty('es');
    });

    it('should read vendors from JSON file', async () => {
      const vendors = await getVendors();
      expect(Array.isArray(vendors)).toBe(true);
      expect(vendors.length).toBeGreaterThan(0);
      expect(vendors[0]).toHaveProperty('id');
      expect(vendors[0]).toHaveProperty('name');
      expect(vendors[0]).toHaveProperty('logo');
    });

    it('should read products from JSON file', async () => {
      const products = await getProducts();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty('id');
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('categoryId');
      expect(products[0]).toHaveProperty('vendorId');
    });
  });

  describe('Helper functions', () => {
    it('should find category by ID', async () => {
      const category = await getCategoryById('cybersecurity');
      expect(category).toBeDefined();
      expect(category?.id).toBe('cybersecurity');
      expect(category?.name.en).toBe('Cybersecurity');
    });

    it('should find vendor by ID', async () => {
      const vendor = await getVendorById('watchguard');
      expect(vendor).toBeDefined();
      expect(vendor?.id).toBe('watchguard');
      expect(vendor?.name).toBe('WatchGuard');
    });

    it('should find product by ID', async () => {
      const products = await getProducts();
      if (products.length > 0) {
        const product = await getProductById(products[0].id);
        expect(product).toBeDefined();
        expect(product?.id).toBe(products[0].id);
      }
    });

    it('should filter products by category', async () => {
      const products = await getProductsByCategory('cybersecurity');
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.categoryId).toBe('cybersecurity');
        expect(product.active).toBe(true);
      });
    });

    it('should filter products by vendor', async () => {
      const products = await getProductsByVendor('watchguard');
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.vendorId).toBe('watchguard');
        expect(product.active).toBe(true);
      });
    });
  });

  describe('Validation functions', () => {
    it('should validate category correctly', () => {
      const validCategory = {
        id: 'test',
        name: { en: 'Test', es: 'Prueba' },
        description: { en: 'Test desc', es: 'Desc prueba' },
        slug: 'test',
        order: 1
      };
      expect(validateCategory(validCategory)).toBe(true);

      const invalidCategory = {
        id: 'test',
        name: { en: 'Test' }, // missing es
        description: { en: 'Test desc', es: 'Desc prueba' },
        slug: 'test',
        order: 1
      };
      expect(validateCategory(invalidCategory)).toBe(false);
    });

    it('should validate vendor correctly', () => {
      const validVendor = {
        id: 'test',
        name: 'Test Vendor',
        logo: '/logo.png',
        description: { en: 'Test desc', es: 'Desc prueba' }
      };
      expect(validateVendor(validVendor)).toBe(true);

      const invalidVendor = {
        id: 'test',
        name: 'Test Vendor',
        // missing logo
        description: { en: 'Test desc', es: 'Desc prueba' }
      };
      expect(validateVendor(invalidVendor)).toBe(false);
    });

    it('should validate product correctly', () => {
      const validProduct = {
        id: 'test',
        name: { en: 'Test Product', es: 'Producto Prueba' },
        description: { en: 'Test desc', es: 'Desc prueba' },
        features: { en: ['Feature 1'], es: ['Característica 1'] },
        categoryId: 'test-cat',
        vendorId: 'test-vendor',
        order: 1,
        active: true
      };
      expect(validateProduct(validProduct)).toBe(true);

      const invalidProduct = {
        id: 'test',
        name: { en: 'Test Product', es: 'Producto Prueba' },
        description: { en: 'Test desc', es: 'Desc prueba' },
        features: { en: ['Feature 1'], es: ['Característica 1'] },
        categoryId: 'test-cat',
        vendorId: 'test-vendor',
        order: 1
        // missing active
      };
      expect(validateProduct(invalidProduct)).toBe(false);
    });
  });
});