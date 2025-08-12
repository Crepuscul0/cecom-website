/**
 * Integration tests for translation system
 * 
 * Tests the actual translation files and validates the real translation structure,
 * consistency between locales, and integration with the translation system.
 */

import { describe, it, expect } from 'vitest';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';

describe('Translation Integration Tests', () => {
  describe('Translation file structure', () => {
    it('should have the same top-level namespaces in both languages', () => {
      const enNamespaces = Object.keys(enMessages).sort();
      const esNamespaces = Object.keys(esMessages).sort();
      
      expect(enNamespaces).toEqual(esNamespaces);
      expect(enNamespaces).toEqual([
        'AboutUs',
        'Alliances', 
        'Catalog',
        'Common',
        'Contact',
        'Header',
        'Home',
        'NotFound',
        'Solutions',
        'Validation'
      ]);
    });

    it('should have consistent Common namespace structure', () => {
      const enCommonKeys = Object.keys(enMessages.Common).sort();
      const esCommonKeys = Object.keys(esMessages.Common).sort();
      
      expect(enCommonKeys).toEqual(esCommonKeys);
      expect(enCommonKeys).toEqual([
        'accessibility',
        'buttons',
        'language',
        'states',
        'theme'
      ]);
    });

    it('should have consistent Validation namespace structure', () => {
      const enValidationKeys = Object.keys(enMessages.Validation).sort();
      const esValidationKeys = Object.keys(esMessages.Validation).sort();
      
      expect(enValidationKeys).toEqual(esValidationKeys);
      expect(enValidationKeys.length).toBeGreaterThan(5); // Should have multiple validation messages
    });

    it('should have consistent Header namespace structure', () => {
      const enHeaderKeys = Object.keys(enMessages.Header).sort();
      const esHeaderKeys = Object.keys(esMessages.Header).sort();
      
      expect(enHeaderKeys).toEqual(esHeaderKeys);
      expect(enHeaderKeys).toEqual([
        'aboutUs',
        'accessibility',
        'alliances',
        'contact',
        'home',
        'solutions',
        'tooltips'
      ]);
    });

    it('should have consistent Catalog namespace structure', () => {
      const enCatalogKeys = Object.keys(enMessages.Catalog).sort();
      const esCatalogKeys = Object.keys(esMessages.Catalog).sort();
      
      expect(enCatalogKeys).toEqual(esCatalogKeys);
      expect(enCatalogKeys).toEqual([
        'actions',
        'allProducts',
        'categories',
        'datasheet',
        'features',
        'filter',
        'filterByVendor',
        'modal',
        'searchProducts',
        'showingResults',
        'specifications',
        'states'
      ]);
    });
  });

  describe('Translation completeness', () => {
    // Helper function to get all nested keys from an object
    const getAllKeys = (obj: any, prefix = ''): string[] => {
      let keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          keys = keys.concat(getAllKeys(value, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    };

    it('should have the same keys in both language files', () => {
      const enKeys = getAllKeys(enMessages);
      const esKeys = getAllKeys(esMessages);
      
      expect(enKeys).toEqual(esKeys);
    });

    it('should not have any empty translation values', () => {
      const checkEmptyValues = (obj: any, path = '', locale = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.trim(), `Empty translation at ${currentPath} in ${locale}`).not.toBe('');
            expect(value, `Null/undefined translation at ${currentPath} in ${locale}`).toBeTruthy();
          } else if (typeof value === 'object' && value !== null) {
            checkEmptyValues(value, currentPath, locale);
          }
        }
      };

      checkEmptyValues(enMessages, '', 'English');
      checkEmptyValues(esMessages, '', 'Spanish');
    });

    it('should have proper interpolation placeholders', () => {
      // Check that interpolation keys are consistent between languages
      const findInterpolationKeys = (obj: any, path = ''): Array<{path: string, placeholders: string[]}> => {
        let results: Array<{path: string, placeholders: string[]}> = [];
        
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            const placeholders = value.match(/\{[^}]+\}/g) || [];
            if (placeholders.length > 0) {
              results.push({
                path: currentPath,
                placeholders: placeholders.sort()
              });
            }
          } else if (typeof value === 'object' && value !== null) {
            results = results.concat(findInterpolationKeys(value, currentPath));
          }
        }
        return results;
      };

      const enInterpolations = findInterpolationKeys(enMessages);
      const esInterpolations = findInterpolationKeys(esMessages);

      // Should have the same number of interpolated strings
      expect(enInterpolations.length).toBe(esInterpolations.length);

      // Each interpolated string should have the same placeholders in both languages
      enInterpolations.forEach(enItem => {
        const esItem = esInterpolations.find(es => es.path === enItem.path);
        expect(esItem, `Missing interpolation for ${enItem.path} in Spanish`).toBeDefined();
        expect(esItem!.placeholders).toEqual(enItem.placeholders);
      });
    });
  });

  describe('Translation content validation', () => {
    it('should have proper button translations', () => {
      const expectedButtons = ['submit', 'cancel', 'save', 'delete', 'edit', 'close', 'retry'];
      
      expectedButtons.forEach(button => {
        expect(enMessages.Common.buttons[button as keyof typeof enMessages.Common.buttons]).toBeTruthy();
        expect(esMessages.Common.buttons[button as keyof typeof esMessages.Common.buttons]).toBeTruthy();
      });

      // Verify specific translations
      expect(enMessages.Common.buttons.submit).toBe('Submit');
      expect(esMessages.Common.buttons.submit).toBe('Enviar');
      expect(enMessages.Common.buttons.cancel).toBe('Cancel');
      expect(esMessages.Common.buttons.cancel).toBe('Cancelar');
    });

    it('should have proper state translations', () => {
      const expectedStates = ['loading', 'error', 'success', 'noData'];
      
      expectedStates.forEach(state => {
        expect(enMessages.Common.states[state as keyof typeof enMessages.Common.states]).toBeTruthy();
        expect(esMessages.Common.states[state as keyof typeof esMessages.Common.states]).toBeTruthy();
      });

      // Verify specific translations
      expect(enMessages.Common.states.loading).toBe('Loading...');
      expect(esMessages.Common.states.loading).toBe('Cargando...');
      expect(enMessages.Common.states.error).toBe('Error');
      expect(esMessages.Common.states.error).toBe('Error');
    });

    it('should have proper validation translations', () => {
      const expectedValidations = ['required', 'email', 'phone', 'minLength', 'maxLength'];
      
      expectedValidations.forEach(validation => {
        expect(enMessages.Validation[validation as keyof typeof enMessages.Validation]).toBeTruthy();
        expect(esMessages.Validation[validation as keyof typeof esMessages.Validation]).toBeTruthy();
      });

      // Verify specific translations
      expect(enMessages.Validation.required).toBe('This field is required');
      expect(esMessages.Validation.required).toBe('Este campo es requerido');
      expect(enMessages.Validation.email).toBe('Please enter a valid email address');
      expect(esMessages.Validation.email).toBe('Por favor ingrese un correo electrónico válido');
    });

    it('should have proper header navigation translations', () => {
      const expectedNavItems = ['home', 'solutions', 'alliances', 'aboutUs', 'contact'];
      
      expectedNavItems.forEach(navItem => {
        expect(enMessages.Header[navItem as keyof typeof enMessages.Header]).toBeTruthy();
        expect(esMessages.Header[navItem as keyof typeof esMessages.Header]).toBeTruthy();
      });

      // Verify specific translations
      expect(enMessages.Header.home).toBe('Home');
      expect(esMessages.Header.home).toBe('Inicio');
      expect(enMessages.Header.contact).toBe('Contact');
      expect(esMessages.Header.contact).toBe('Contacto');
    });

    it('should have proper accessibility translations', () => {
      const enAccessibility = enMessages.Header.accessibility;
      const esAccessibility = esMessages.Header.accessibility;
      
      expect(enAccessibility.mainNavigation).toBe('Main navigation');
      expect(esAccessibility.mainNavigation).toBe('Navegación principal');
      expect(enAccessibility.logoAlt).toBe('CECOM Logo - Go to home page');
      expect(esAccessibility.logoAlt).toBe('Logo de CECOM - Ir a la página de inicio');
    });
  });

  describe('Translation consistency checks', () => {
    it('should have consistent punctuation patterns', () => {
      // Check that loading states consistently end with "..."
      expect(enMessages.Common.states.loading).toMatch(/\.{3}$/);
      expect(esMessages.Common.states.loading).toMatch(/\.{3}$/);
      
      // Check that catalog loading states are consistent
      expect(enMessages.Common.states.loadingCategories).toMatch(/\.{3}$/);
      expect(esMessages.Common.states.loadingCategories).toMatch(/\.{3}$/);
    });

    it('should have consistent capitalization patterns', () => {
      // Button labels should be properly capitalized
      expect(enMessages.Common.buttons.submit).toMatch(/^[A-Z]/);
      expect(esMessages.Common.buttons.submit).toMatch(/^[A-Z]/);
      
      // Navigation items should be properly capitalized
      expect(enMessages.Header.home).toMatch(/^[A-Z]/);
      expect(esMessages.Header.home).toMatch(/^[A-Z]/);
    });

    it('should have consistent error message patterns', () => {
      // Validation messages should be consistent
      expect(enMessages.Validation.email).toMatch(/^Please enter/);
      expect(esMessages.Validation.email).toMatch(/^Por favor ingrese/);
      
      expect(enMessages.Validation.phone).toMatch(/^Please enter/);
      expect(esMessages.Validation.phone).toMatch(/^Por favor ingrese/);
    });
  });

  describe('Namespace organization', () => {
    it('should have logically organized Common namespace', () => {
      const common = enMessages.Common;
      
      // Should have buttons, states, accessibility, theme, language
      expect(common.buttons).toBeDefined();
      expect(common.states).toBeDefined();
      expect(common.accessibility).toBeDefined();
      expect(common.theme).toBeDefined();
      expect(common.language).toBeDefined();
      
      // Buttons should contain common UI actions
      expect(Object.keys(common.buttons)).toContain('submit');
      expect(Object.keys(common.buttons)).toContain('cancel');
      expect(Object.keys(common.buttons)).toContain('close');
      
      // States should contain common UI states
      expect(Object.keys(common.states)).toContain('loading');
      expect(Object.keys(common.states)).toContain('error');
      expect(Object.keys(common.states)).toContain('success');
    });

    it('should have properly organized Catalog namespace', () => {
      const catalog = enMessages.Catalog;
      
      // Should have modal, filter, states, actions
      expect(catalog.modal).toBeDefined();
      expect(catalog.filter).toBeDefined();
      expect(catalog.states).toBeDefined();
      expect(catalog.actions).toBeDefined();
      
      // Modal should have navigation and content keys
      expect(catalog.modal.closeModal).toBeDefined();
      expect(catalog.modal.previousProduct).toBeDefined();
      expect(catalog.modal.nextProduct).toBeDefined();
      
      // Filter should have vendor-related keys
      expect(catalog.filter.allVendors).toBeDefined();
      expect(catalog.filter.filterByVendor).toBeDefined();
    });

    it('should have properly organized Contact namespace', () => {
      const contact = enMessages.Contact;
      
      // Should have form and validation sections
      expect(contact.form).toBeDefined();
      expect(contact.validation).toBeDefined();
      
      // Form should have field labels and messages
      expect(contact.form.fullName).toBeDefined();
      expect(contact.form.message).toBeDefined();
      expect(contact.form.submit).toBeDefined();
      expect(contact.form.successMessage).toBeDefined();
      expect(contact.form.errorMessage).toBeDefined();
    });
  });

  describe('Special character handling', () => {
    it('should handle special characters correctly', () => {
      // Check that Spanish characters are preserved
      expect(esMessages.Contact.getInTouch).toBe('Ponte en contacto');
      expect(esMessages.Solutions.businessNeeds).toContain('negocio');
      
      // Check that quotes and apostrophes are handled consistently
      const findQuotes = (obj: any): string[] => {
        let results: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            if (value.includes('"') || value.includes("'")) {
              results.push(value);
            }
          } else if (typeof value === 'object' && value !== null) {
            results = results.concat(findQuotes(value));
          }
        }
        return results;
      };

      const enQuotes = findQuotes(enMessages);
      const esQuotes = findQuotes(esMessages);
      
      // Should have some strings with quotes (like search filters)
      expect(enQuotes.length).toBeGreaterThan(0);
      expect(esQuotes.length).toBeGreaterThan(0);
    });

    it('should handle HTML entities correctly', () => {
      // Check that no unescaped HTML entities exist
      const findHtmlEntities = (obj: any): string[] => {
        let results: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            if (value.includes('&') && !value.includes('&amp;')) {
              // Allow legitimate & usage but flag potential HTML entities
              const htmlEntityPattern = /&[a-zA-Z]+;/;
              if (htmlEntityPattern.test(value)) {
                results.push(value);
              }
            }
          } else if (typeof value === 'object' && value !== null) {
            results = results.concat(findHtmlEntities(value));
          }
        }
        return results;
      };

      const enEntities = findHtmlEntities(enMessages);
      const esEntities = findHtmlEntities(esMessages);
      
      // Should not have unescaped HTML entities
      expect(enEntities).toEqual([]);
      expect(esEntities).toEqual([]);
    });
  });
});