import { z } from 'zod';

// Fallback messages in case translations are not available
const fallbackMessages = {
  requiredField: 'This field is required',
  nameMinLength: 'Name must be at least 2 characters',
  maxLength: 'Must be no more than {max} characters',
  invalidName: 'Name can only contain letters and spaces',
  invalidEmail: 'Please enter a valid email address',
  phoneMinLength: 'Phone number must be at least 10 digits',
  invalidPhone: 'Please enter a valid phone number',
  messageMinLength: 'Message must be at least 10 characters',
};

// Safe translation function that handles missing translations
const safeTranslate = (t: (key: string) => string, key: string): string => {
  try {
    const translation = t(key);
    // Check if the translation is missing (next-intl returns the key when missing)
    if (translation === key || !translation) {
      return fallbackMessages[key as keyof typeof fallbackMessages] || key;
    }
    return translation;
  } catch (error) {
    console.warn(`Translation error for key "${key}":`, error);
    return fallbackMessages[key as keyof typeof fallbackMessages] || key;
  }
};

// Create a function that returns the schema with translated messages
export const createContactFormSchema = (t: (key: string) => string) => {
  return z.object({
    fullName: z
      .string()
      .min(1, safeTranslate(t, 'requiredField'))
      .min(2, safeTranslate(t, 'nameMinLength'))
      .max(100, safeTranslate(t, 'maxLength').replace('{max}', '100'))
      .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, safeTranslate(t, 'invalidName')),
    
    email: z
      .string()
      .min(1, safeTranslate(t, 'requiredField'))
      .email(safeTranslate(t, 'invalidEmail'))
      .max(255, safeTranslate(t, 'maxLength').replace('{max}', '255')),
    
    phone: z
      .string()
      .min(1, safeTranslate(t, 'requiredField'))
      .min(10, safeTranslate(t, 'phoneMinLength'))
      .max(20, safeTranslate(t, 'maxLength').replace('{max}', '20'))
      .regex(/^[\+]?[0-9\s\-\(\)]+$/, safeTranslate(t, 'invalidPhone')),
    
    message: z
      .string()
      .min(1, safeTranslate(t, 'requiredField'))
      .min(10, safeTranslate(t, 'messageMinLength'))
      .max(1000, safeTranslate(t, 'maxLength').replace('{max}', '1000')),
  });
};

// Base schema type for TypeScript inference
const baseSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  message: z.string(),
});

export type ContactFormData = z.infer<typeof baseSchema>;