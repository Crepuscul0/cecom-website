import { z } from 'zod';

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number'),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Validation error messages in both languages
export const getValidationMessages = (locale: 'en' | 'es') => ({
  fullName: {
    required: locale === 'es' ? 'El nombre es requerido' : 'Name is required',
    minLength: locale === 'es' ? 'El nombre debe tener al menos 2 caracteres' : 'Name must be at least 2 characters',
    maxLength: locale === 'es' ? 'El nombre debe tener menos de 100 caracteres' : 'Name must be less than 100 characters',
    pattern: locale === 'es' ? 'El nombre solo puede contener letras y espacios' : 'Name can only contain letters and spaces',
  },
  email: {
    required: locale === 'es' ? 'El correo electrónico es requerido' : 'Email is required',
    invalid: locale === 'es' ? 'Por favor ingrese un correo electrónico válido' : 'Please enter a valid email address',
    maxLength: locale === 'es' ? 'El correo debe tener menos de 255 caracteres' : 'Email must be less than 255 characters',
  },
  phone: {
    required: locale === 'es' ? 'El teléfono es requerido' : 'Phone is required',
    minLength: locale === 'es' ? 'El teléfono debe tener al menos 10 dígitos' : 'Phone number must be at least 10 digits',
    maxLength: locale === 'es' ? 'El teléfono debe tener menos de 20 caracteres' : 'Phone number must be less than 20 characters',
    pattern: locale === 'es' ? 'Por favor ingrese un número de teléfono válido' : 'Please enter a valid phone number',
  },
  message: {
    required: locale === 'es' ? 'El mensaje es requerido' : 'Message is required',
    minLength: locale === 'es' ? 'El mensaje debe tener al menos 10 caracteres' : 'Message must be at least 10 characters',
    maxLength: locale === 'es' ? 'El mensaje debe tener menos de 1000 caracteres' : 'Message must be less than 1000 characters',
  },
});