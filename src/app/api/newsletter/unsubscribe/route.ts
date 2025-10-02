import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
  }

  try {
    // Update subscription status
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      console.error('Error unsubscribing:', error);
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    // Return a simple HTML page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - CECOM</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .container { background: #f8fafc; padding: 40px; border-radius: 10px; }
          h1 { color: #2563eb; }
          .success { color: #059669; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Successfully Unsubscribed</h1>
          <p class="success">You have been successfully unsubscribed from CECOM's newsletter.</p>
          <p>We're sorry to see you go! If you change your mind, you can always subscribe again on our website.</p>
          <p><a href="https://cecom.do">Return to CECOM.do</a></p>
        </div>
      </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Update subscription status
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      console.error('Error unsubscribing:', error);
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}