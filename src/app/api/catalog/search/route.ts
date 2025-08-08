import { NextRequest, NextResponse } from 'next/server'
import { searchContent } from '@/lib/payload/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const locale = (searchParams.get('locale') as 'en' | 'es') || 'en'
    
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
        },
        { status: 400 }
      )
    }
    
    const results = await searchContent(query, locale)
    
    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Error searching content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search content',
      },
      { status: 500 }
    )
  }
}