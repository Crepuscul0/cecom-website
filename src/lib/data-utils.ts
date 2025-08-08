import { promises as fs } from 'fs';
import * as path from 'path';
import { Category, Vendor, Product } from '../types/catalog';
import { CMSContent } from '../types/cms';
import { AboutContent } from '../types/about';
import { NewsArticle, RSSFeedConfig } from '../types/feed';

// Base data directory path
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Generic function to read JSON data from a file
 */
async function readJSONFile<T>(filePath: string): Promise<T> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw new Error(`Failed to read data from ${filePath}`);
  }
}

/**
 * Generic function to write JSON data to a file
 */
async function writeJSONFile<T>(filePath: string, data: T): Promise<void> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    const dirPath = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write file with pretty formatting
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw new Error(`Failed to write data to ${filePath}`);
  }
}

// Catalog data functions
export async function getCategories(): Promise<Category[]> {
  return readJSONFile<Category[]>('catalog/categories.json');
}

export async function saveCategories(categories: Category[]): Promise<void> {
  return writeJSONFile('catalog/categories.json', categories);
}

export async function getVendors(): Promise<Vendor[]> {
  return readJSONFile<Vendor[]>('catalog/vendors.json');
}

export async function saveVendors(vendors: Vendor[]): Promise<void> {
  return writeJSONFile('catalog/vendors.json', vendors);
}

export async function getProducts(): Promise<Product[]> {
  return readJSONFile<Product[]>('catalog/products.json');
}

export async function saveProducts(products: Product[]): Promise<void> {
  return writeJSONFile('catalog/products.json', products);
}

// Content data functions
export async function getAboutContent(): Promise<AboutContent> {
  return readJSONFile<AboutContent>('content/about.json');
}

export async function saveAboutContent(content: AboutContent): Promise<void> {
  return writeJSONFile('content/about.json', content);
}

export async function getHeroContent(): Promise<CMSContent> {
  return readJSONFile<CMSContent>('content/hero.json');
}

export async function saveHeroContent(content: CMSContent): Promise<void> {
  return writeJSONFile('content/hero.json', content);
}

export async function getContactContent(): Promise<CMSContent> {
  return readJSONFile<CMSContent>('content/contact.json');
}

export async function saveContactContent(content: CMSContent): Promise<void> {
  return writeJSONFile('content/contact.json', content);
}

// Feed data functions
export async function getNewsArticles(): Promise<NewsArticle[]> {
  return readJSONFile<NewsArticle[]>('feeds/articles.json');
}

export async function saveNewsArticles(articles: NewsArticle[]): Promise<void> {
  return writeJSONFile('feeds/articles.json', articles);
}

export async function getFeedConfig(): Promise<RSSFeedConfig[]> {
  return readJSONFile<RSSFeedConfig[]>('feeds/config.json');
}

export async function saveFeedConfig(config: RSSFeedConfig[]): Promise<void> {
  return writeJSONFile('feeds/config.json', config);
}

// CMS data functions
export async function getCMSUsers(): Promise<any[]> {
  return readJSONFile<any[]>('cms/users.json');
}

export async function saveCMSUsers(users: any[]): Promise<void> {
  return writeJSONFile('cms/users.json', users);
}

export async function getCMSSettings(): Promise<any> {
  return readJSONFile<any>('cms/settings.json');
}

export async function saveCMSSettings(settings: any): Promise<void> {
  return writeJSONFile('cms/settings.json', settings);
}

// Helper functions for specific operations
export async function getCategoryById(id: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find(category => category.id === id);
}

export async function getVendorById(id: string): Promise<Vendor | undefined> {
  const vendors = await getVendors();
  return vendors.find(vendor => vendor.id === id);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find(product => product.id === id);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(product => product.categoryId === categoryId && product.active);
}

export async function getProductsByVendor(vendorId: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(product => product.vendorId === vendorId && product.active);
}

// Data validation helpers
export function validateCategory(category: Partial<Category>): category is Category {
  return !!(
    category.id &&
    category.name?.en &&
    category.name?.es &&
    category.description?.en &&
    category.description?.es &&
    category.slug &&
    typeof category.order === 'number'
  );
}

export function validateVendor(vendor: Partial<Vendor>): vendor is Vendor {
  return !!(
    vendor.id &&
    vendor.name &&
    vendor.logo &&
    vendor.description?.en &&
    vendor.description?.es
  );
}

export function validateProduct(product: Partial<Product>): product is Product {
  return !!(
    product.id &&
    product.name?.en &&
    product.name?.es &&
    product.description?.en &&
    product.description?.es &&
    product.features?.en &&
    product.features?.es &&
    product.categoryId &&
    product.vendorId &&
    typeof product.order === 'number' &&
    typeof product.active === 'boolean'
  );
}