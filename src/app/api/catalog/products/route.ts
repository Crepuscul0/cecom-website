import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/payload/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const categoryId = searchParams.get('category') || undefined
    
    const products = await getProducts(locale, categoryId)
    
    return NextResponse.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    )
  }
}