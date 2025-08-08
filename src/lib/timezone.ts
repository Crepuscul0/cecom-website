// Global timezone configuration
// This ensures the timezone is set consistently across the application

// For client-side, we can use Intl.DateTimeFormat to ensure consistent formatting
export const TIMEZONE = 'America/Santo_Domingo';

// Utility function to get current time in the correct timezone
export function getCurrentTime(): Date {
  return new Date();
}

// Utility function to format dates consistently
export function formatDate(date: Date, locale: 'en' | 'es' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Utility function to format time consistently
export function formatTime(date: Date, locale: 'en' | 'es' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Utility function to format datetime consistently
export function formatDateTime(date: Date, locale: 'en' | 'es' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}