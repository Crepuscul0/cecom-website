/**
 * Development Translation Utilities
 * 
 * This file provides utilities for development-time translation validation
 * and debugging. These utilities are only active in development mode.
 */

import { translationWarningSystem, translationValidator } from './translation-validator';

/**
 * Initialize translation validation in development mode
 * Call this in your app's root component or _app.tsx
 */
export function initTranslationValidation(): void {
  if (process.env.NODE_ENV !== 'development') return;

  // Validate translations on app startup
  translationWarningSystem.validateAndWarn().catch(error => {
    console.error('Failed to validate translations on startup:', error);
  });

  // Add global validation function for debugging
  if (typeof window !== 'undefined') {
    (window as any).__validateTranslations = async () => {
      const result = await translationValidator.validateTranslations();
      console.group('🌐 Translation Validation Results');
      console.log('Valid:', result.isValid);
      console.log('Errors:', result.errors);
      console.log('Warnings:', result.warnings);
      console.log('Missing Keys:', result.missingKeys);
      console.log('Inconsistencies:', result.inconsistencies);
      console.groupEnd();
      return result;
    };

    (window as any).__checkTranslationKey = async (key: string) => {
      const exists = await translationValidator.checkTranslationKey(key);
      console.log(`Translation key '${key}' exists:`, exists);
      return exists;
    };

    console.log('🌐 Translation debugging utilities available:');
    console.log('  - __validateTranslations() - Run full validation');
    console.log('  - __checkTranslationKey(key) - Check if key exists');
  }
}

/**
 * Component wrapper that validates translations on mount
 */
export function withTranslationValidation<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  if (process.env.NODE_ENV !== 'development') {
    return Component;
  }

  const WrappedComponent = (props: T) => {
    // Validate on mount
    React.useEffect(() => {
      translationWarningSystem.validateAndWarn().catch(error => {
        console.error(`Translation validation failed in ${componentName}:`, error);
      });
    }, []);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withTranslationValidation(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook to validate specific translation keys used by a component
 */
export function useTranslationKeyValidation(keys: string[], componentName?: string): void {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const validateKeys = async () => {
      for (const key of keys) {
        const exists = await translationValidator.checkTranslationKey(key);
        if (!exists) {
          console.warn(
            `🌐 Translation key '${key}' used in ${componentName || 'component'} does not exist in all locales`
          );
        }
      }
    };

    validateKeys().catch(error => {
      console.error('Failed to validate translation keys:', error);
    });
  }, [keys, componentName]);
}

/**
 * Development-only function to log translation coverage for specific namespace
 */
export async function logNamespaceTranslationCoverage(namespace: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const result = await translationValidator.validateTranslations();
  
  const namespaceKeys = result.missingKeys.filter(missing => 
    missing.key.startsWith(`${namespace}.`)
  );

  console.group(`🌐 Translation Coverage for '${namespace}' namespace`);
  
  if (namespaceKeys.length === 0) {
    console.log('✅ All keys in this namespace are present in all locales');
  } else {
    console.log(`❌ ${namespaceKeys.length} missing keys found:`);
    namespaceKeys.forEach(missing => {
      console.log(`  • ${missing.key} (missing in: ${missing.missingIn.join(', ')})`);
    });
  }
  
  console.groupEnd();
}

// Re-export for convenience
export { translationValidator, translationWarningSystem };

// Import React for the wrapper component
import React from 'react';