import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'

  // Validate locale
  if (!['en', 'es'].includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  try {
    const messagesPath = join(process.cwd(), 'messages', `${locale}.json`)
    const messages = JSON.parse(readFileSync(messagesPath, 'utf8'))
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error loading messages:', error)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}