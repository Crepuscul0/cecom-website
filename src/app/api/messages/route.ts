import { NextRequest, NextResponse } from 'next/server'
import { getMessages } from 'next-intl/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'

  try {
    const messages = await getMessages({ locale })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to load messages:', error)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}
