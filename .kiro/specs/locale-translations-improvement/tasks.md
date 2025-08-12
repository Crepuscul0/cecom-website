# Implementation Plan

- [x] 1. Expand and organize translation files
  - Analyze current translation files and identify missing keys
  - Create comprehensive translation structure with Common and Validation namespaces
  - Add missing translations for all hardcoded texts found in components
  - _Requirements: 2.1, 2.2, 2.5, 7.1, 7.2, 7.3, 7.4_

- [x] 2. Create Common and Validation translation namespaces
  - Add Common namespace with buttons, states, and accessibility translations
  - Add Validation namespace with form validation messages
  - Update both en.json and es.json files with new namespaces
  - _Requirements: 2.1, 2.2, 2.3, 4.2, 7.1, 7.2_

- [x] 3. Refactor ContactForm component to use complete translations
  - Remove hardcoded success and error messages
  - Implement useTranslations for all form states and validation messages
  - Update form to use Validation namespace for error messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 2.1, 2.2_

- [x] 4. Update catalog components with missing translations
- [x] 4.1 Fix ProductFilter component hardcoded texts
  - Replace hardcoded "All Vendors" text with translation
  - Add translations for loading states and error messages
  - Implement proper translation keys for filter labels
  - _Requirements: 3.1, 3.2, 3.3, 2.1, 2.2_

- [x] 4.2 Update CategorySidebar component translations
  - Ensure all category-related texts use translations
  - Add translations for loading and error states
  - Verify category names and descriptions are properly translated
  - _Requirements: 3.4, 3.5, 2.1, 2.2_

- [x] 4.3 Complete ProductGrid and ProductModal translations
  - Add missing translations for product modal navigation
  - Implement translations for product details and specifications
  - Add translations for modal accessibility labels
  - _Requirements: 3.5, 6.4, 2.1, 2.2_

- [x] 5. Add accessibility translations to Header component
  - Add translations for screen reader labels and tooltips
  - Implement proper aria-label translations for navigation elements
  - Add translations for mobile menu accessibility
  - _Requirements: 6.1, 6.2, 6.4, 6.5, 2.1, 2.2_

- [x] 6. Create translation validation utility
  - Write utility function to check for missing translation keys
  - Create function to validate translation file consistency between locales
  - Implement development-mode warnings for missing translations
  - _Requirements: 2.1, 2.2, 7.3, 7.4_

- [x] 7. Implement unit tests for translation hooks
  - Create tests for useTranslations hook functionality
  - Test locale switching and persistence behavior
  - Verify fallback behavior when translations are missing
  - _Requirements: 5.1, 5.2, 2.3, 2.4_

- [x] 8. Create component translation tests
- [x] 8.1 Test Header component translations
  - Verify all navigation links render correctly in both languages
  - Test mobile menu functionality with translations
  - Validate accessibility labels are translated
  - _Requirements: 5.1, 6.1, 6.2, 6.4_

- [x] 8.2 Test ContactForm component translations
  - Verify form renders correctly in both languages
  - Test validation messages appear in correct language
  - Test success/error messages are properly translated
  - _Requirements: 5.1, 5.3, 4.1, 4.2, 4.3, 4.4_

- [x] 8.3 Test catalog components translations
  - Verify ProductFilter component translations work correctly
  - Test CategorySidebar renders categories in correct language
  - Validate ProductModal shows translated content
  - _Requirements: 5.1, 5.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9. Create integration tests for language switching
  - Test complete language switching flow across all pages
  - Verify URL updates correctly when language changes
  - Test cookie persistence of language preference
  - _Requirements: 5.5, 1.1, 1.2, 1.3, 1.4, 6.3_

- [x] 10. Fix ThemeToggle component hardcoded strings
  - Replace hardcoded "Light", "Dark", "System", "Toggle theme" with translations
  - Add theme-related translations to Common namespace (already exists)
  - Update component to use useTranslations hook
  - _Requirements: 2.1, 2.2, 6.4, 6.5_

- [x] 11. Implement form validation tests in both languages
  - Test ContactForm validation works in English and Spanish
  - Verify error messages appear in correct language
  - Test form submission success/error flows in both languages
  - _Requirements: 5.3, 5.5, 4.2, 4.3, 4.4_

- [x] 12. Create comprehensive translation coverage test
  - Write test to scan all components for hardcoded strings
  - Implement test to verify all translation keys exist in both language files
  - Create test to validate translation file structure consistency
  - _Requirements: 5.1, 2.1, 7.3, 7.4_

- [x] 13. Add end-to-end language switching tests
  - Test complete user journey in Spanish from homepage to contact form
  - Verify catalog functionality works correctly in both languages
  - Test language persistence across page navigation and browser refresh
  - _Requirements: 5.5, 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 14. Final integration testing and validation
  - Execute all translation tests to ensure complete coverage
  - Perform manual testing of language switching across all pages
  - Validate that all requirements are met and functioning correctly
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 15. Fix remaining hardcoded strings in ProductCard component
  - Replace hardcoded "Product image" alt text with translation
  - Replace hardcoded "No image" text with translation
  - Add translations to Catalog namespace for image-related messages
  - _Requirements: 2.1, 2.2, 3.5_

- [ ] 16. Fix ContactForm test mocking issues
  - Update test mocking approach to work with current Vitest version
  - Fix useTranslations mock implementation in ContactForm tests
  - Ensure all ContactForm validation tests pass consistently
  - _Requirements: 5.1, 5.3_