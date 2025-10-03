#!/usr/bin/env node

/**
 * Translation Validation CLI Script
 * 
 * This script validates translation files and reports any issues.
 * Can be run as part of the build process or during development.
 * 
 * Usage:
 *   node scripts/validate-translations.js
 *   npm run validate-translations
 */

const fs = require('fs');
const path = require('path');

// Translation validation logic (Node.js compatible version)
class TranslationValidatorCLI {
  constructor(translationsPath = 'messages', supportedLocales = ['en', 'es']) {
    this.translationsPath = translationsPath;
    this.supportedLocales = supportedLocales;
  }

  async validateTranslations() {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      missingKeys: [],
      inconsistencies: []
    };

    try {
      console.log('🌐 Validating translation files...\n');
      
      // Load all translation files
      const translations = this.loadTranslationFiles();
      
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
        type: 'validation_error',
        message: `Failed to validate translations: ${error.message}`
      });
      result.isValid = false;
    }

    return result;
  }

  loadTranslationFiles() {
    const translations = {};

    for (const locale of this.supportedLocales) {
      const filePath = path.join(this.translationsPath, `${locale}.json`);
      
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          translations[locale] = JSON.parse(content);
        } else {
          translations[locale] = null;
        }
      } catch (error) {
        translations[locale] = null;
      }
    }

    return translations;
  }

  checkMissingFiles(translations, result) {
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

  validateJsonStructure(translations, result) {
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

  checkMissingKeys(translations, result) {
    const validTranslations = Object.entries(translations).filter(([_, content]) => content !== null);
    
    if (validTranslations.length < 2) return;

    // Get all possible keys from all locales
    const allKeys = new Set();
    const keysByLocale = {};

    for (const [locale, content] of validTranslations) {
      const keys = this.extractKeys(content);
      keysByLocale[locale] = new Set(keys);
      keys.forEach(key => allKeys.add(key));
    }

    // Check for missing keys
    for (const key of allKeys) {
      const missingIn = [];
      const presentIn = [];

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

  checkStructuralConsistency(translations, result) {
    const validTranslations = Object.entries(translations).filter(([_, content]) => content !== null);
    
    if (validTranslations.length < 2) return;

    const [baseLocale, baseContent] = validTranslations[0];
    
    for (let i = 1; i < validTranslations.length; i++) {
      const [compareLocale, compareContent] = validTranslations[i];
      
      this.compareStructure(baseContent, compareContent, '', baseLocale, compareLocale, result);
    }
  }

  compareStructure(base, compare, keyPath, baseLocale, compareLocale, result) {
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

  checkEmptyValues(translations, result) {
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

  extractKeys(obj, prefix = '') {
    const keys = [];

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

  findEmptyValues(obj, prefix = '') {
    const emptyKeys = [];

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
}

// CLI execution
async function main() {
  const validator = new TranslationValidatorCLI();
  const result = await validator.validateTranslations();

  // Print results
  if (result.isValid) {
    console.log('✅ All translations are valid and consistent!\n');
  } else {
    console.log('❌ Translation validation failed!\n');
  }

  // Print errors
  if (result.errors.length > 0) {
    console.log('🚨 ERRORS:');
    result.errors.forEach(error => {
      console.log(`   • ${error.message}`);
    });
    console.log('');
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    result.warnings.forEach(warning => {
      console.log(`   • ${warning.message}`);
    });
    console.log('');
  }

  // Print missing keys summary
  if (result.missingKeys.length > 0) {
    console.log('🔍 MISSING KEYS SUMMARY:');
    result.missingKeys.forEach(missing => {
      console.log(`   • '${missing.key}' missing in: ${missing.missingIn.join(', ')}`);
    });
    console.log('');
  }

  // Print inconsistencies
  if (result.inconsistencies.length > 0) {
    console.log('🔄 STRUCTURAL INCONSISTENCIES:');
    result.inconsistencies.forEach(inconsistency => {
      console.log(`   • ${inconsistency.details}`);
    });
    console.log('');
  }

  // Print summary
  console.log('📊 SUMMARY:');
  console.log(`   Total errors: ${result.errors.length}`);
  console.log(`   Total warnings: ${result.warnings.length}`);
  console.log(`   Missing keys: ${result.missingKeys.length}`);
  console.log(`   Inconsistencies: ${result.inconsistencies.length}`);

  // Exit with error code if validation failed
  if (!result.isValid) {
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { TranslationValidatorCLI };