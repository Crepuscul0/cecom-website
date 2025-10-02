import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { subscribeToNewsletter } from '@/lib/email';

// Optional rate limiting - only if Redis is configured
let ratelimit: any = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Ratelimit } = require('@upstash/ratelimit');
    const { Redis } = require('@upstash/redis');
    
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '60 s'), // 3 subscriptions per minute
      analytics: true,
    });
  }
} catch (error) {
  console.warn('Rate limiting disabled - Redis not configured');
}

// Validation schema for newsletter subscription
const subscriptionSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  locale: z.enum(['en', 'es']).optional().default('es'),
});

export async function POST(request: NextRequest) {
  // Optional rate limiting - only if configured
  if (ratelimit) {
    try {
      const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
      const { success } = await ratelimit.limit(ip);
      
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    } catch (error) {
      console.warn('Rate limiting check failed:', error);
      // Continue without rate limiting
    }
  }

  try {
    const body = await request.json();
    
    // Validate the subscription data
    const validatedData = subscriptionSchema.parse(body);
    
    // Subscribe to newsletter
    const result = await subscribeToNewsletter(
      validatedData.email,
      validatedData.locale
    );
    
    if (!result.success) {
      if (result.error === 'Already subscribed') {
        return NextResponse.json(
          { 
            error: 'Email already subscribed',
            code: 'ALREADY_SUBSCRIBED' 
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          error: result.error || 'Failed to subscribe',
          code: 'SUBSCRIPTION_FAILED' 
        },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    
    // Return generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}