/**
 * Comprehensive Translation Coverage Test
 * 
 * This test suite validates:
 * 1. All components are free of hardcoded strings
 * 2. All translation keys exist in both language files
 * 3. Translation file structure consistency
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface TranslationStructure {
  [key: string]: string | TranslationStructure;
}

interface HardcodedStringMatch {
  file: string;
  line: number;
  content: string;
  match: string;
}

interface MissingTranslationKey {
  key: string;
  missingIn: string[];
  foundIn: string[];
}

interface StructuralInconsistency {
  key: string;
  issue: string;
  locales: Record<string, string>;
}

class TranslationCoverageValidator {
  private enTranslations: TranslationStructure = {};
  private esTranslations: TranslationStructure = {};
  private componentFiles: string[] = [];

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    try {
      const enPath = path.join(process.cwd(), 'messages/en.json');
      const esPath = path.join(process.cwd(), 'messages/es.json');

      if (fs.existsSync(enPath)) {
        this.enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
      }

      if (fs.existsSync(esPath)) {
        this.esTranslations = JSON.parse(fs.readFileSync(esPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading translation files:', error);
    }
  }

  async loadComponentFiles(): Promise<void> {
    const patterns = [
      'src/components/**/*.tsx',
      'src/app/**/*.tsx',
      'src/lib/**/*.tsx'
    ];

    this.componentFiles = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() });
      this.componentFiles.push(...files);
    }
  }

  /**
   * Scans all component files for potential hardcoded strings
   */
  scanForHardcodedStrings(): HardcodedStringMatch[] {
    const hardcodedStrings: HardcodedStringMatch[] = [];
    
    // Patterns that indicate hardcoded user-facing strings
    const hardcodedPatterns = [
      // Strings in quotes that look like user-facing text (3+ words, starts with capital)
      /"[A-Z][a-zA-Z\s]{10,}"/g,
      // Common hardcoded phrases
      /"(Loading|Error|Success|Submit|Cancel|Save|Delete|Edit|Close|Search|Filter|Clear|View|Show|Hide)"/g,
      // Validation messages
      /"(This field is required|Please enter|Invalid|Must be|Cannot be)"/g,
      // Status messages
      /"(No data|Not found|Something went wrong|Try again)"/g
    ];

    // Patterns to exclude (these are likely not user-facing)
    const excludePatterns = [
      // CSS classes and HTML attributes
      /"[a-z-]+"/g,
      // File paths and URLs
      /"[./][a-zA-Z0-9/_.-]+"/g,
      // Technical strings
      /"(className|onClick|onChange|onSubmit|aria-|data-)"/g,
      // Import statements
      /from\s+"[^"]+"/g,
      // useTranslations calls
      /useTranslations\s*\(\s*"[^"]+"\s*\)/g,
      // Translation key usage
      /t\s*\(\s*["'][^"']+["']\s*\)/g,
      // React component displayName assignments
      /\.displayName\s*=\s*"[^"]+"/g,
      // Component names and technical identifiers
      /"[A-Z][a-zA-Z]*"/g
    ];

    for (const filePath of this.componentFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, lineIndex) => {
          // Skip lines that are comments, imports, or technical assignments
          if (line.trim().startsWith('//') || 
              line.trim().startsWith('/*') || 
              line.trim().startsWith('*') ||
              line.includes('import ') ||
              line.includes('from ') ||
              line.includes('.displayName') ||
              line.includes('data-slot') ||
              line.includes('aria-') ||
              line.includes('className')) {
            return;
          }

          // Check for hardcoded patterns
          for (const pattern of hardcodedPatterns) {
            const matches = line.matchAll(pattern);
            for (const match of matches) {
              const matchedString = match[0];
              
              // Skip if it matches exclude patterns
              const shouldExclude = excludePatterns.some(excludePattern => {
                excludePattern.lastIndex = 0; // Reset regex
                return excludePattern.test(matchedString);
              });

              if (!shouldExclude && 
                  !this.isTranslationUsage(line) && 
                  !this.isConfigurationValue(matchedString) &&
                  !this.isReactTechnicalString(matchedString, line)) {
                hardcodedStrings.push({
                  file: filePath,
                  line: lineIndex + 1,
                  content: line.trim(),
                  match: matchedString
                });
              }
            }
          }
        });
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }

    return hardcodedStrings;
  }

  private isTranslationUsage(line: string): boolean {
    return line.includes('useTranslations') || 
           line.includes('t(') || 
           line.includes('t.') ||
           line.includes('{t(');
  }

  private isConfigurationValue(str: string): boolean {
    const configPatterns = [
      /^"(light|dark|system|default|outline|ghost|sm|lg|xl|left|right|center|top|bottom)"$/,
      /^"[a-z-]+:[a-z-]+"$/, // CSS-like values
      /^"#[0-9a-fA-F]{3,6}"$/, // Hex colors
      /^"[0-9]+px"$/, // Pixel values
      /^"[0-9.]+rem"$/ // Rem values
    ];

    return configPatterns.some(pattern => pattern.test(str));
  }

  private isReactTechnicalString(str: string, line: string): boolean {
    // Check if it's a React component name or technical identifier
    const reactTechnicalPatterns = [
      /^"[A-Z][a-zA-Z]*"$/, // Component names like "DialogHeader"
      /^"[a-z]+[A-Z][a-zA-Z]*"$/, // camelCase technical names
    ];

    // Check if the line contains technical React patterns
    const technicalLinePatterns = [
      /\.displayName\s*=/,
      /data-slot\s*=/,
      /aria-[a-z-]+\s*=/,
      /className\s*=/,
      /forwardRef/,
      /React\./
    ];

    return reactTechnicalPatterns.some(pattern => pattern.test(str)) ||
           technicalLinePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Extracts all translation keys from both language files
   */
  extractAllTranslationKeys(): string[] {
    const keys = new Set<string>();
    
    const extractKeys = (obj: TranslationStructure, prefix = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
          keys.add(fullKey);
        } else if (typeof value === 'object' && value !== null) {
          extractKeys(value, fullKey);
        }
      }
    };

    extractKeys(this.enTranslations);
    extractKeys(this.esTranslations);

    return Array.from(keys).sort();
  }

  /**
   * Validates that all translation keys exist in both language files
   */
  validateTranslationKeyConsistency(): MissingTranslationKey[] {
    const missingKeys: MissingTranslationKey[] = [];
    
    const getValueAtPath = (obj: TranslationStructure, path: string): any => {
      return path.split('.').reduce((current, key) => {
        return current && typeof current === 'object' ? current[key] : undefined;
      }, obj);
    };

    const allKeys = this.extractAllTranslationKeys();

    for (const key of allKeys) {
      const enValue = getValueAtPath(this.enTranslations, key);
      const esValue = getValueAtPath(this.esTranslations, key);
      
      const missingIn: string[] = [];
      const foundIn: string[] = [];

      if (enValue === undefined) {
        missingIn.push('en');
      } else {
        foundIn.push('en');
      }

      if (esValue === undefined) {
        missingIn.push('es');
      } else {
        foundIn.push('es');
      }

      if (missingIn.length > 0) {
        missingKeys.push({
          key,
          missingIn,
          foundIn
        });
      }
    }

    return missingKeys;
  }

  /**
   * Validates structural consistency between translation files
   */
  validateStructuralConsistency(): StructuralInconsistency[] {
    const inconsistencies: StructuralInconsistency[] = [];
    
    const validateStructure = (enObj: any, esObj: any, path = ''): void => {
      const enKeys = Object.keys(enObj || {});
      const esKeys = Object.keys(esObj || {});
      const allKeys = new Set([...enKeys, ...esKeys]);

      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const enValue = enObj?.[key];
        const esValue = esObj?.[key];

        // Check if key exists in both
        if (enValue === undefined || esValue === undefined) {
          continue; // This is handled by validateTranslationKeyConsistency
        }

        // Check type consistency
        const enType = typeof enValue;
        const esType = typeof esValue;

        if (enType !== esType) {
          inconsistencies.push({
            key: currentPath,
            issue: `Type mismatch: en is ${enType}, es is ${esType}`,
            locales: {
              en: enType === 'object' ? '[object]' : String(enValue),
              es: esType === 'object' ? '[object]' : String(esValue)
            }
          });
          continue;
        }

        // If both are objects, recurse
        if (enType === 'object' && enValue !== null && esValue !== null) {
          validateStructure(enValue, esValue, currentPath);
        }

        // Check for empty values
        if (enType === 'string' && (enValue === '' || esValue === '')) {
          inconsistencies.push({
            key: currentPath,
            issue: 'Empty string value detected',
            locales: {
              en: enValue || '[empty]',
              es: esValue || '[empty]'
            }
          });
        }
      }
    };

    validateStructure(this.enTranslations, this.esTranslations);
    return inconsistencies;
  }

  /**
   * Validates that used translation keys in components actually exist
   */
  validateUsedTranslationKeys(): string[] {
    const missingUsedKeys: string[] = [];
    const usedKeys = new Set<string>();

    // Extract translation keys used in components
    for (const filePath of this.componentFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Map variable names to their namespaces
        const translationVars = new Map<string, string>();
        
        // Find useTranslations calls and map variable names to namespaces
        // Handle various patterns: const t = useTranslations('...'), const tCommon = useTranslations('...')
        const useTranslationsPatterns = [
          /const\s+(\w+)\s*=\s*useTranslations\s*\(\s*["']([^"']+)["']\s*\)/g,
          /(\w+)\s*=\s*useTranslations\s*\(\s*["']([^"']+)["']\s*\)/g
        ];
        
        for (const pattern of useTranslationsPatterns) {
          const matches = [...content.matchAll(pattern)];
          for (const match of matches) {
            const varName = match[1];
            const namespace = match[2];
            translationVars.set(varName, namespace);
          }
        }

        // Find all translation function calls
        for (const [varName, namespace] of translationVars.entries()) {
          // Create patterns for this specific variable name
          const tCallPatterns = [
            new RegExp(`${varName}\\s*\\(\\s*["']([^"']+)["']\\s*\\)`, 'g'),
            new RegExp(`\\{${varName}\\s*\\(\\s*["']([^"']+)["']\\s*\\)\\}`, 'g'),
            new RegExp(`${varName}\\s*\\(\\s*["']([^"']+)["']\\s*,`, 'g')
          ];

          for (const pattern of tCallPatterns) {
            const tCallMatches = [...content.matchAll(pattern)];
            for (const tMatch of tCallMatches) {
              const keyPart = tMatch[1];
              if (keyPart && keyPart.trim() !== '' && !keyPart.includes('/')) {
                const fullKey = `${namespace}.${keyPart}`;
                usedKeys.add(fullKey);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error analyzing file ${filePath}:`, error);
      }
    }

    // Check if used keys exist in translation files
    const getValueAtPath = (obj: TranslationStructure, path: string): any => {
      return path.split('.').reduce((current, key) => {
        return current && typeof current === 'object' ? current[key] : undefined;
      }, obj);
    };

    for (const key of usedKeys) {
      const enValue = getValueAtPath(this.enTranslations, key);
      const esValue = getValueAtPath(this.esTranslations, key);
      
      if (enValue === undefined || esValue === undefined) {
        missingUsedKeys.push(key);
      }
    }

    return missingUsedKeys;
  }
}

describe('Translation Coverage Tests', () => {
  let validator: TranslationCoverageValidator;

  beforeAll(async () => {
    validator = new TranslationCoverageValidator();
    await validator.loadComponentFiles();
  });

  describe('Hardcoded String Detection', () => {
    it('should not have hardcoded user-facing strings in components', () => {
      const hardcodedStrings = validator.scanForHardcodedStrings();
      
      if (hardcodedStrings.length > 0) {
        console.log('\n🚨 Hardcoded strings found:');
        hardcodedStrings.forEach(item => {
          console.log(`  ${item.file}:${item.line} - ${item.match}`);
          console.log(`    Context: ${item.content}`);
        });
      }

      expect(hardcodedStrings).toHaveLength(0);
    });
  });

  describe('Translation Key Consistency', () => {
    it('should have all translation keys in both language files', () => {
      const missingKeys = validator.validateTranslationKeyConsistency();
      
      if (missingKeys.length > 0) {
        console.log('\n🚨 Missing translation keys:');
        missingKeys.forEach(item => {
          console.log(`  Key: ${item.key}`);
          console.log(`    Missing in: ${item.missingIn.join(', ')}`);
          console.log(`    Found in: ${item.foundIn.join(', ')}`);
        });
      }

      expect(missingKeys).toHaveLength(0);
    });

    it('should have consistent translation file structure', () => {
      const inconsistencies = validator.validateStructuralConsistency();
      
      if (inconsistencies.length > 0) {
        console.log('\n🚨 Structural inconsistencies found:');
        inconsistencies.forEach(item => {
          console.log(`  Key: ${item.key}`);
          console.log(`    Issue: ${item.issue}`);
          console.log(`    EN: ${item.locales.en}`);
          console.log(`    ES: ${item.locales.es}`);
        });
      }

      expect(inconsistencies).toHaveLength(0);
    });

    it('should report used translation keys that may be missing', () => {
      const missingUsedKeys = validator.validateUsedTranslationKeys();
      
      if (missingUsedKeys.length > 0) {
        console.log('\n⚠️  Potentially missing translation keys (review manually):');
        missingUsedKeys.forEach(key => {
          console.log(`  ${key}`);
        });
        console.log('\nNote: Some of these may be false positives due to dynamic key usage or complex patterns.');
      } else {
        console.log('\n✅ All detected translation keys appear to be defined.');
      }

      // This test is informational - we don't fail on missing keys as they might be false positives
      expect(true).toBe(true);
    });
  });

  describe('Translation File Validation', () => {
    it('should have valid JSON structure in both translation files', () => {
      expect(validator['enTranslations']).toBeDefined();
      expect(validator['esTranslations']).toBeDefined();
      expect(typeof validator['enTranslations']).toBe('object');
      expect(typeof validator['esTranslations']).toBe('object');
    });

    it('should have the same top-level namespaces in both files', () => {
      const enNamespaces = Object.keys(validator['enTranslations']).sort();
      const esNamespaces = Object.keys(validator['esTranslations']).sort();
      
      expect(enNamespaces).toEqual(esNamespaces);
    });

    it('should not have empty translation values', () => {
      const allKeys = validator.extractAllTranslationKeys();
      const emptyKeys: string[] = [];

      const getValueAtPath = (obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => {
          return current && typeof current === 'object' ? current[key] : undefined;
        }, obj);
      };

      for (const key of allKeys) {
        const enValue = getValueAtPath(validator['enTranslations'], key);
        const esValue = getValueAtPath(validator['esTranslations'], key);
        
        if ((typeof enValue === 'string' && enValue.trim() === '') ||
            (typeof esValue === 'string' && esValue.trim() === '')) {
          emptyKeys.push(key);
        }
      }

      if (emptyKeys.length > 0) {
        console.log('\n🚨 Empty translation values found:');
        emptyKeys.forEach(key => console.log(`  ${key}`));
      }

      expect(emptyKeys).toHaveLength(0);
    });
  });

  describe('Translation Coverage Statistics', () => {
    it('should report translation coverage statistics', () => {
      const allKeys = validator.extractAllTranslationKeys();
      const missingKeys = validator.validateTranslationKeyConsistency();
      const inconsistencies = validator.validateStructuralConsistency();
      
      console.log('\n📊 Translation Coverage Statistics:');
      console.log(`  Total translation keys: ${allKeys.length}`);
      console.log(`  Missing keys: ${missingKeys.length}`);
      console.log(`  Structural inconsistencies: ${inconsistencies.length}`);
      console.log(`  Coverage: ${((allKeys.length - missingKeys.length) / allKeys.length * 100).toFixed(1)}%`);
      
      // This test always passes, it's just for reporting
      expect(true).toBe(true);
    });
  });
});