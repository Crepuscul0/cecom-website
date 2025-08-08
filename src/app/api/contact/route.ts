import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validation/contact';
import { z } from 'zod';

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