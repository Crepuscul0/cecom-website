/**
 * Tests for Translation Validation Utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  TranslationValidator, 
  TranslationWarningSystem,
  translationValidator,
  translationWarningSystem 
} from '../translation-validator';

// Mock fs module
vi.mock('fs');
const mockFs = vi.mocked(fs);

describe('TranslationValidator', () => {
  let validator: TranslationValidator;
  
  beforeEach(() => {
    validator = new TranslationValidator('test-messages', ['en', 'es']);
    vi.clearAllMocks();
  });

  describe('validateTranslations', () => {
    it('should validate complete and consistent translation files', async () => {
      const enTranslations = {
        Common: {
          buttons: {
            submit: 'Submit',
            cancel: 'Cancel'
          }
        },
        Header: {
          home: 'Home'
        }
      };

      const esTranslations = {
        Common: {
          buttons: {
            submit: 'Enviar',
            cancel: 'Cancelar'
          }
        },
        Header: {
          home: 'Inicio'
        }
      };

      mockFs.existsSync.mockImplementation((filePath: string) => {
        return filePath.includes('en.json') || filePath.includes('es.json');
      });

      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('en.json')) {
          return JSON.stringify(enTranslations);
        }
        if (filePath.includes('es.json')) {
          return JSON.stringify(esTranslations);
        }
        return '';
      });

      const result = await validator.validateTranslations();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.missingKeys).toHaveLength(0);
    });

    it('should detect missing translation files', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await validator.validateTranslations();

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].type).toBe('missing_file');
      expect(result.errors[0].message).toContain('en');
      expect(result.errors[1].message).toContain('es');
    });

    it('should detect invalid JSON structure', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('en.json')) {
          return '{ invalid json }';
        }
        return '{}';
      });

      const result = await validator.validateTranslations();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'invalid_json')).toBe(true);
    });

    it('should detect missing keys between locales', async () => {
      const enTranslations = {
        Common: {
          buttons: {
            submit: 'Submit',
            cancel: 'Cancel'
          }
        }
      };

      const esTranslations = {
        Common: {
          buttons: {
            submit: 'Enviar'
            // Missing 'cancel' key
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('en.json')) {
          return JSON.stringify(enTranslations);
        }
        return JSON.stringify(esTranslations);
      });

      const result = await validator.validateTranslations();

      expect(result.missingKeys).toHaveLength(1);
      expect(result.missingKeys[0].key).toBe('Common.buttons.cancel');
      expect(result.missingKeys[0].missingIn).toContain('es');
      expect(result.warnings.some(w => w.type === 'missing_key')).toBe(true);
    });

    it('should detect structural inconsistencies', async () => {
      const enTranslations = {
        Common: {
          buttons: 'This should be an object'
        }
      };

      const esTranslations = {
        Common: {
          buttons: {
            submit: 'Enviar'
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('en.json')) {
          return JSON.stringify(enTranslations);
        }
        return JSON.stringify(esTranslations);
      });

      const result = await validator.validateTranslations();

      expect(result.inconsistencies.length).toBeGreaterThan(0);
      expect(result.inconsistencies.some(i => i.type === 'type_mismatch')).toBe(true);
    });

    it('should detect empty values', async () => {
      const enTranslations = {
        Common: {
          buttons: {
            submit: '',
            cancel: 'Cancel'
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(enTranslations));

      const result = await validator.validateTranslations();

      expect(result.warnings.some(w => w.type === 'empty_value')).toBe(true);
      expect(result.warnings.some(w => w.key === 'Common.buttons.submit')).toBe(true);
    });
  });

  describe('checkTranslationKey', () => {
    it('should return true for existing keys in all locales', async () => {
      const translations = {
        Common: {
          buttons: {
            submit: 'Submit'
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(translations));

      const exists = await validator.checkTranslationKey('Common.buttons.submit');
      expect(exists).toBe(true);
    });

    it('should return false for missing keys', async () => {
      const translations = {
        Common: {
          buttons: {
            submit: 'Submit'
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(translations));

      const exists = await validator.checkTranslationKey('Common.buttons.nonexistent');
      expect(exists).toBe(false);
    });
  });

  describe('getTranslationValue', () => {
    it('should return the correct translation value', async () => {
      const translations = {
        Common: {
          buttons: {
            submit: 'Submit'
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(translations));

      const value = await validator.getTranslationValue('Common.buttons.submit', 'en');
      expect(value).toBe('Submit');
    });

    it('should return null for missing keys', async () => {
      const translations = {
        Common: {
          buttons: {
            submit: 'Submit'
          }
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(translations));

      const value = await validator.getTranslationValue('Common.buttons.nonexistent', 'en');
      expect(value).toBe(null);
    });
  });
});

describe('TranslationWarningSystem', () => {
  let warningSystem: TranslationWarningSystem;
  let consoleSpy: any;

  beforeEach(() => {
    warningSystem = TranslationWarningSystem.getInstance();
    warningSystem.clearWarnings();
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock development environment
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  describe('warnMissingKey', () => {
    it('should warn about missing keys in development', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({}));

      await warningSystem.warnMissingKey('nonexistent.key', 'en', 'TestComponent');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Translation Warning: Missing key \'nonexistent.key\'')
      );
    });

    it('should not warn about the same key twice', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({}));

      await warningSystem.warnMissingKey('nonexistent.key', 'en');
      await warningSystem.warnMissingKey('nonexistent.key', 'en');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it('should not warn in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      await warningSystem.warnMissingKey('nonexistent.key', 'en');

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('validateAndWarn', () => {
    it('should log validation results in development', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await warningSystem.validateAndWarn();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Translation Validation Errors')
      );
    });

    it('should not log in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      await warningSystem.validateAndWarn();

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});

describe('Singleton instances', () => {
  it('should export singleton instances', () => {
    expect(translationValidator).toBeInstanceOf(TranslationValidator);
    expect(translationWarningSystem).toBeInstanceOf(TranslationWarningSystem);
  });

  it('should return the same instance for TranslationWarningSystem', () => {
    const instance1 = TranslationWarningSystem.getInstance();
    const instance2 = TranslationWarningSystem.getInstance();
    expect(instance1).toBe(instance2);
  });
});