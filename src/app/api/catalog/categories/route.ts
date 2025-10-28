import { NextRequest } from 'next/server'
import { getCategories } from '@/lib/supabase/api'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as 'en' | 'es') || 'en'
    const vendorId = searchParams.get('vendorId')

    // If vendorId is provided, get only categories that have products from this vendor
    if (vendorId) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('category_id')
        .eq('vendor_id', vendorId)
        .eq('active', true)

      if (productsError) {
        console.error('Error fetching products:', productsError)
        return Response.json(
          { error: 'Failed to fetch products' },
          { status: 500 }
        )
      }

      // Get unique category IDs
      const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))]

      if (categoryIds.length === 0) {
        return Response.json([])
      }

      // Fetch only those categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .in('id', categoryIds)
        .order('order', { ascending: true })

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError)
        return Response.json(
          { error: 'Failed to fetch categories' },
          { status: 500 }
        )
      }

      const categories = categoriesData.map((category: any) => {
        // Handle both object format {en: "...", es: "..."} and separate columns
        let name = ''
        let description = ''
        
        if (typeof category.name === 'object' && category.name !== null) {
          name = category.name[locale] || category.name.en || category.name.es || ''
        } else {
          name = locale === 'es' 
            ? (category.name_es || category.name_en || category.name || '')
            : (category.name_en || category.name || '')
        }
        
        if (typeof category.description === 'object' && category.description !== null) {
          description = category.description[locale] || category.description.en || category.description.es || ''
        } else {
          description = locale === 'es'
            ? (category.description_es || category.description_en || category.description || '')
            : (category.description_en || category.description || '')
        }
        
        return {
          id: category.id,
          name: name,
          description: description,
          slug: category.slug,
          order: category.order || 0,
          icon: category.icon,
        }
      })

      return Response.json(categories)
    }

    // If no vendorId, return all categories
    const categories = await getCategories(locale)
    
    return Response.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}