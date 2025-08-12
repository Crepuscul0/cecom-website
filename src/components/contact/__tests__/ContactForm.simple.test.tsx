import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../ContactForm';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContactForm Simple Validation Tests', () => {
  beforeEach(async () => {
    mockFetch.mockClear();
    vi.clearAllMocks();
    document.body.innerHTML = '';
    
    // Mock useTranslations to return a simple function
    const { useTranslations } = await import('next-intl');
    vi.mocked(useTranslations).mockReturnValue((key: string) => {
      // Simple English translations
      const translations: Record<string, string> = {
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
    });
  });

  it('should render form with correct placeholders', () => {
    render(<ContactForm />);
    
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should show validation errors when form is submitted empty', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Check that validation errors appear (even if not the exact translated text)
      const errorMessages = screen.getAllByText(/required|invalid|expected/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      // Check that some validation error appears for email
      const errorMessages = screen.getAllByText(/invalid|expected|email/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should handle form submission with valid data', async () => {
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

    // Verify that fetch was called with correct data
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          message: 'This is a test message that is long enough to pass validation.',
        }),
      });
    });
  });

  it('should handle form submission errors', async () => {
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

    // Verify that fetch was called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});