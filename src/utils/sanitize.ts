/**
 * A basic HTML sanitizer that removes script tags and inline event handlers.
 * This is a workaround to prevent XSS when a dedicated library like DOMPurify
 * cannot be installed due to dependency conflicts.
 *
 * @param html - The HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof html !== 'string') return '';

  // 1. Remove script tags and their content
  let sanitized = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');

  // 2. Remove all `on...` event attributes (e.g., onerror, onload, onclick)
  sanitized = sanitized.replace(/\s(on\w+)=["']?.*["']?/gim, '');

  // 3. Remove javascript: URLs from href attributes
  sanitized = sanitized.replace(/href=["']?javascript:/gim, 'href="#"');

  return sanitized;
};
