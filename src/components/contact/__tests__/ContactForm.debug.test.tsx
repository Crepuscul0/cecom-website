import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../ContactForm';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create mock translation functions for English
const createMockTranslations = () => {
  const translations = {
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
  };

  return (namespace: string) => (key: string) => {
    const namespaceTranslations = translations[namespace as keyof typeof translations];
    return namespaceTranslations?.[key as keyof typeof namespaceTranslations] || key;
  };
};

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

describe('ContactForm Debug Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    vi.clearAllMocks();
    document.body.innerHTML = '';
    
    const { useTranslations } = require('next-intl');
    vi.mocked(useTranslations).mockImplementation(createMockTranslations());
  });

  it('should render form with correct placeholders', () => {
    render(<ContactForm />);
    
    // Debug: log all elements
    screen.debug();
    
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

    // Debug: log all elements after submission
    screen.debug();
    
    // Check what error messages are actually showing
    const allErrorMessages = screen.getAllByText(/required|must|please|invalid/i);
    console.log('Found error messages:', allErrorMessages.map(el => el.textContent));
  });
});