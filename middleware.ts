import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const locales = ['en', 'es'];
const defaultLocale = 'en';

export async function middleware(request: NextRequest) {
  // First, handle the Supabase session. This will return a response object
  // with the updated session cookies.
  const response = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  
  // Skip locale handling for admin panel routes and public assets
  const isAdminPanelRoute = adminPanelPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  );
  
  // Skip locale handling for public directory
  if (isAdminPanelRoute || pathname.startsWith('/public')) {
    return response;
  }
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const redirectUrl = new URL(
      `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
      request.url
    );

    // When redirecting, we must use the response object created by `updateSession`
    // to ensure the session cookies are forwarded.
    return NextResponse.redirect(redirectUrl, response);
  }

  // If no redirect is needed, return the response from `updateSession`.
  return response;
}

function getLocale(request: NextRequest): string {
  // Check if user has a preferred locale in cookies
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0];
    
    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  return defaultLocale;
}

// Don't apply the locale prefix for admin panel routes
const adminPanelPaths = [
  '/admin-panel',
  '/auth',
  '/api'
];

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets directory)
     * - static file extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};