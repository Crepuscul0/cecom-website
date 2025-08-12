import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../ContactForm';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create mock translation functions for both languages
const createMockTranslations = (locale: 'en' | 'es') => {
  const translations = {
    en: {
      Contact: {
        'form.fullName': 'Full name',
        'form.fullNamePlaceholder': 'Full name',
        'form.emailPlaceholder': 'Email',
        'form.phonePlaceholder': 'Phone',
        'form.message': 'Message',
        'form.messagePlaceholder': 'Message',
        'form.submit': 'Submit',
        'form.sending': 'Sending...',
        'form.successMessage': 'Message sent successfully. We will get back to you soon.',
        'form.errorMessage': 'Error sending message. Please try again.',
        'emailAddress': 'Email address',
        'phoneNumber': 'Phone number',
      },
      Validation: {
        'requiredField': 'This field is required',
        'nameMinLength': 'Name must be at least 2 characters',
        'messageMinLength': 'Message must be at least 10 characters',
        'phoneMinLength': 'Phone number must be at least 10 digits',
        'invalidEmail': 'Please enter a valid email address',
        'invalidPhone': 'Please enter a valid phone number',
        'invalidName': 'Name can only contain letters and spaces',
        'maxLength': 'Must be no more than {max} characters',
      }
    },
    es: {
      Contact: {
        'form.fullName': 'Nombre completo',
        'form.fullNamePlaceholder': 'Nombre completo',
        'form.emailPlaceholder': 'Correo electrónico',
        'form.phonePlaceholder': 'Teléfono',
        'form.message': 'Mensaje',
        'form.messagePlaceholder': 'Mensaje',
        'form.submit': 'Enviar',
        'form.sending': 'Enviando...',
        'form.successMessage': 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.',
        'form.errorMessage': 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
        'emailAddress': 'Dirección de correo electrónico',
        'phoneNumber': 'Número de teléfono',
      },
      Validation: {
        'requiredField': 'Este campo es requerido',
        'nameMinLength': 'El nombre debe tener al menos 2 caracteres',
        'messageMinLength': 'El mensaje debe tener al menos 10 caracteres',
        'phoneMinLength': 'El número de teléfono debe tener al menos 10 dígitos',
        'invalidEmail': 'Por favor ingrese un correo electrónico válido',
        'invalidPhone': 'Por favor ingrese un número de teléfono válido',
        'invalidName': 'El nombre solo puede contener letras y espacios',
        'maxLength': 'No debe tener más de {max} caracteres',
      }
    }
  };

  return (namespace: string) => (key: string) => {
    const namespaceTranslations = translations[locale][namespace as keyof typeof translations[typeof locale]];
    return namespaceTranslations?.[key as keyof typeof namespaceTranslations] || key;
  };
};

// next-intl is already mocked in test setup

describe('ContactForm Validation Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    vi.clearAllMocks();
    // Clean up DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up DOM
    document.body.innerHTML = '';
  });

  describe('English Language Validation', () => {
    beforeEach(() => {
      const { useTranslations } = require('next-intl');
      useTranslations.mockReturnValue(createMockTranslations('en')('Contact'));
    });

    it('should show English validation errors for empty form submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument();
      });

      // Should show multiple required field errors
      const requiredErrors = screen.getAllByText('This field is required');
      expect(requiredErrors).toHaveLength(4); // fullName, email, phone, message
    });

    it('should show English validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should show English validation error for short name', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByPlaceholderText('Full name');
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(nameInput, 'J');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should show English validation error for invalid phone', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const phoneInput = screen.getByPlaceholderText('Phone');
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(phoneInput, 'abc123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });
    });

    it('should show English validation error for short message', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByPlaceholderText('Message');
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(messageInput, 'Short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('should show English success message on successful form submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Contact form submitted successfully' }),
      });

      render(<ContactForm />);

      // Fill out the form with valid data
      await user.type(screen.getByPlaceholderText('Full name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Email'), 'john@example.com');
      await user.type(screen.getByPlaceholderText('Phone'), '+1 (555) 123-4567');
      await user.type(screen.getByPlaceholderText('Message'), 'This is a test message that is long enough to pass validation.');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message sent successfully. We will get back to you soon.')).toBeInTheDocument();
      });
    });

    it('should show English error message on failed form submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      render(<ContactForm />);

      // Fill out the form with valid data
      await user.type(screen.getByPlaceholderText('Full name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Email'), 'john@example.com');
      await user.type(screen.getByPlaceholderText('Phone'), '+1 (555) 123-4567');
      await user.type(screen.getByPlaceholderText('Message'), 'This is a test message that is long enough to pass validation.');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error sending message. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show loading state in English during form submission', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 100))
      );

      render(<ContactForm />);

      // Fill out the form with valid data
      await user.type(screen.getByPlaceholderText('Full name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Email'), 'john@example.com');
      await user.type(screen.getByPlaceholderText('Phone'), '+1 (555) 123-4567');
      await user.type(screen.getByPlaceholderText('Message'), 'This is a test message that is long enough to pass validation.');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Spanish Language Validation', () => {
    beforeEach(() => {
      const { useTranslations } = require('next-intl');
      useTranslations.mockImplementation(createMockTranslations('es'));
    });

    it('should show Spanish validation errors for empty form submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Este campo es requerido')).toBeInTheDocument();
      });

      // Should show multiple required field errors
      const requiredErrors = screen.getAllByText('Este campo es requerido');
      expect(requiredErrors).toHaveLength(4); // fullName, email, phone, message
    });

    it('should show Spanish validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailInput = screen.getByPlaceholderText('Correo electrónico');
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      await user.type(emailInput, 'correo-invalido');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Por favor ingrese un correo electrónico válido')).toBeInTheDocument();
      });
    });

    it('should show Spanish validation error for short name', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByPlaceholderText('Nombre completo');
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      await user.type(nameInput, 'J');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
      });
    });

    it('should show Spanish validation error for invalid phone', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const phoneInput = screen.getByPlaceholderText('Teléfono');
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      await user.type(phoneInput, 'abc123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Por favor ingrese un número de teléfono válido')).toBeInTheDocument();
      });
    });

    it('should show Spanish validation error for short message', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByPlaceholderText('Mensaje');
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      await user.type(messageInput, 'Corto');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('El mensaje debe tener al menos 10 caracteres')).toBeInTheDocument();
      });
    });

    it('should show Spanish success message on successful form submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Contact form submitted successfully' }),
      });

      render(<ContactForm />);

      // Fill out the form with valid data in Spanish
      await user.type(screen.getByPlaceholderText('Nombre completo'), 'María González');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'maria@example.com');
      await user.type(screen.getByPlaceholderText('Teléfono'), '+1 (809) 555-0123');
      await user.type(screen.getByPlaceholderText('Mensaje'), 'Este es un mensaje de prueba que es lo suficientemente largo para pasar la validación.');

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.')).toBeInTheDocument();
      });
    });

    it('should show Spanish error message on failed form submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      render(<ContactForm />);

      // Fill out the form with valid data in Spanish
      await user.type(screen.getByPlaceholderText('Nombre completo'), 'María González');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'maria@example.com');
      await user.type(screen.getByPlaceholderText('Teléfono'), '+1 (809) 555-0123');
      await user.type(screen.getByPlaceholderText('Mensaje'), 'Este es un mensaje de prueba que es lo suficientemente largo para pasar la validación.');

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error al enviar el mensaje. Por favor, inténtalo de nuevo.')).toBeInTheDocument();
      });
    });

    it('should show loading state in Spanish during form submission', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 100))
      );

      render(<ContactForm />);

      // Fill out the form with valid data in Spanish
      await user.type(screen.getByPlaceholderText('Nombre completo'), 'María González');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'maria@example.com');
      await user.type(screen.getByPlaceholderText('Teléfono'), '+1 (809) 555-0123');
      await user.type(screen.getByPlaceholderText('Mensaje'), 'Este es un mensaje de prueba que es lo suficientemente largo para pasar la validación.');

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(submitButton);

      // Should show loading state in Spanish
      expect(screen.getByText('Enviando...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle Spanish characters in form fields correctly', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<ContactForm />);

      // Fill out the form with Spanish characters
      await user.type(screen.getByPlaceholderText('Nombre completo'), 'José María Rodríguez Pérez');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'jose.maria@example.com');
      await user.type(screen.getByPlaceholderText('Teléfono'), '+1 (809) 555-0123');
      await user.type(screen.getByPlaceholderText('Mensaje'), 'Este es un mensaje con caracteres especiales: ñáéíóúü. Debe ser lo suficientemente largo para pasar la validación.');

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.')).toBeInTheDocument();
      });

      // Verify the form was submitted with correct data
      expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'José María Rodríguez Pérez',
          email: 'jose.maria@example.com',
          phone: '+1 (809) 555-0123',
          message: 'Este es un mensaje con caracteres especiales: ñáéíóúü. Debe ser lo suficientemente largo para pasar la validación.',
        }),
      });
    });
  });

  describe('Cross-Language Validation Consistency', () => {
    it('should validate the same data consistently in both languages', async () => {
      const testData = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1 (555) 123-4567',
        message: 'This is a test message that should pass validation in both languages.',
      };

      // Test in English
      const { useTranslations } = require('next-intl');
      useTranslations.mockImplementation(createMockTranslations('en'));

      render(<ContactForm />);
      
      const user = userEvent.setup();
      
      // Fill form in English
      await user.type(screen.getByPlaceholderText('Full name'), testData.fullName);
      await user.type(screen.getByPlaceholderText('Email'), testData.email);
      await user.type(screen.getByPlaceholderText('Phone'), testData.phone);
      await user.type(screen.getByPlaceholderText('Message'), testData.message);

      // Should not show any validation errors
      expect(screen.queryByText(/This field is required/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Please enter a valid/)).not.toBeInTheDocument();

      // Clean up for next test
      document.body.innerHTML = '';

      // Test in Spanish
      useTranslations.mockImplementation(createMockTranslations('es'));

      render(<ContactForm />);
      
      // Fill form in Spanish
      await user.type(screen.getByPlaceholderText('Nombre completo'), testData.fullName);
      await user.type(screen.getByPlaceholderText('Correo electrónico'), testData.email);
      await user.type(screen.getByPlaceholderText('Teléfono'), testData.phone);
      await user.type(screen.getByPlaceholderText('Mensaje'), testData.message);

      // Should not show any validation errors
      expect(screen.queryByText(/Este campo es requerido/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Por favor ingrese/)).not.toBeInTheDocument();
    });
  });
});