import { NextRequest } from 'next/server'
import { getProducts, getProductsByCategory, getProductsByVendor, searchContent } from '@/lib/payload/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as 'en' | 'es') || 'en'
    const categoryId = searchParams.get('categoryId')
    const vendorId = searchParams.get('vendorId')
    const search = searchParams.get('search')

    // Start with all products
    let products = await getProducts(locale)

    // Apply category filter
    if (categoryId) {
      products = products.filter((product: any) => {
        const category = typeof product.category === 'object' ? product.category : null
        return category?.id === categoryId
      })
    }

    // Apply vendor filter
    if (vendorId) {
      products = products.filter((product: any) => {
        const vendor = typeof product.vendor === 'object' ? product.vendor : null
        return vendor?.id === vendorId
      })
    }

    // Apply search filter
    if (search) {
      const lowerQuery = search.toLowerCase()
      products = products.filter((product: any) => {
        const name = (product.name || '').toLowerCase()
        const description = (product.description || '').toLowerCase()
        const features = Array.isArray(product.features) 
          ? product.features.map((f: any) => (f.feature || '').toLowerCase()).join(' ')
          : ''
        
        return name.includes(lowerQuery) || 
               description.includes(lowerQuery) || 
               features.includes(lowerQuery)
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