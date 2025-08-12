import { describe, it, expect } from 'vitest';
import { createContactFormSchema } from '../contact';

// Mock translation function for tests
const mockTranslation = (key: string) => {
  const translations: Record<string, string> = {
    'requiredField': 'This field is required',
    'nameMinLength': 'Name must be at least 2 characters',
    'messageMinLength': 'Message must be at least 10 characters',
    'phoneMinLength': 'Phone number must be at least 10 digits',
    'invalidEmail': 'Please enter a valid email address',
    'invalidPhone': 'Please enter a valid phone number',
    'invalidName': 'Name can only contain letters and spaces',
    'maxLength': 'Must be no more than {max} characters',
  };
  return translations[key] || key;
};

describe('Contact Form Validation', () => {
  const contactFormSchema = createContactFormSchema(mockTranslation);
  it('should validate a correct contact form', () => {
    const validData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      message: 'This is a test message that is long enough to pass validation.',
    };

    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'invalid-email',
      phone: '+1 (555) 123-4567',
      message: 'This is a test message that is long enough to pass validation.',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('email'))).toBe(true);
    }
  });

  it('should reject short names', () => {
    const invalidData = {
      fullName: 'J',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      message: 'This is a test message that is long enough to pass validation.',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('fullName'))).toBe(true);
    }
  });

  it('should reject short messages', () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      message: 'Short',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('message'))).toBe(true);
    }
  });

  it('should reject invalid phone numbers', () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: 'abc',
      message: 'This is a test message that is long enough to pass validation.',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.includes('phone'))).toBe(true);
    }
  });

  it('should accept international phone numbers', () => {
    const validData = {
      fullName: 'María González',
      email: 'maria@example.com',
      phone: '+1 (809) 555-0123',
      message: 'Este es un mensaje de prueba que es lo suficientemente largo para pasar la validación.',
    };

    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept names with accents and special characters', () => {
    const validData = {
      fullName: 'José María Rodríguez',
      email: 'jose@example.com',
      phone: '+1 (809) 555-0123',
      message: 'Este es un mensaje de prueba que es lo suficientemente largo para pasar la validación.',
    };

    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});