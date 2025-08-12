/**
 * Translation Validation Utility
 * 
 * This utility provides functions to validate translation files and check for
 * missing keys, inconsistencies between locales, and development warnings.
 */

import fs from 'fs';
import path from 'path';

export interface TranslationValidationResult {
  isValid: boolean;
  errors: TranslationError[];
  warnings: TranslationWarning[];
  missingKeys: MissingKeyReport[];
  inconsistencies: InconsistencyReport[];
}

export interface TranslationError {
  type: 'missing_file' | 'invalid_json' | 'missing_namespace';
  message: string;
  file?: string;
  key?: string;
}

export interface TranslationWarning {
  type: 'missing_key' | 'extra_key' | 'empty_value';
  message: string;
  file: string;
  key: string;
}

export interface MissingKeyReport {
  key: string;
  missingIn: string[];
  presentIn: string[];
}

export interface InconsistencyReport {
  type: 'structure_mismatch' | 'type_mismatch';
  key: string;
  details: string;
}

/**
 * Validates translation files for consistency and completeness
 */
export class TranslationValidator {
  private translationsPath: string;
  private supportedLocales: string[];

  constructor(translationsPath: string = 'messages', supportedLocales: string[] = ['en', 'es']) {
    this.translationsPath = translationsPath;
    this.supportedLocales = supportedLocales;
  }

  /**
   * Validates all translation files and returns a comprehensive report
   */
  async validateTranslations(): Promise<TranslationValidationResult> {
    const result: TranslationValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingKeys: [],
      inconsistencies: []
    };

    try {
      // Load all translation files
      const translations = await this.loadTranslationFiles();
      
      // Check for missing files
      this.checkMissingFiles(translations, result);
      
      // Validate JSON structure
      this.validateJsonStructure(translations, result);
      
      // Check for missing keys between locales
      this.checkMissingKeys(translations, result);
      
      // Check for structural inconsistencies
      this.checkStructuralConsistency(translations, result);
      
      // Check for empty values
      this.checkEmptyValues(translations, result);

      result.isValid = result.errors.length === 0;
      
    } catch (error) {
      result.errors.push({
        type: 'missing_file',
        message: `Failed to validate translations: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * Loads all translation files
   */
  private async loadTranslationFiles(): Promise<Record<string, any>> {
    const translations: Record<string, any> = {};

    for (const locale of this.supportedLocales) {
      const filePath = path.join(this.translationsPath, `${locale}.json`);
      
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          translations[locale] = JSON.parse(content);
        }
      } catch (error) {
        // Will be handled in validation
        translations[locale] = null;
      }
    }

    return translations;
  }

  /**
   * Checks for missing translation files
   */
  private checkMissingFiles(translations: Record<string, any>, result: TranslationValidationResult): void {
    for (const locale of this.supportedLocales) {
      if (!translations[locale]) {
        result.errors.push({
          type: 'missing_file',
          message: `Translation file for locale '${locale}' is missing or invalid`,
          file: `${locale}.json`
        });
      }
    }
  }

  /**
   * Validates JSON structure of translation files
   */
  private validateJsonStructure(translations: Record<string, any>, result: TranslationValidationResult): void {
    for (const [locale, content] of Object.entries(translations)) {
      if (content === null) {
        result.errors.push({
          type: 'invalid_json',
          message: `Invalid JSON structure in ${locale}.json`,
          file: `${locale}.json`
        });
      }
    }
  }

  /**
   * Checks for missing keys between locales
   */
  private checkMissingKeys(translations: Record<string, any>, result: TranslationValidationResult): void {
    const validTranslations = Object.entries(translations).filter(([_, content]) => content !== null);
    
    if (validTranslations.length < 2) return;

    // Get all possible keys from all locales
    const allKeys = new Set<string>();
    const keysByLocale: Record<string, Set<string>> = {};

    for (const [locale, content] of validTranslations) {
      const keys = this.extractKeys(content);
      keysByLocale[locale] = new Set(keys);
      keys.forEach(key => allKeys.add(key));
    }

    // Check for missing keys
    for (const key of allKeys) {
      const missingIn: string[] = [];
      const presentIn: string[] = [];

      for (const [locale, keys] of Object.entries(keysByLocale)) {
        if (keys.has(key)) {
          presentIn.push(locale);
        } else {
          missingIn.push(locale);
        }
      }

      if (missingIn.length > 0) {
        result.missingKeys.push({
          key,
          missingIn,
          presentIn
        });

        result.warnings.push({
          type: 'missing_key',
          message: `Key '${key}' is missing in locales: ${missingIn.join(', ')}`,
          file: missingIn.map(locale => `${locale}.json`).join(', '),
          key
        });
      }
    }
  }

  /**
   * Checks for structural inconsistencies between locales
   */
  private checkStructuralConsistency(translations: Record<string, any>, result: TranslationValidationResult): void {
    const validTranslations = Object.entries(translations).filter(([_, content]) => content !== null);
    
    if (validTranslations.length < 2) return;

    const [baseLocale, baseContent] = validTranslations[0];
    
    for (let i = 1; i < validTranslations.length; i++) {
      const [compareLocale, compareContent] = validTranslations[i];
      
      this.compareStructure(baseContent, compareContent, '', baseLocale, compareLocale, result);
    }
  }

  /**
   * Recursively compares structure between two translation objects
   */
  private compareStructure(
    base: any, 
    compare: any, 
    keyPath: string, 
    baseLocale: string, 
    compareLocale: string, 
    result: TranslationValidationResult
  ): void {
    const baseType = typeof base;
    const compareType = typeof compare;

    if (baseType !== compareType) {
      result.inconsistencies.push({
        type: 'type_mismatch',
        key: keyPath,
        details: `Type mismatch at '${keyPath}': ${baseLocale} has ${baseType}, ${compareLocale} has ${compareType}`
      });
      return;
    }

    if (baseType === 'object' && base !== null && compare !== null) {
      const baseKeys = Object.keys(base);
      const compareKeys = Object.keys(compare);

      // Check for structural differences
      const allKeys = new Set([...baseKeys, ...compareKeys]);
      
      for (const key of allKeys) {
        const newKeyPath = keyPath ? `${keyPath}.${key}` : key;
        
        if (!(key in base)) {
          result.inconsistencies.push({
            type: 'structure_mismatch',
            key: newKeyPath,
            details: `Key '${newKeyPath}' exists in ${compareLocale} but not in ${baseLocale}`
          });
        } else if (!(key in compare)) {
          result.inconsistencies.push({
            type: 'structure_mismatch',
            key: newKeyPath,
            details: `Key '${newKeyPath}' exists in ${baseLocale} but not in ${compareLocale}`
          });
        } else {
          // Recursively check nested objects
          this.compareStructure(base[key], compare[key], newKeyPath, baseLocale, compareLocale, result);
        }
      }
    }
  }

  /**
   * Checks for empty values in translation files
   */
  private checkEmptyValues(translations: Record<string, any>, result: TranslationValidationResult): void {
    for (const [locale, content] of Object.entries(translations)) {
      if (content === null) continue;

      const emptyKeys = this.findEmptyValues(content);
      
      for (const key of emptyKeys) {
        result.warnings.push({
          type: 'empty_value',
          message: `Empty value found for key '${key}' in ${locale}.json`,
          file: `${locale}.json`,
          key
        });
      }
    }
  }

  /**
   * Extracts all keys from a nested translation object
   */
  private extractKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        keys.push(...this.extractKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  /**
   * Finds keys with empty values
   */
  private findEmptyValues(obj: any, prefix: string = ''): string[] {
    const emptyKeys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        emptyKeys.push(...this.findEmptyValues(value, fullKey));
      } else if (typeof value === 'string' && value.trim() === '') {
        emptyKeys.push(fullKey);
      }
    }

    return emptyKeys;
  }

  /**
   * Checks if a specific translation key exists in all locales
   */
  checkTranslationKey(key: string): Promise<boolean> {
    return this.loadTranslationFiles().then(translations => {
      for (const locale of this.supportedLocales) {
        const content = translations[locale];
        if (!content || !this.hasNestedKey(content, key)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Checks if a nested key exists in an object
   */
  private hasNestedKey(obj: any, key: string): boolean {
    const keys = key.split('.');
    let current = obj;

    for (const k of keys) {
      if (typeof current !== 'object' || current === null || !(k in current)) {
        return false;
      }
      current = current[k];
    }

    return true;
  }

  /**
   * Gets a translation value for a specific key and locale
   */
  async getTranslationValue(key: string, locale: string): Promise<string | null> {
    const translations = await this.loadTranslationFiles();
    const content = translations[locale];
    
    if (!content) return null;

    const keys = key.split('.');
    let current = content;

    for (const k of keys) {
      if (typeof current !== 'object' || current === null || !(k in current)) {
        return null;
      }
      current = current[k];
    }

    return typeof current === 'string' ? current : null;
  }
}

/**
 * Development mode warning system for missing translations
 */
export class TranslationWarningSystem {
  private static instance: TranslationWarningSystem;
  private validator: TranslationValidator;
  private warnedKeys: Set<string> = new Set();

  private constructor() {
    this.validator = new TranslationValidator();
  }

  private get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static getInstance(): TranslationWarningSystem {
    if (!TranslationWarningSystem.instance) {
      TranslationWarningSystem.instance = new TranslationWarningSystem();
    }
    return TranslationWarningSystem.instance;
  }

  /**
   * Warns about missing translation key (only in development)
   */
  async warnMissingKey(key: string, locale: string, component?: string): Promise<void> {
    if (!this.isDevelopment) return;

    const warningKey = `${key}-${locale}`;
    if (this.warnedKeys.has(warningKey)) return;

    const exists = await this.validator.checkTranslationKey(key);
    
    if (!exists) {
      this.warnedKeys.add(warningKey);
      
      const componentInfo = component ? ` in component ${component}` : '';
      console.warn(
        `🌐 Translation Warning: Missing key '${key}' for locale '${locale}'${componentInfo}`
      );
      
      // Also check if key exists in other locales
      const value = await this.validator.getTranslationValue(key, locale === 'en' ? 'es' : 'en');
      if (value) {
        console.warn(`   Key exists in other locale with value: "${value}"`);
      }
    }
  }

  /**
   * Validates all translations and logs warnings
   */
  async validateAndWarn(): Promise<void> {
    if (!this.isDevelopment) return;

    const result = await this.validator.validateTranslations();
    
    if (!result.isValid) {
      console.warn('🌐 Translation Validation Errors:');
      result.errors.forEach(error => {
        console.warn(`   ❌ ${error.message}`);
      });
    }

    if (result.warnings.length > 0) {
      console.warn('🌐 Translation Warnings:');
      result.warnings.forEach(warning => {
        console.warn(`   ⚠️  ${warning.message}`);
      });
    }

    if (result.missingKeys.length > 0) {
      console.warn('🌐 Missing Translation Keys:');
      result.missingKeys.forEach(missing => {
        console.warn(`   🔍 '${missing.key}' missing in: ${missing.missingIn.join(', ')}`);
      });
    }
  }

  /**
   * Clears the warned keys cache (useful for testing)
   */
  clearWarnings(): void {
    this.warnedKeys.clear();
  }
}

// Export singleton instance for easy access
export const translationWarningSystem = TranslationWarningSystem.getInstance();

// Export validator instance for direct use
export const translationValidator = new TranslationValidator();