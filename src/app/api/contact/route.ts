import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Basic validation schema for API route (without translations)
const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z
    .string()
    .min(1, 'Phone is required')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number'),
  
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

// Simple email sending function (in production, use a service like SendGrid, Resend, etc.)
async function sendEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  // For now, we'll just log the email data
  // In production, integrate with an email service
  console.log('Contact form submission:', {
    from: data.email,
    name: data.fullName,
    phone: data.phone,
    message: data.message,
    timestamp: new Date().toISOString(),
  });

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, return actual email sending result
  return { success: true, messageId: `msg_${Date.now()}` };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = contactFormSchema.parse(body);
    
    // Send the email
    const emailResult = await sendEmail(validatedData);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          code: 'EMAIL_SEND_FAILED' 
        },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      messageId: emailResult.messageId,
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    
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