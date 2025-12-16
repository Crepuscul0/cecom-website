/**
 * Auth Error Handler
 * Handles common Supabase authentication errors
 */

import { supabase } from './supabase';

export const handleAuthError = async (error: any) => {
  // Invalid refresh token error
  if (error?.message?.includes('Invalid Refresh Token') || 
      error?.message?.includes('Refresh Token Not Found')) {
    console.warn('Invalid refresh token detected, clearing session...');
    
    // Clear the invalid session
    await supabase.auth.signOut();
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cecom-auth-token');
      localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
    }
    
    return {
      shouldRedirect: true,
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
    };
  }
  
  // Email not confirmed
  if (error?.message?.includes('Email not confirmed')) {
    return {
      shouldRedirect: false,
      message: 'Email no confirmado. Contacta al administrador del sistema.'
    };
  }
  
  // Invalid credentials
  if (error?.message?.includes('Invalid login credentials')) {
    return {
      shouldRedirect: false,
      message: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    };
  }
  
  // User not found
  if (error?.message?.includes('User not found')) {
    return {
      shouldRedirect: false,
      message: 'Usuario no encontrado. Verifica tu correo electrónico.'
    };
  }
  
  // Network error
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('Network request failed')) {
    return {
      shouldRedirect: false,
      message: 'Error de conexión. Verifica tu conexión a internet.'
    };
  }
  
  // Default error
  return {
    shouldRedirect: false,
    message: error?.message || 'Error inesperado al autenticar.'
  };
};

/**
 * Check if current session is valid
 */
export const checkSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      await handleAuthError(error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error checking session:', error);
    return null;
  }
};

/**
 * Refresh session if needed
 */
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      await handleAuthError(error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    await handleAuthError(error);
    return null;
  }
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    // Clear all possible auth keys
    const keysToRemove = [
      'cecom-auth-token',
      'sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token',
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear all supabase keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
  }
};
