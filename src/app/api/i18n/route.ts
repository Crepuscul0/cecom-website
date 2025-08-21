import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') || 'en';
  
  // Make sure locale is valid
  if (!['en', 'es'].includes(locale)) {
    return NextResponse.json(
      { error: 'Invalid locale' },
      { status: 400 }
    );
  }

  try {
    // Import the messages for the requested locale
    const messages = (await import(`../../../../messages/${locale}.json`)).default;
    
    return NextResponse.json({
      locale,
      ...messages
    });
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    );
  }
}
