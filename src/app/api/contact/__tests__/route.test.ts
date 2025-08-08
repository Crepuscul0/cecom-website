import { describe, it, expect } from 'vitest';
import { POST } from '../route';

// Mock NextRequest
class MockNextRequest {
  constructor(private body: any) {}
  
  async json() {
    return this.body;
  }
}

describe('Contact API Route', () => {
  it('should handle valid contact form submission', async () => {
    const validData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      message: 'This is a test message that is long enough to pass validation.',
    };

    const request = new MockNextRequest(validData) as any;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Contact form submitted successfully');
    expect(result.messageId).toBeDefined();
  });

  it('should reject invalid email', async () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'invalid-email',
      phone: '+1 (555) 123-4567',
      message: 'This is a test message that is long enough to pass validation.',
    };

    const request = new MockNextRequest(invalidData) as any;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Validation failed');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.details).toBeDefined();
    expect(result.details.some((detail: any) => detail.field === 'email')).toBe(true);
  });

  it('should reject missing required fields', async () => {
    const invalidData = {
      fullName: '',
      email: '',
      phone: '',
      message: '',
    };

    const request = new MockNextRequest(invalidData) as any;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Validation failed');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.details).toBeDefined();
    expect(result.details.length).toBeGreaterThan(0);
  });

  it('should handle Spanish characters in names', async () => {
    const validData = {
      fullName: 'María José Rodríguez',
      email: 'maria@example.com',
      phone: '+1 (809) 555-0123',
      message: 'Este es un mensaje de prueba que es lo suficientemente largo para pasar la validación.',
    };

    const request = new MockNextRequest(validData) as any;
    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
  });
});