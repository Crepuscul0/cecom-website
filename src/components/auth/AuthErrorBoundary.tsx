'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { handleAuthError, clearAuthData } from '@/lib/auth-error-handler';

export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Listen for auth errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        clearAuthData();
      }
      
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, clearing session');
        await supabase.auth.signOut();
        clearAuthData();
        
        // Optionally redirect to login
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/auth';
        }
      }
    });

    // Check for invalid tokens on mount
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          const result = await handleAuthError(error);
          if (result.shouldRedirect) {
            clearAuthData();
            if (window.location.pathname.includes('/admin')) {
              window.location.href = '/auth';
            }
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
