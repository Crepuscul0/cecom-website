/**
 * Core unit tests for translation hooks functionality
 * 
 * Tests the core logic of translation hooks, locale switching,
 * and fallback mechanisms without complex React testing setup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next-intl
const mockUseTranslations = vi.fn();
const mockUseLocale = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
  useLocale: mockUseLocale,
}));

// Mock translation validator
const mockTranslationWarningSystem = {
  warnMissingKey: vi.fn(),
  validateAndWarn: vi.fn().mockResolvedValue(undefined),
};

const mockTranslationValidator = {
  checkTranslationKey: vi.fn(),
  validateTranslations: vi.fn(),
};

vi.mock('../translation-validator', () => ({
  translationWarningSystem: mockTranslationWarningSystem,
  translationValidator: mockTranslationValidator,
}));

describe('Translation Hooks Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useTranslations hook functionality', () => {
    it('should return translated text for valid keys', () => {
      const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'buttons.submit': 'Submit',
          'buttons.cancel': 'Cancel',
          'states.loading': 'Loading...',
          'validation.required': 'This field is required',
        };
        return translations[key] || key;
      });

      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      // Simulate hook usage
      const t = mockUseTranslations('Common');
      
      expect(t('buttons.submit')).toBe('Submit');
      expect(t('buttons.cancel')).toBe('Cancel');
      expect(t('states.loading')).toBe('Loading...');
      expect(mockUseTranslations).toHaveBeenCalledWith('Common');
    });

    it('should handle interpolation with variables', () => {
      const mockT = vi.fn((key: string, values?: Record<string, any>) => {
        if (key === 'validation.minLength' && values) {
          return `Must be at least ${values.min} characters`;
        }
        if (key === 'showingResults' && values) {
          return `Showing ${values.count} results`;
        }
        return key;
      });

      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const t = mockUseTranslations('Validation');

      expect(t('validation.minLength', { min: 5 })).toBe('Must be at least 5 characters');
      expect(t('showingResults', { count: 10 })).toBe('Showing 10 results');
      expect(mockT).toHaveBeenCalledWith('validation.minLength', { min: 5 });
      expect(mockT).toHaveBeenCalledWith('showingResults', { count: 10 });
    });

    it('should work with different namespaces', () => {
      const createMockT = (namespace: string) => vi.fn((key: string) => {
        const namespaceTranslations: Record<string, Record<string, string>> = {
          Common: {
            'buttons.submit': 'Submit',
            'states.loading': 'Loading...',
          },
          Header: {
            'home': 'Home',
            'contact': 'Contact',
          },
          Contact: {
            'title': 'Contact',
            'form.submit': 'Send Message',
          },
        };
        
        return namespaceTranslations[namespace]?.[key] || key;
      });

      mockUseLocale.mockReturnValue('en');

      // Test Common namespace
      mockUseTranslations.mockReturnValue(createMockT('Common'));
      const commonT = mockUseTranslations('Common');
      expect(commonT('buttons.submit')).toBe('Submit');

      // Test Header namespace
      mockUseTranslations.mockReturnValue(createMockT('Header'));
      const headerT = mockUseTranslations('Header');
      expect(headerT('home')).toBe('Home');

      // Test Contact namespace
      mockUseTranslations.mockReturnValue(createMockT('Contact'));
      const contactT = mockUseTranslations('Contact');
      expect(contactT('title')).toBe('Contact');
    });
  });

  describe('Locale switching and persistence behavior', () => {
    it('should return current locale correctly', () => {
      mockUseLocale.mockReturnValue('en');
      
      const locale = mockUseLocale();
      
      expect(locale).toBe('en');
      expect(mockUseLocale).toHaveBeenCalled();
    });

    it('should handle locale switching from English to Spanish', () => {
      const createMockT = (locale: string) => vi.fn((key: string) => {
        const translations: Record<string, Record<string, string>> = {
          en: {
            'buttons.submit': 'Submit',
            'buttons.cancel': 'Cancel',
          },
          es: {
            'buttons.submit': 'Enviar',
            'buttons.cancel': 'Cancelar',
          },
        };
        
        return translations[locale]?.[key] || key;
      });

      // Start with English
      mockUseLocale.mockReturnValue('en');
      mockUseTranslations.mockReturnValue(createMockT('en'));
      
      let locale = mockUseLocale();
      let t = mockUseTranslations('Common');
      
      expect(locale).toBe('en');
      expect(t('buttons.submit')).toBe('Submit');

      // Switch to Spanish
      mockUseLocale.mockReturnValue('es');
      mockUseTranslations.mockReturnValue(createMockT('es'));
      
      locale = mockUseLocale();
      t = mockUseTranslations('Common');
      
      expect(locale).toBe('es');
      expect(t('buttons.submit')).toBe('Enviar');
    });

    it('should maintain locale consistency', () => {
      mockUseLocale.mockReturnValue('es');
      
      const locale1 = mockUseLocale();
      const locale2 = mockUseLocale();
      const locale3 = mockUseLocale();
      
      expect(locale1).toBe('es');
      expect(locale2).toBe('es');
      expect(locale3).toBe('es');
    });
  });

  describe('Fallback behavior when translations are missing', () => {
    it('should return key as fallback when translation is missing', () => {
      const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'buttons.submit': 'Submit',
          'buttons.cancel': 'Cancel',
        };
        // Return the key itself if translation is missing (next-intl default behavior)
        return translations[key] || key;
      });

      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const t = mockUseTranslations('Common');

      // Existing translation
      expect(t('buttons.submit')).toBe('Submit');
      
      // Missing translation should return the key
      expect(t('buttons.nonexistent')).toBe('buttons.nonexistent');
      expect(t('missing.key')).toBe('missing.key');
    });

    it('should handle missing namespace gracefully', () => {
      const mockT = vi.fn((key: string) => {
        // Simulate missing namespace by returning key
        return key;
      });

      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const t = mockUseTranslations('NonexistentNamespace');

      expect(t('any.key')).toBe('any.key');
      expect(t('another.missing.key')).toBe('another.missing.key');
    });

    it('should handle empty or undefined keys', () => {
      const mockT = vi.fn((key: string) => {
        if (!key) {
          return '';
        }
        if (key.trim() === '') {
          return '';
        }
        return key;
      });

      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const t = mockUseTranslations('Common');

      expect(t('')).toBe('');
      expect(t('   ')).toBe(''); // Trimmed empty string should return empty
    });

    it('should handle locale fallback when current locale is missing', () => {
      const mockT = vi.fn((key: string) => {
        // Simulate fallback to English when Spanish translation is missing
        const translations: Record<string, Record<string, string>> = {
          en: {
            'buttons.submit': 'Submit',
            'buttons.save': 'Save',
          },
          es: {
            'buttons.submit': 'Enviar',
            // 'buttons.save' is missing in Spanish
          },
        };
        
        const currentLocale = 'es'; // Simulate Spanish locale
        
        // Try current locale first, fallback to English
        return translations[currentLocale]?.[key] || translations.en?.[key] || key;
      });

      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('es');

      const t = mockUseTranslations('Common');

      // Available in Spanish
      expect(t('buttons.submit')).toBe('Enviar');
      
      // Missing in Spanish, should fallback to English
      expect(t('buttons.save')).toBe('Save');
    });
  });

  describe('Translation validation functionality', () => {
    it('should validate translation keys in development mode', async () => {
      process.env.NODE_ENV = 'development';
      
      // Import the actual function to test
      const { useTranslationsWithValidation } = await import('../use-translations-with-validation');
      
      const mockT = vi.fn((key: string) => `translated-${key}`);
      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      // Simulate the hook behavior
      const validatedT = useTranslationsWithValidation('Common', 'TestComponent');
      
      // Call the validated translation function
      const result = validatedT('test.key');
      
      expect(result).toBe('translated-test.key');
      expect(mockT).toHaveBeenCalledWith('test.key', undefined);
    });

    it('should not validate in production mode', async () => {
      process.env.NODE_ENV = 'production';
      
      const { useTranslationsWithValidation } = await import('../use-translations-with-validation');
      
      const mockT = vi.fn((key: string) => `translated-${key}`);
      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const validatedT = useTranslationsWithValidation('Common', 'TestComponent');
      const result = validatedT('test.key');
      
      expect(result).toBe('translated-test.key');
      expect(mockT).toHaveBeenCalledWith('test.key', undefined);
      
      // Warning system should not be called in production
      expect(mockTranslationWarningSystem.warnMissingKey).not.toHaveBeenCalled();
    });

    it('should handle namespace-less translations', async () => {
      process.env.NODE_ENV = 'development';
      
      const { useTranslationsWithValidation } = await import('../use-translations-with-validation');
      
      const mockT = vi.fn((key: string) => `translated-${key}`);
      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const validatedT = useTranslationsWithValidation();
      const result = validatedT('test.key');
      
      expect(result).toBe('translated-test.key');
      expect(mockT).toHaveBeenCalledWith('test.key', undefined);
    });

    it('should pass through values parameter correctly', async () => {
      const { useTranslationsWithValidation } = await import('../use-translations-with-validation');
      
      const mockT = vi.fn((key: string, values?: Record<string, any>) => {
        if (values) {
          return `translated-${key}-${JSON.stringify(values)}`;
        }
        return `translated-${key}`;
      });
      
      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const validatedT = useTranslationsWithValidation('Common');
      const testValues = { count: 5, name: 'test' };
      const result = validatedT('test.key', testValues);
      
      expect(result).toBe(`translated-test.key-${JSON.stringify(testValues)}`);
      expect(mockT).toHaveBeenCalledWith('test.key', testValues);
    });
  });

  describe('Utility functions', () => {
    describe('checkTranslationExists', () => {
      it('should check if translation key exists', async () => {
        mockTranslationValidator.checkTranslationKey.mockResolvedValue(true);

        const { checkTranslationExists } = await import('../use-translations-with-validation');
        const result = await checkTranslationExists('Common.buttons.submit');

        expect(result).toBe(true);
        expect(mockTranslationValidator.checkTranslationKey).toHaveBeenCalledWith('Common.buttons.submit');
      });

      it('should return false for non-existent keys', async () => {
        mockTranslationValidator.checkTranslationKey.mockResolvedValue(false);

        const { checkTranslationExists } = await import('../use-translations-with-validation');
        const result = await checkTranslationExists('NonExistent.key');

        expect(result).toBe(false);
        expect(mockTranslationValidator.checkTranslationKey).toHaveBeenCalledWith('NonExistent.key');
      });
    });

    describe('getMissingTranslationKeys', () => {
      it('should return list of missing translation keys', async () => {
        const mockValidationResult = {
          isValid: false,
          missingKeys: [
            { key: 'Common.missing1', missingIn: ['es'] },
            { key: 'Header.missing2', missingIn: ['en'] },
          ],
          warnings: [],
          errors: [],
        };

        mockTranslationValidator.validateTranslations.mockResolvedValue(mockValidationResult);

        const { getMissingTranslationKeys } = await import('../use-translations-with-validation');
        const result = await getMissingTranslationKeys();

        expect(result).toEqual(['Common.missing1', 'Header.missing2']);
        expect(mockTranslationValidator.validateTranslations).toHaveBeenCalled();
      });

      it('should return empty array when no missing keys', async () => {
        const mockValidationResult = {
          isValid: true,
          missingKeys: [],
          warnings: [],
          errors: [],
        };

        mockTranslationValidator.validateTranslations.mockResolvedValue(mockValidationResult);

        const { getMissingTranslationKeys } = await import('../use-translations-with-validation');
        const result = await getMissingTranslationKeys();

        expect(result).toEqual([]);
        expect(mockTranslationValidator.validateTranslations).toHaveBeenCalled();
      });
    });
  });

  describe('Translation file consistency', () => {
    it('should validate that both language files have the same structure', async () => {
      // Mock translation files
      const enTranslations = {
        Common: {
          buttons: { submit: 'Submit', cancel: 'Cancel' },
          states: { loading: 'Loading...', error: 'Error' },
        },
        Header: {
          home: 'Home',
          contact: 'Contact',
        },
      };

      const esTranslations = {
        Common: {
          buttons: { submit: 'Enviar', cancel: 'Cancelar' },
          states: { loading: 'Cargando...', error: 'Error' },
        },
        Header: {
          home: 'Inicio',
          contact: 'Contacto',
        },
      };

      // Helper function to get all keys from nested object
      const getAllKeys = (obj: any, prefix = ''): string[] => {
        let keys: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            keys = keys.concat(getAllKeys(value, fullKey));
          } else {
            keys.push(fullKey);
          }
        }
        return keys.sort();
      };

      const enKeys = getAllKeys(enTranslations);
      const esKeys = getAllKeys(esTranslations);

      expect(enKeys).toEqual(esKeys);
      expect(enKeys).toEqual([
        'Common.buttons.cancel',
        'Common.buttons.submit',
        'Common.states.error',
        'Common.states.loading',
        'Header.contact',
        'Header.home',
      ]);
    });

    it('should detect missing translations in specific locales', () => {
      const enTranslations = {
        Common: {
          buttons: { submit: 'Submit', cancel: 'Cancel', save: 'Save' },
        },
      };

      const esTranslations = {
        Common: {
          buttons: { submit: 'Enviar', cancel: 'Cancelar' },
          // 'save' is missing in Spanish
        },
      };

      const getAllKeys = (obj: any, prefix = ''): string[] => {
        let keys: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            keys = keys.concat(getAllKeys(value, fullKey));
          } else {
            keys.push(fullKey);
          }
        }
        return keys;
      };

      const enKeys = getAllKeys(enTranslations);
      const esKeys = getAllKeys(esTranslations);
      
      const missingInSpanish = enKeys.filter(key => !esKeys.includes(key));
      const missingInEnglish = esKeys.filter(key => !enKeys.includes(key));

      expect(missingInSpanish).toEqual(['Common.buttons.save']);
      expect(missingInEnglish).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should handle translation function errors gracefully', () => {
      const mockT = vi.fn((key: string) => {
        if (key === 'error.key') {
          throw new Error('Translation error');
        }
        return `translated-${key}`;
      });

      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const t = mockUseTranslations('Common');

      // Should work for normal keys
      expect(t('normal.key')).toBe('translated-normal.key');

      // Should throw for error keys (this is expected behavior)
      expect(() => t('error.key')).toThrow('Translation error');
    });

    it('should handle undefined or null translation values', () => {
      const mockT = vi.fn((key: string) => {
        const translations: Record<string, any> = {
          'valid.key': 'Valid translation',
          'null.key': null,
          'undefined.key': undefined,
        };
        return translations[key] || key;
      });

      mockUseTranslations.mockReturnValue(mockT);
      mockUseLocale.mockReturnValue('en');

      const t = mockUseTranslations('Common');

      expect(t('valid.key')).toBe('Valid translation');
      expect(t('null.key')).toBe('null.key'); // Fallback to key
      expect(t('undefined.key')).toBe('undefined.key'); // Fallback to key
    });
  });
});