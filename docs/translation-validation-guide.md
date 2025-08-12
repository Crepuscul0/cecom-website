# Translation Validation Guide

This guide explains how to use the translation validation utility to maintain consistent and complete translations across all supported locales.

## Overview

The translation validation utility provides:
- **Missing key detection**: Identifies keys missing in specific locales
- **Structural consistency**: Validates that translation files have the same structure
- **Development warnings**: Shows warnings only in development mode
- **CLI validation**: Can be run from command line or as npm script
- **Empty value detection**: Finds empty or missing translation values

## Quick Start

### 1. CLI Validation

Run the validation script to check all translation files:

```bash
npm run validate:translations
```

This will output a detailed report showing:
- ✅ Success message if all translations are valid
- ❌ Errors for missing files or invalid JSON
- ⚠️ Warnings for missing keys or empty values
- 📊 Summary with counts of issues found

### 2. Development Warnings

In development mode, the system automatically warns about missing translation keys:

```typescript
import { useTranslationsWithValidation } from '@/lib/use-translations-with-validation';

function MyComponent() {
  const t = useTranslationsWithValidation('Common', 'MyComponent');
  
  // This will warn in console if 'nonexistent.key' doesn't exist
  return <div>{t('nonexistent.key')}</div>;
}
```

### 3. Component Validation

Add automatic validation to components:

```typescript
import { useTranslationValidation } from '@/lib/use-translations-with-validation';

function MyComponent() {
  // Validates all translations when component mounts (dev only)
  useTranslationValidation('MyComponent');
  
  return <div>My Component</div>;
}
```

## API Reference

### TranslationValidator

Core validation class with methods for checking translation consistency.

```typescript
import { translationValidator } from '@/lib/translation-validator';

// Validate all translation files
const result = await translationValidator.validateTranslations();

// Check if a specific key exists in all locales
const exists = await translationValidator.checkTranslationKey('Common.buttons.submit');

// Get translation value for a specific key and locale
const value = await translationValidator.getTranslationValue('Common.buttons.submit', 'en');
```

### TranslationWarningSystem

Development warning system for missing translations.

```typescript
import { translationWarningSystem } from '@/lib/translation-validator';

// Warn about missing key (development only)
await translationWarningSystem.warnMissingKey('missing.key', 'en', 'ComponentName');

// Validate and log all issues (development only)
await translationWarningSystem.validateAndWarn();
```

### Development Utilities

Additional utilities for debugging and development.

```typescript
import { 
  initTranslationValidation,
  logTranslationCoverage,
  checkTranslationExists 
} from '@/lib/dev-translation-utils';

// Initialize validation in your app (call in _app.tsx or root component)
initTranslationValidation();

// Check if a translation key exists
const exists = await checkTranslationExists('Common.buttons.submit');

// Log coverage report for all translations
await logTranslationCoverage();
```

## Integration

### 1. Add to Build Process

Add validation to your CI/CD pipeline:

```json
{
  "scripts": {
    "build": "npm run validate:translations && next build",
    "test": "npm run validate:translations && vitest"
  }
}
```

### 2. Pre-commit Hook

Add to `.husky/pre-commit` or similar:

```bash
#!/bin/sh
npm run validate:translations
```

### 3. Development Setup

Initialize validation in your app's root component:

```typescript
// pages/_app.tsx or app/layout.tsx
import { initTranslationValidation } from '@/lib/dev-translation-utils';

export default function App({ children }) {
  // Initialize translation validation in development
  initTranslationValidation();
  
  return children;
}
```

## Configuration

### Supported Locales

The validator is configured for English and Spanish by default. To add more locales:

```typescript
// Create custom validator instance
const validator = new TranslationValidator('messages', ['en', 'es', 'fr', 'de']);
```

### Translation File Structure

Translation files should be JSON files in the `messages/` directory:

```
messages/
├── en.json
├── es.json
└── fr.json
```

Each file should have the same nested structure:

```json
{
  "Common": {
    "buttons": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  },
  "Header": {
    "home": "Home"
  }
}
```

## Troubleshooting

### Common Issues

1. **"Translation file missing"**: Ensure all locale files exist in the `messages/` directory
2. **"Invalid JSON structure"**: Check for syntax errors in translation files
3. **"Missing keys"**: Add missing translation keys to the appropriate locale files
4. **"Type mismatch"**: Ensure the same keys have the same data types across locales

### Debug Mode

Enable debug logging in development:

```typescript
// In browser console (development only)
__validateTranslations(); // Run full validation
__checkTranslationKey('Common.buttons.submit'); // Check specific key
```

### Testing

The validation utility includes comprehensive tests. Run them with:

```bash
npm test src/lib/__tests__/translation-validator.test.ts
```

## Best Practices

1. **Run validation regularly**: Add to your build process and pre-commit hooks
2. **Use descriptive keys**: Use nested namespaces like `Common.buttons.submit`
3. **Keep structure consistent**: Maintain the same nested structure across all locales
4. **Avoid empty values**: Provide translations for all keys in all locales
5. **Use development warnings**: Enable validation in development to catch issues early

## Examples

### Basic Usage

```typescript
// Check if translations are valid
const result = await translationValidator.validateTranslations();
if (!result.isValid) {
  console.error('Translation errors:', result.errors);
}

// Get missing keys
const missingKeys = result.missingKeys;
missingKeys.forEach(missing => {
  console.log(`Key '${missing.key}' missing in: ${missing.missingIn.join(', ')}`);
});
```

### Component Integration

```typescript
import { useTranslationsWithValidation } from '@/lib/use-translations-with-validation';

function ContactForm() {
  const t = useTranslationsWithValidation('Contact.form', 'ContactForm');
  
  return (
    <form>
      <input placeholder={t('fullNamePlaceholder')} />
      <input placeholder={t('emailPlaceholder')} />
      <button type="submit">{t('submit')}</button>
    </form>
  );
}
```

This utility helps maintain high-quality translations and prevents missing or inconsistent translations from reaching production.