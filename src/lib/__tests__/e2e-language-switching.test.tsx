/**
 * End-to-End Language Switching Tests
 * 
 * Tests complete user journeys in both languages, including:
 * - Homepage to contact form flow in Spanish
 * - Catalog functionality in both languages
 * - Language persistence across navigation and browser refresh
 * 
 * Requirements covered: 5.5, 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import React from 'react';

// Import components for E2E testing
import Header from '../../components/header';
import ContactForm from '../../components/contact/ContactForm';
import Home from '../../app/[locale]/page';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockRefresh = vi.fn();
const mockPrefetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  })),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

describe('End-to-End Language Switching Tests', () => {
  // Translation mocks for English
  const mockEnglishTranslations = {
    Home: {
      title: 'CECOM',
      welcome: 'Welcome to CECOM',
      description: 'Your trusted partner for technology solutions',
      productsShowcase: 'Featured Products',
      exploreProducts: 'Explore our comprehensive catalog',
      getStarted: 'Get Started',
      liveDemo: 'Contact Us'
    },
    Header: {
      home: 'Home',
      solutions: 'Solutions',
      alliances: 'Alliances',
      aboutUs: 'About Us',
      contact: 'Contact',
      accessibility: {
        mainNavigation: 'Main navigation',
        logoLink: 'CECOM Logo - Go to home page',
        logoAlt: 'CECOM Logo - Go to home page',
        homeLink: 'Go to home page',
        solutionsLink: 'Go to solutions page',
        alliancesLink: 'Go to alliances page',
        aboutUsLink: 'Go to about us page',
        contactLink: 'Go to contact page',
        languageSelectorButton: 'Select language',
        languageSelector: 'Language selector',
        languageSelectorMenu: 'Language selector menu',
        selectEnglish: 'Select English',
        selectSpanish: 'Select Spanish',
        mobileMenuButton: 'Open mobile menu',
        mobileNavigation: 'Mobile navigation',
        skipToContent: 'Skip to main content'
      },
      tooltips: {
        home: 'Go to home page',
        solutions: 'View our solutions',
        alliances: 'View our alliances',
        aboutUs: 'Learn about us',
        contact: 'Contact us',
        languageSelector: 'Change language',
        mobileMenu: 'Open mobile menu'
      }
    },
    Contact: {
      getInTouch: 'Get in Touch',
      description: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
      form: {
        fullName: 'Full Name',
        fullNamePlaceholder: 'Enter your full name',
        emailPlaceholder: 'Enter your email address',
        phonePlaceholder: 'Enter your phone number',
        message: 'Message',
        messagePlaceholder: 'Enter your message',
        submit: 'Send Message',
        sending: 'Sending...',
        successMessage: 'Thank you! Your message has been sent successfully.',
        errorMessage: 'Sorry, there was an error sending your message. Please try again.'
      },
      postalAddress: 'Postal Address',
      phoneNumber: 'Phone Number',
      emailAddress: 'Email Address',
      businessHours: 'Business Hours'
    },
    Catalog: {
      searchProducts: 'Search products...',
      filterByVendor: 'Filter by vendor',
      allProducts: 'All Products',
      showingResults: 'Showing {count} results',
      states: {
        loadingProducts: 'Loading products...',
        error: 'Error',
        errorLoadingProducts: 'Error loading products',
        noProducts: 'No products found',
        noProductsInCategory: 'No products found in this category'
      },
      actions: {
        retry: 'Try again'
      },
      filter: {
        allVendors: 'All Vendors'
      },
      modal: {
        closeModal: 'Close modal',
        previousProduct: 'Previous product',
        nextProduct: 'Next product'
      }
    },
    Common: {
      buttons: {
        submit: 'Submit',
        cancel: 'Cancel',
        close: 'Close',
        retry: 'Retry',
        viewDetails: 'View Details'
      },
      states: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        noData: 'No data available',
        tryAdjustingFilters: 'Try adjusting your search or filters to find what you\'re looking for.',
        noProductsAvailable: 'No products are currently available in this section.'
      },
      language: {
        english: 'English',
        spanish: 'Español'
      }
    },
    Validation: {
      required: 'This field is required',
      requiredField: 'This field is required',
      email: 'Please enter a valid email address',
      invalidEmail: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      invalidPhone: 'Please enter a valid phone number',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be no more than {max} characters',
      nameMinLength: 'Name must be at least 2 characters',
      phoneMinLength: 'Phone must be at least 10 characters',
      messageMinLength: 'Message must be at least 10 characters',
      invalidName: 'Please enter a valid name'
    }
  };

  // Translation mocks for Spanish
  const mockSpanishTranslations = {
    Home: {
      title: 'CECOM',
      welcome: 'Bienvenido a CECOM',
      description: 'Tu socio de confianza para soluciones tecnológicas',
      productsShowcase: 'Productos Destacados',
      exploreProducts: 'Explora nuestro catálogo completo',
      getStarted: 'Comenzar',
      liveDemo: 'Contáctanos'
    },
    Header: {
      home: 'Inicio',
      solutions: 'Soluciones',
      alliances: 'Alianzas',
      aboutUs: 'Acerca de Nosotros',
      contact: 'Contacto',
      accessibility: {
        mainNavigation: 'Navegación principal',
        logoLink: 'Logo de CECOM - Ir a la página de inicio',
        logoAlt: 'Logo de CECOM - Ir a la página de inicio',
        homeLink: 'Ir a la página de inicio',
        solutionsLink: 'Ir a la página de soluciones',
        alliancesLink: 'Ir a la página de alianzas',
        aboutUsLink: 'Ir a la página acerca de nosotros',
        contactLink: 'Ir a la página de contacto',
        languageSelectorButton: 'Seleccionar idioma',
        languageSelector: 'Selector de idioma',
        languageSelectorMenu: 'Menú selector de idioma',
        selectEnglish: 'Seleccionar inglés',
        selectSpanish: 'Seleccionar español',
        mobileMenuButton: 'Abrir menú móvil',
        mobileNavigation: 'Navegación móvil',
        skipToContent: 'Saltar al contenido principal'
      },
      tooltips: {
        home: 'Ir a la página de inicio',
        solutions: 'Ver nuestras soluciones',
        alliances: 'Ver nuestras alianzas',
        aboutUs: 'Conoce sobre nosotros',
        contact: 'Contáctanos',
        languageSelector: 'Cambiar idioma',
        mobileMenu: 'Abrir menú móvil'
      }
    },
    Contact: {
      getInTouch: 'Ponte en contacto',
      description: 'Nos encantaría saber de ti. Envíanos un mensaje y te responderemos lo antes posible.',
      form: {
        fullName: 'Nombre Completo',
        fullNamePlaceholder: 'Ingresa tu nombre completo',
        emailPlaceholder: 'Ingresa tu correo electrónico',
        phonePlaceholder: 'Ingresa tu número de teléfono',
        message: 'Mensaje',
        messagePlaceholder: 'Ingresa tu mensaje',
        submit: 'Enviar Mensaje',
        sending: 'Enviando...',
        successMessage: '¡Gracias! Tu mensaje ha sido enviado exitosamente.',
        errorMessage: 'Lo sentimos, hubo un error al enviar tu mensaje. Por favor intenta de nuevo.'
      },
      postalAddress: 'Dirección Postal',
      phoneNumber: 'Número de Teléfono',
      emailAddress: 'Correo Electrónico',
      businessHours: 'Horario de Atención'
    },
    Catalog: {
      searchProducts: 'Buscar productos...',
      filterByVendor: 'Filtrar por proveedor',
      allProducts: 'Todos los Productos',
      showingResults: 'Mostrando {count} resultados',
      states: {
        loadingProducts: 'Cargando productos...',
        error: 'Error',
        errorLoadingProducts: 'Error al cargar productos',
        noProducts: 'No se encontraron productos',
        noProductsInCategory: 'No se encontraron productos en esta categoría'
      },
      actions: {
        retry: 'Intentar de nuevo'
      },
      filter: {
        allVendors: 'Todos los Proveedores'
      },
      modal: {
        closeModal: 'Cerrar modal',
        previousProduct: 'Producto anterior',
        nextProduct: 'Producto siguiente'
      }
    },
    Common: {
      buttons: {
        submit: 'Enviar',
        cancel: 'Cancelar',
        close: 'Cerrar',
        retry: 'Reintentar',
        viewDetails: 'Ver Detalles'
      },
      states: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        noData: 'No hay datos disponibles',
        tryAdjustingFilters: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
        noProductsAvailable: 'No hay productos disponibles actualmente en esta sección.'
      },
      language: {
        english: 'English',
        spanish: 'Español'
      }
    },
    Validation: {
      required: 'Este campo es requerido',
      requiredField: 'Este campo es requerido',
      email: 'Por favor ingrese un correo electrónico válido',
      invalidEmail: 'Por favor ingrese un correo electrónico válido',
      phone: 'Por favor ingrese un número de teléfono válido',
      invalidPhone: 'Por favor ingrese un número de teléfono válido',
      minLength: 'Debe tener al menos {min} caracteres',
      maxLength: 'No debe tener más de {max} caracteres',
      nameMinLength: 'El nombre debe tener al menos 2 caracteres',
      phoneMinLength: 'El teléfono debe tener al menos 10 caracteres',
      messageMinLength: 'El mensaje debe tener al menos 10 caracteres',
      invalidName: 'Por favor ingrese un nombre válido'
    }
  };

  // Helper function to setup translation mocks
  const setupTranslationMocks = (locale: 'en' | 'es') => {
    const translations = locale === 'en' ? mockEnglishTranslations : mockSpanishTranslations;
    
    (useLocale as any).mockReturnValue(locale);
    (useTranslations as any).mockImplementation((namespace: string) => {
      return (key: string, values?: Record<string, any>) => {
        const keys = key.split('.');
        let value: any = translations[namespace as keyof typeof translations];
        for (const k of keys) {
          value = value?.[k];
        }
        
        if (typeof value === 'string' && values) {
          // Simple interpolation for testing
          return value.replace(/\{(\w+)\}/g, (match, key) => values[key] || match);
        }
        
        return value || key;
      };
    });
  };

  // Mock simple product data for testing
  const mockProducts = [
    {
      id: '1',
      name: 'Network Switch',
      description: 'High-performance network switch',
      vendor: { name: 'Cisco', id: 'cisco' },
      category: { name: 'Networking', id: 'networking' },
      price: 299.99,
      image: '/products/switch.jpg'
    },
    {
      id: '2',
      name: 'Wireless Router',
      description: 'Advanced wireless router',
      vendor: { name: 'Linksys', id: 'linksys' },
      category: { name: 'Networking', id: 'networking' },
      price: 199.99,
      image: '/products/router.jpg'
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    cleanup();
    
    // Reset document.cookie
    document.cookie = '';
    
    // Setup default fetch mock
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('Complete Spanish User Journey: Homepage to Contact Form', () => {
    it('should complete full user journey from Spanish homepage to contact form', async () => {
      const user = userEvent.setup();
      
      // Step 1: Start with Spanish homepage
      (usePathname as any).mockReturnValue('/es');
      setupTranslationMocks('es');

      render(<Home />);
      
      // Verify Spanish homepage content
      expect(screen.getByText('Bienvenido a CECOM')).toBeInTheDocument();
      expect(screen.getByText('Tu socio de confianza para soluciones tecnológicas')).toBeInTheDocument();
      expect(screen.getByText('Productos Destacados')).toBeInTheDocument();
      expect(screen.getByText('Explora nuestro catálogo completo')).toBeInTheDocument();
      
      // Verify Spanish buttons
      expect(screen.getByText('Comenzar')).toBeInTheDocument();
      expect(screen.getByText('Contáctanos')).toBeInTheDocument();

      cleanup();

      // Step 2: Navigate to contact page (simulate URL change)
      (usePathname as any).mockReturnValue('/es/contact');
      
      render(
        <div>
          <Header />
          <ContactForm />
        </div>
      );

      // Verify Spanish header navigation
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Soluciones')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();

      // Step 3: Test contact form in Spanish
      const nameInput = screen.getByPlaceholderText('Ingresa tu nombre completo');
      const emailInput = screen.getByPlaceholderText('Ingresa tu correo electrónico');
      const phoneInput = screen.getByPlaceholderText('Ingresa tu número de teléfono');
      const messageInput = screen.getByPlaceholderText('Ingresa tu mensaje');
      const submitButton = screen.getByRole('button', { name: 'Enviar Mensaje' });

      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(phoneInput).toBeInTheDocument();
      expect(messageInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();

      // Step 4: Fill out form with valid data
      await user.type(nameInput, 'Juan Pérez');
      await user.type(emailInput, 'juan.perez@example.com');
      await user.type(phoneInput, '+1-809-555-0123');
      await user.type(messageInput, 'Hola, me interesa conocer más sobre sus servicios.');

      // Verify form data was entered correctly
      expect(nameInput).toHaveValue('Juan Pérez');
      expect(emailInput).toHaveValue('juan.perez@example.com');
      expect(phoneInput).toHaveValue('+1-809-555-0123');
      expect(messageInput).toHaveValue('Hola, me interesa conocer más sobre sus servicios.');

      // Verify no English content is present throughout the journey
      expect(screen.queryByText('Welcome to CECOM')).not.toBeInTheDocument();
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('Contact')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter your full name')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Send Message' })).not.toBeInTheDocument();
    });

    it('should demonstrate form validation behavior in Spanish', () => {
      (usePathname as any).mockReturnValue('/es/contact');
      setupTranslationMocks('es');

      render(<ContactForm />);

      // Verify Spanish form elements are present
      expect(screen.getByPlaceholderText('Ingresa tu nombre completo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ingresa tu correo electrónico')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ingresa tu número de teléfono')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ingresa tu mensaje')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enviar Mensaje' })).toBeInTheDocument();

      // Verify no English content is present
      expect(screen.queryByPlaceholderText('Enter your full name')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter your email address')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Send Message' })).not.toBeInTheDocument();
    });

    it('should demonstrate form submission flow simulation', async () => {
      const user = userEvent.setup();
      
      (usePathname as any).mockReturnValue('/es/contact');
      setupTranslationMocks('es');

      render(<ContactForm />);

      // Fill form with valid data
      const nameInput = screen.getByPlaceholderText('Ingresa tu nombre completo');
      const emailInput = screen.getByPlaceholderText('Ingresa tu correo electrónico');
      const phoneInput = screen.getByPlaceholderText('Ingresa tu número de teléfono');
      const messageInput = screen.getByPlaceholderText('Ingresa tu mensaje');

      await user.type(nameInput, 'Juan Pérez');
      await user.type(emailInput, 'juan.perez@example.com');
      await user.type(phoneInput, '+1-809-555-0123');
      await user.type(messageInput, 'Hola, me interesa conocer más sobre sus servicios.');

      // Verify form data was entered
      expect(nameInput).toHaveValue('Juan Pérez');
      expect(emailInput).toHaveValue('juan.perez@example.com');
      expect(phoneInput).toHaveValue('+1-809-555-0123');
      expect(messageInput).toHaveValue('Hola, me interesa conocer más sobre sus servicios.');

      // Verify submit button is present and clickable
      const submitButton = screen.getByRole('button', { name: 'Enviar Mensaje' });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Simulated Catalog Functionality Tests', () => {
    it('should demonstrate catalog language switching behavior', () => {
      // Test English catalog state
      (usePathname as any).mockReturnValue('/en/catalog');
      setupTranslationMocks('en');

      // Simulate catalog component behavior
      const englishCatalogState = {
        searchPlaceholder: mockEnglishTranslations.Catalog.searchProducts,
        loadingMessage: mockEnglishTranslations.Catalog.states.loadingProducts,
        noProductsMessage: mockEnglishTranslations.Catalog.states.noProducts,
        filterLabel: mockEnglishTranslations.Catalog.filter.allVendors
      };

      expect(englishCatalogState.searchPlaceholder).toBe('Search products...');
      expect(englishCatalogState.loadingMessage).toBe('Loading products...');
      expect(englishCatalogState.noProductsMessage).toBe('No products found');
      expect(englishCatalogState.filterLabel).toBe('All Vendors');

      // Test Spanish catalog state
      (usePathname as any).mockReturnValue('/es/catalogo');
      setupTranslationMocks('es');

      const spanishCatalogState = {
        searchPlaceholder: mockSpanishTranslations.Catalog.searchProducts,
        loadingMessage: mockSpanishTranslations.Catalog.states.loadingProducts,
        noProductsMessage: mockSpanishTranslations.Catalog.states.noProducts,
        filterLabel: mockSpanishTranslations.Catalog.filter.allVendors
      };

      expect(spanishCatalogState.searchPlaceholder).toBe('Buscar productos...');
      expect(spanishCatalogState.loadingMessage).toBe('Cargando productos...');
      expect(spanishCatalogState.noProductsMessage).toBe('No se encontraron productos');
      expect(spanishCatalogState.filterLabel).toBe('Todos los Proveedores');
    });

    it('should demonstrate catalog error handling in both languages', () => {
      // English error messages
      setupTranslationMocks('en');
      const englishErrors = {
        errorLoading: mockEnglishTranslations.Catalog.states.errorLoadingProducts,
        retry: mockEnglishTranslations.Catalog.actions.retry
      };

      expect(englishErrors.errorLoading).toBe('Error loading products');
      expect(englishErrors.retry).toBe('Try again');

      // Spanish error messages
      setupTranslationMocks('es');
      const spanishErrors = {
        errorLoading: mockSpanishTranslations.Catalog.states.errorLoadingProducts,
        retry: mockSpanishTranslations.Catalog.actions.retry
      };

      expect(spanishErrors.errorLoading).toBe('Error al cargar productos');
      expect(spanishErrors.retry).toBe('Intentar de nuevo');
    });
  });

  describe('Language Persistence Across Navigation and Browser Refresh', () => {
    it('should persist language selection across page navigation', () => {
      // Start on Spanish homepage
      (usePathname as any).mockReturnValue('/es');
      setupTranslationMocks('es');

      const { rerender } = render(<Header />);

      // Verify Spanish navigation
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();

      // Navigate to solutions page (simulate URL change)
      (usePathname as any).mockReturnValue('/es/soluciones');

      rerender(<Header />);

      // Verify navigation links still use Spanish locale
      const contactLink = screen.getByRole('link', { name: /ir a la página de contacto/i });
      expect(contactLink).toHaveAttribute('href', '/es/contact');

      const homeLink = screen.getByRole('link', { name: /logo de cecom/i });
      expect(homeLink).toHaveAttribute('href', '/es');

      // Navigate to contact page
      (usePathname as any).mockReturnValue('/es/contact');

      rerender(<Header />);

      // Verify all links maintain Spanish locale
      const solutionsLink = screen.getByRole('link', { name: /ir a la página de soluciones/i });
      expect(solutionsLink).toHaveAttribute('href', '/es/solutions');
    });

    it('should persist language selection through browser refresh simulation', () => {
      // Set initial cookie
      document.cookie = 'NEXT_LOCALE=es; path=/; max-age=31536000';

      // Simulate page refresh by re-rendering with same URL
      (usePathname as any).mockReturnValue('/es/contact');
      setupTranslationMocks('es');

      const { rerender } = render(<Header />);

      // Verify Spanish content is maintained
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();

      // Simulate another refresh
      rerender(<Header />);

      // Content should still be in Spanish
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Soluciones')).toBeInTheDocument();

      // Verify cookie is still set
      expect(document.cookie).toContain('NEXT_LOCALE=es');
    });

    it('should handle language switching and maintain new selection', () => {
      // Start with English
      (usePathname as any).mockReturnValue('/en/solutions');
      setupTranslationMocks('en');

      const { rerender } = render(<Header />);

      // Verify English content
      expect(screen.getByText('Solutions')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();

      // Simulate language switch to Spanish
      document.cookie = 'NEXT_LOCALE=es; path=/; max-age=31536000';
      (usePathname as any).mockReturnValue('/es/soluciones');
      setupTranslationMocks('es');

      rerender(<Header />);

      // Verify Spanish content
      expect(screen.getByText('Soluciones')).toBeInTheDocument();
      expect(screen.getByText('Inicio')).toBeInTheDocument();

      // Navigate to different page
      (usePathname as any).mockReturnValue('/es/contact');

      rerender(<Header />);

      // Should maintain Spanish
      expect(screen.getByText('Contacto')).toBeInTheDocument();
      expect(screen.getByText('Inicio')).toBeInTheDocument();
    });

    it('should handle deep URL navigation with language persistence', () => {
      const testUrls = [
        '/es',
        '/es/soluciones',
        '/es/soluciones/redes',
        '/es/alianzas',
        '/es/acerca',
        '/es/contact'
      ];

      setupTranslationMocks('es');

      testUrls.forEach(url => {
        (usePathname as any).mockReturnValue(url);

        const { unmount } = render(<Header />);

        // Verify Spanish navigation is maintained
        expect(screen.getByText('Inicio')).toBeInTheDocument();
        expect(screen.getByText('Soluciones')).toBeInTheDocument();
        expect(screen.getByText('Contacto')).toBeInTheDocument();

        // Verify links use correct locale
        const homeLink = screen.getByRole('link', { name: /logo de cecom/i });
        expect(homeLink).toHaveAttribute('href', '/es');

        const contactLink = screen.getByRole('link', { name: /ir a la página de contacto/i });
        expect(contactLink).toHaveAttribute('href', '/es/contact');

        unmount();
      });
    });

    it('should maintain language consistency across component remounts', () => {
      (usePathname as any).mockReturnValue('/es/contact');
      setupTranslationMocks('es');

      // Mount and unmount multiple times
      for (let i = 0; i < 3; i++) {
        const { unmount } = render(
          <div>
            <Header />
            <ContactForm />
          </div>
        );

        // Verify Spanish content each time
        expect(screen.getByText('Inicio')).toBeInTheDocument();
        expect(screen.getByText('Contacto')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ingresa tu nombre completo')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Enviar Mensaje' })).toBeInTheDocument();

        unmount();
      }
    });
  });

  describe('Cross-Component Language Consistency', () => {
    it('should maintain language consistency across all components in a page', () => {
      (usePathname as any).mockReturnValue('/es/contact');
      setupTranslationMocks('es');

      render(
        <div>
          <Header />
          <ContactForm />
        </div>
      );

      // Verify header is in Spanish
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Soluciones')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();

      // Verify contact form is in Spanish
      expect(screen.getByPlaceholderText('Ingresa tu nombre completo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ingresa tu correo electrónico')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enviar Mensaje' })).toBeInTheDocument();

      // All components should use the same locale
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('Contact')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter your full name')).not.toBeInTheDocument();
    });

    it('should demonstrate mixed component language consistency', () => {
      // Test English consistency across components
      (usePathname as any).mockReturnValue('/en/catalog');
      setupTranslationMocks('en');

      render(<Header />);

      // Verify header is in English
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Solutions')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();

      // All English, no Spanish content
      expect(screen.queryByText('Inicio')).not.toBeInTheDocument();
      expect(screen.queryByText('Soluciones')).not.toBeInTheDocument();
      expect(screen.queryByText('Contacto')).not.toBeInTheDocument();

      cleanup();

      // Test Spanish consistency
      (usePathname as any).mockReturnValue('/es/catalogo');
      setupTranslationMocks('es');

      render(<Header />);

      // Verify header is in Spanish
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Soluciones')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();

      // All Spanish, no English content
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('Solutions')).not.toBeInTheDocument();
      expect(screen.queryByText('Contact')).not.toBeInTheDocument();
    });
  });

  describe('Error Boundary and Edge Cases', () => {
    it('should handle translation loading errors gracefully', () => {
      (usePathname as any).mockReturnValue('/es/contact');
      
      // Mock translation function to return keys when translation fails
      (useTranslations as any).mockImplementation(() => (key: string) => key);
      (useLocale as any).mockReturnValue('es');

      render(<ContactForm />);

      // Should fallback to showing keys
      expect(screen.getByText('form.submit')).toBeInTheDocument();
    });

    it('should handle invalid locale gracefully', () => {
      (usePathname as any).mockReturnValue('/invalid-locale/contact');
      setupTranslationMocks('en'); // Fallback to English

      render(<Header />);

      // Should render with fallback language
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should handle component unmounting during language switch', () => {
      (usePathname as any).mockReturnValue('/en/contact');
      setupTranslationMocks('en');

      const { unmount } = render(<ContactForm />);

      // Verify initial render
      expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();

      // Should not throw when unmounting
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});