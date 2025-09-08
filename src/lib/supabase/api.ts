import { supabase } from '@/lib/supabase'

// Helper functions to safely extract multilingual content
const getMultilingualText = (field: any, locale: 'en' | 'es' = 'en') => {
  if (typeof field === 'string') return field
  if (typeof field === 'object' && field !== null) {
    return field[locale] || field.en || field.es || ''
  }
  return ''
}

const getMultilingualArray = (field: any, locale: 'en' | 'es' = 'en') => {
  if (Array.isArray(field)) return field
  if (typeof field === 'object' && field !== null) {
    const result = field[locale] || field.en || field.es
    return Array.isArray(result) ? result : []
  }
  return []
}

// Categories API functions
export const getCategories = async (locale: 'en' | 'es' = 'en', includeHierarchy: boolean = true) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('level', { ascending: true })
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = data.map((category: any) => ({
    id: category.id,
    name: getMultilingualText(category.name, locale),
    description: getMultilingualText(category.description, locale),
    slug: category.slug,
    order: category.order || 0,
    icon: category.icon,
    parent_id: category.parent_id,
    level: category.level || 0,
    path: category.path,
    children: [],
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  }))

  if (!includeHierarchy) {
    return categories
  }

  // Build hierarchy
  const categoryMap = new Map()
  const rootCategories: any[] = []

  // First pass: create map and identify root categories
  categories.forEach(category => {
    categoryMap.set(category.id, category)
    if (!category.parent_id) {
      rootCategories.push(category)
    }
  })

  // Second pass: build parent-child relationships
  categories.forEach(category => {
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        parent.children.push(category)
      }
    }
  })

  return rootCategories
}

export const getCategoryById = async (id: string, locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return {
    id: data.id,
    name: getMultilingualText(data.name, locale),
    description: getMultilingualText(data.description, locale),
    slug: data.slug,
    order: data.order || 0,
    icon: data.icon,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Vendors API functions
export const getVendors = async () => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching vendors:', error)
    return []
  }

  return data.map((vendor: any) => ({
    id: vendor.id,
    name: vendor.name,
    logo: vendor.logo ? { url: vendor.logo } : undefined,
    website: vendor.website,
    description: vendor.description,
    createdAt: vendor.created_at,
    updatedAt: vendor.updated_at,
  }))
}

export const getVendorById = async (id: string) => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching vendor:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    logo: data.logo ? { url: data.logo } : undefined,
    website: data.website,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Products API functions
export const getProducts = async (locale: 'en' | 'es' = 'en', categoryId?: string) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('active', true)
    .order('order', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data.map((product: any) => ({
    id: product.id,
    name: getMultilingualText(product.name, locale),
    description: getMultilingualText(product.description, locale),
    features: getMultilingualArray(product.features, locale),
    category: product.category ? {
      id: product.category.id,
      name: getMultilingualText(product.category.name, locale),
      slug: product.category.slug,
      icon: product.category.icon
    } : null,
    vendor: product.vendor ? {
      id: product.vendor.id,
      name: product.vendor.name,
      logo: product.vendor.logo ? { url: product.vendor.logo } : undefined,
      website: product.vendor.website,
      description: getMultilingualText(product.vendor.description, locale)
    } : null,
    image: product.external_image_url ? { url: product.external_image_url } : undefined,
    datasheet: product.external_datasheet_url ? { url: product.external_datasheet_url } : undefined,
    order: product.order || 0,
    active: product.active,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }))
}

export const getProductById = async (id: string, locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return {
    id: data.id,
    name: getMultilingualText(data.name, locale),
    description: getMultilingualText(data.description, locale),
    features: getMultilingualArray(data.features, locale),
    category: data.category ? {
      id: data.category.id,
      name: getMultilingualText(data.category.name, locale),
      slug: data.category.slug,
      icon: data.category.icon
    } : null,
    vendor: data.vendor ? {
      id: data.vendor.id,
      name: data.vendor.name,
      logo: data.vendor.logo ? { url: data.vendor.logo } : undefined,
      website: data.vendor.website,
      description: getMultilingualText(data.vendor.description, locale)
    } : null,
    image: data.external_image_url ? { url: data.external_image_url } : undefined,
    datasheet: data.external_datasheet_url ? { url: data.external_datasheet_url } : undefined,
    order: data.order || 0,
    active: data.active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export const getProductsByCategory = async (categoryId: string, locale: 'en' | 'es' = 'en', includeSubcategories: boolean = true) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('active', true)
    .order('order', { ascending: true })

  if (includeSubcategories) {
    // Get all subcategories of the selected category
    const { data: subcategories } = await supabase
      .from('categories')
      .select('id')
      .or(`id.eq.${categoryId},parent_id.eq.${categoryId}`)

    if (subcategories && subcategories.length > 0) {
      const categoryIds = subcategories.map(cat => cat.id)
      query = query.in('category_id', categoryIds)
    } else {
      query = query.eq('category_id', categoryId)
    }
  } else {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }

  return data.map((product: any) => ({
    id: product.id,
    name: getMultilingualText(product.name, locale),
    description: getMultilingualText(product.description, locale),
    features: getMultilingualArray(product.features, locale),
    category: product.category ? {
      id: product.category.id,
      name: getMultilingualText(product.category.name, locale),
      slug: product.category.slug,
      icon: product.category.icon
    } : null,
    vendor: product.vendor ? {
      id: product.vendor.id,
      name: product.vendor.name,
      logo: product.vendor.logo ? { url: product.vendor.logo } : undefined,
      website: product.vendor.website,
      description: getMultilingualText(product.vendor.description, locale)
    } : null,
    image: product.external_image_url ? { url: product.external_image_url } : undefined,
    datasheet: product.external_datasheet_url ? { url: product.external_datasheet_url } : undefined,
    order: product.order || 0,
    active: product.active,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }))
}

export const getProductsByVendor = async (vendorId: string, locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('vendor_id', vendorId)
    .eq('active', true)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching products by vendor:', error)
    return []
  }

  return data.map((product: any) => ({
    id: product.id,
    name: getMultilingualText(product.name, locale),
    description: getMultilingualText(product.description, locale),
    features: getMultilingualArray(product.features, locale),
    category: product.category ? {
      id: product.category.id,
      name: getMultilingualText(product.category.name, locale),
      slug: product.category.slug,
      icon: product.category.icon
    } : null,
    vendor: product.vendor ? {
      id: product.vendor.id,
      name: product.vendor.name,
      logo: product.vendor.logo ? { url: product.vendor.logo } : undefined,
      website: product.vendor.website,
      description: getMultilingualText(product.vendor.description, locale)
    } : null,
    image: product.external_image_url ? { url: product.external_image_url } : undefined,
    datasheet: product.external_datasheet_url ? { url: product.external_datasheet_url } : undefined,
    order: product.order || 0,
    active: product.active,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }))
}

// Search function
export const searchContent = async (query: string, locale: 'en' | 'es' = 'en') => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      vendor:vendors(*)
    `)
    .eq('active', true)
    .or(`name->>en.ilike.%${query}%,name->>es.ilike.%${query}%,description->>en.ilike.%${query}%,description->>es.ilike.%${query}%`)

  if (error) {
    console.error('Error searching products:', error)
    return { products: [], pages: [] }
  }

  const products = data.map((product: any) => ({
    id: product.id,
    name: getMultilingualText(product.name, locale),
    description: getMultilingualText(product.description, locale),
    features: getMultilingualArray(product.features, locale),
    category: product.category ? {
      id: product.category.id,
      name: getMultilingualText(product.category.name, locale),
      slug: product.category.slug,
      icon: product.category.icon
    } : null,
    vendor: product.vendor ? {
      id: product.vendor.id,
      name: product.vendor.name,
      logo: product.vendor.logo ? { url: product.vendor.logo } : undefined,
      website: product.vendor.website,
      description: getMultilingualText(product.vendor.description, locale)
    } : null,
    image: product.external_image_url ? { url: product.external_image_url } : undefined,
    datasheet: product.external_datasheet_url ? { url: product.external_datasheet_url } : undefined,
    order: product.order || 0,
    active: product.active,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }))

  return {
    products,
    pages: [], // Pages search not implemented yet
  }
}

// Statistics and admin functions
export const getCollectionCounts = async () => {
  const [categoriesResult, vendorsResult, productsResult] = await Promise.all([
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('vendors').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true })
  ])

  return {
    categories: categoriesResult.count || 0,
    vendors: vendorsResult.count || 0,
    products: productsResult.count || 0,
    pages: 0,
    'news-articles': 0,
    media: 0,
    users: 0,
  }
}