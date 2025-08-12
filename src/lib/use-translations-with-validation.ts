/**
 * Enhanced useTranslations hook with validation warnings
 * 
 * This hook wraps the standard next-intl useTranslations hook to provide
 * development-mode warnings for missing translation keys.
 */

import { useTranslations as useNextIntlTranslations, useLocale } from 'next-intl';
import { translationWarningSystem } from './translation-validator';
import { useEffect } from 'react';

/**
 * Enhanced useTranslations hook that provides validation warnings in development
 */
export function useTranslationsWithValidation(namespace?: string, component?: string) {
  const t = useNextIntlTranslations(namespace);
  const locale = useLocale();

  // Create a wrapper function that validates keys before translation
  const validatedT = (key: string, values?: Record<string, any>) => {
    // In development, warn about missing keys
    if (process.env.NODE_ENV === 'development') {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      
      // Use setTimeout to avoid blocking the render
      setTimeout(() => {
        translationWarningSystem.warnMissingKey(fullKey, locale, component);
      }, 0);
    }

    return t(key, values);
  };

  return validatedT;
}

/**
 * Hook to validate translations on component mount (development only)
 */
export function useTranslationValidation(componentName?: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Validate translations when component mounts
      translationWarningSystem.validateAndWarn().catch(error => {
        console.error('Translation validation failed:', error);
      });
    }
  }, [componentName]);
}

/**
 * Utility function to check if a translation key exists
 */
export async function checkTranslationExists(key: string): Promise<boolean> {
  const { translationValidator } = await import('./translation-validator');
  return translationValidator.checkTranslationKey(key);
}

/**
 * Utility function to get all missing translation keys
 */
export async function getMissingTranslationKeys(): Promise<string[]> {
  const { translationValidator } = await import('./translation-validator');
  const result = await translationValidator.validateTranslations();
  return result.missingKeys.map(missing => missing.key);
}

/**
 * Development utility to log translation coverage report
 */
export async function logTranslationCoverage(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const { translationValidator } = await import('./translation-validator');
  const result = await translationValidator.validateTranslations();
  
  console.group('🌐 Translation Coverage Report');
  
  if (result.isValid) {
    console.log('✅ All translations are valid and consistent');
  } else {
    console.log('❌ Translation issues found');
  }
  
  console.log(`📊 Total missing keys: ${result.missingKeys.length}`);
  console.log(`⚠️  Total warnings: ${result.warnings.length}`);
  console.log(`🚨 Total errors: ${result.errors.length}`);
  
  if (result.missingKeys.length > 0) {
    console.group('Missing Keys:');
    result.missingKeys.forEach(missing => {
      console.log(`• ${missing.key} (missing in: ${missing.missingIn.join(', ')})`);
    });
    console.groupEnd();
  }
  
  if (result.errors.length > 0) {
    console.group('Errors:');
    result.errors.forEach(error => {
      console.error(`• ${error.message}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}