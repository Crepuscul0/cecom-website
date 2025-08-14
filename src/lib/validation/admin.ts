import { supabase } from '@/lib/supabase';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if a category name is unique
 */
export async function validateCategoryName(
  nameEn: string, 
  nameEs: string, 
  excludeId?: string
): Promise<ValidationResult> {
  try {
    let query = supabase
      .from('categories')
      .select('id, name');

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return { isValid: false, error: 'Error checking category name' };
    }

    // Check for duplicate names in either language
    const duplicate = data?.find(category => {
      const existingNameEn = category.name?.en?.toLowerCase();
      const existingNameEs = category.name?.es?.toLowerCase();
      
      return existingNameEn === nameEn.toLowerCase() || 
             existingNameEs === nameEs.toLowerCase() ||
             existingNameEn === nameEs.toLowerCase() ||
             existingNameEs === nameEn.toLowerCase();
    });

    if (duplicate) {
      return { 
        isValid: false, 
        error: 'A category with this name already exists' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating category name' };
  }
}

/**
 * Validates if a category slug is unique
 */
export async function validateCategorySlug(
  slug: string, 
  excludeId?: string
): Promise<ValidationResult> {
  try {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return { isValid: false, error: 'Error checking category slug' };
    }

    if (data && data.length > 0) {
      return { 
        isValid: false, 
        error: 'A category with this slug already exists' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating category slug' };
  }
}

/**
 * Validates if a vendor name is unique
 */
export async function validateVendorName(
  name: string, 
  excludeId?: string
): Promise<ValidationResult> {
  try {
    let query = supabase
      .from('vendors')
      .select('id')
      .ilike('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return { isValid: false, error: 'Error checking vendor name' };
    }

    if (data && data.length > 0) {
      return { 
        isValid: false, 
        error: 'A vendor with this name already exists' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating vendor name' };
  }
}

/**
 * Validates if a product name is unique within the same category
 */
export async function validateProductName(
  nameEn: string, 
  nameEs: string, 
  categoryId: string,
  excludeId?: string
): Promise<ValidationResult> {
  try {
    let query = supabase
      .from('products')
      .select('id, name')
      .eq('category_id', categoryId);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      return { isValid: false, error: 'Error checking product name' };
    }

    // Check for duplicate names in either language within the same category
    const duplicate = data?.find(product => {
      const existingNameEn = product.name?.en?.toLowerCase();
      const existingNameEs = product.name?.es?.toLowerCase();
      
      return existingNameEn === nameEn.toLowerCase() || 
             existingNameEs === nameEs.toLowerCase() ||
             existingNameEn === nameEs.toLowerCase() ||
             existingNameEs === nameEn.toLowerCase();
    });

    if (duplicate) {
      return { 
        isValid: false, 
        error: 'A product with this name already exists in this category' 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating product name' };
  }
}