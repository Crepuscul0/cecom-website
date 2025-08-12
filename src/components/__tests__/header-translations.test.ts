import { describe, it, expect } from 'vitest';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';

describe('Header Accessibility Translations', () => {
  describe('English translations', () => {
    it('should have all required accessibility translations', () => {
      const headerAccessibility = enMessages.Header.accessibility;
      
      expect(headerAccessibility).toBeDefined();
      expect(headerAccessibility.mainNavigation).toBe('Main navigation');
      expect(headerAccessibility.homeLink).toBe('Go to home page');
      expect(headerAccessibility.solutionsLink).toBe('Go to solutions page');
      expect(headerAccessibility.alliancesLink).toBe('Go to alliances page');
      expect(headerAccessibility.aboutUsLink).toBe('Go to about us page');
      expect(headerAccessibility.contactLink).toBe('Go to contact page');
      expect(headerAccessibility.logoLink).toBe('Go to home page');
      expect(headerAccessibility.logoAlt).toBe('CECOM Logo - Go to home page');
      expect(headerAccessibility.languageSelectorButton).toBe('Select language');
      expect(headerAccessibility.languageSelectorMenu).toBe('Language options');
      expect(headerAccessibility.selectEnglish).toBe('Switch to English');
      expect(headerAccessibility.selectSpanish).toBe('Switch to Spanish');
      expect(headerAccessibility.mobileMenuButton).toBe('Open mobile navigation menu');
      expect(headerAccessibility.mobileNavigation).toBe('Mobile navigation menu');
      expect(headerAccessibility.skipToContent).toBe('Skip to main content');
    });

    it('should have all required tooltip translations', () => {
      const headerTooltips = enMessages.Header.tooltips;
      
      expect(headerTooltips).toBeDefined();
      expect(headerTooltips.home).toBe('Navigate to home page');
      expect(headerTooltips.solutions).toBe('View our technology solutions');
      expect(headerTooltips.alliances).toBe('See our business partnerships');
      expect(headerTooltips.aboutUs).toBe('Learn more about our company');
      expect(headerTooltips.contact).toBe('Get in touch with us');
      expect(headerTooltips.languageSelector).toBe('Change website language');
      expect(headerTooltips.mobileMenu).toBe('Open navigation menu');
    });
  });

  describe('Spanish translations', () => {
    it('should have all required accessibility translations', () => {
      const headerAccessibility = esMessages.Header.accessibility;
      
      expect(headerAccessibility).toBeDefined();
      expect(headerAccessibility.mainNavigation).toBe('Navegación principal');
      expect(headerAccessibility.homeLink).toBe('Ir a la página de inicio');
      expect(headerAccessibility.solutionsLink).toBe('Ir a la página de soluciones');
      expect(headerAccessibility.alliancesLink).toBe('Ir a la página de alianzas');
      expect(headerAccessibility.aboutUsLink).toBe('Ir a la página acerca de nosotros');
      expect(headerAccessibility.contactLink).toBe('Ir a la página de contacto');
      expect(headerAccessibility.logoLink).toBe('Ir a la página de inicio');
      expect(headerAccessibility.logoAlt).toBe('Logo de CECOM - Ir a la página de inicio');
      expect(headerAccessibility.languageSelectorButton).toBe('Seleccionar idioma');
      expect(headerAccessibility.languageSelectorMenu).toBe('Opciones de idioma');
      expect(headerAccessibility.selectEnglish).toBe('Cambiar a inglés');
      expect(headerAccessibility.selectSpanish).toBe('Cambiar a español');
      expect(headerAccessibility.mobileMenuButton).toBe('Abrir menú de navegación móvil');
      expect(headerAccessibility.mobileNavigation).toBe('Menú de navegación móvil');
      expect(headerAccessibility.skipToContent).toBe('Saltar al contenido principal');
    });

    it('should have all required tooltip translations', () => {
      const headerTooltips = esMessages.Header.tooltips;
      
      expect(headerTooltips).toBeDefined();
      expect(headerTooltips.home).toBe('Navegar a la página de inicio');
      expect(headerTooltips.solutions).toBe('Ver nuestras soluciones tecnológicas');
      expect(headerTooltips.alliances).toBe('Ver nuestras alianzas comerciales');
      expect(headerTooltips.aboutUs).toBe('Conocer más sobre nuestra empresa');
      expect(headerTooltips.contact).toBe('Ponerse en contacto con nosotros');
      expect(headerTooltips.languageSelector).toBe('Cambiar idioma del sitio web');
      expect(headerTooltips.mobileMenu).toBe('Abrir menú de navegación');
    });
  });

  describe('Translation consistency', () => {
    it('should have the same accessibility keys in both languages', () => {
      const enKeys = Object.keys(enMessages.Header.accessibility);
      const esKeys = Object.keys(esMessages.Header.accessibility);
      
      expect(enKeys.sort()).toEqual(esKeys.sort());
    });

    it('should have the same tooltip keys in both languages', () => {
      const enKeys = Object.keys(enMessages.Header.tooltips);
      const esKeys = Object.keys(esMessages.Header.tooltips);
      
      expect(enKeys.sort()).toEqual(esKeys.sort());
    });

    it('should have no empty translation values', () => {
      const checkEmptyValues = (obj: any, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkEmptyValues(value, currentPath);
          }
        }
      };

      checkEmptyValues(enMessages.Header.accessibility, 'Header.accessibility');
      checkEmptyValues(enMessages.Header.tooltips, 'Header.tooltips');
      checkEmptyValues(esMessages.Header.accessibility, 'Header.accessibility');
      checkEmptyValues(esMessages.Header.tooltips, 'Header.tooltips');
    });
  });
});