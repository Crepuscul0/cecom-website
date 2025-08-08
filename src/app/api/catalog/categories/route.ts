import { NextRequest } from 'next/server'
import { getCategories } from '@/lib/payload/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as 'en' | 'es') || 'en'

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