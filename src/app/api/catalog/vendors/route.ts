import { NextRequest } from 'next/server'
import { getVendors } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const vendors = await getVendors()
    
    return Response.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return Response.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}