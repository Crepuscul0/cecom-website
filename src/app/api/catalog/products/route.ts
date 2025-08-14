import { NextRequest } from 'next/server'
import { getProducts, getProductsByCategory, getProductsByVendor, searchContent } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as 'en' | 'es') || 'en'
    const categoryId = searchParams.get('categoryId')
    const vendorId = searchParams.get('vendorId')
    const search = searchParams.get('search')

    let products

    // If search query is provided, use search function
    if (search) {
      const searchResults = await searchContent(search, locale)
      products = searchResults.products
    } else if (categoryId) {
      // Get products by category
      products = await getProductsByCategory(categoryId, locale)
    } else if (vendorId) {
      // Get products by vendor
      products = await getProductsByVendor(vendorId, locale)
    } else {
      // Get all products
      products = await getProducts(locale)
    }

    // Apply additional filters if needed
    if (categoryId && (search || vendorId)) {
      products = products.filter((product: any) => {
        return product.category?.id === categoryId
      })
    }

    if (vendorId && (search || categoryId)) {
      products = products.filter((product: any) => {
        return product.vendor?.id === vendorId
      })
    }
    
    return Response.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return Response.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}