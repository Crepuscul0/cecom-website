/**
 * Test setup file for Vitest
 * Configures the testing environment for React components and hooks
 */

import { vi, expect } from 'vitest';
import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Make React available globally
global.React = React;

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock next-intl module
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock environment variables
if (!process.env.NODE_ENV) {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true,
    configurable: true
  });
}