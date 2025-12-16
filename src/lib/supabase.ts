import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable to detect password reset tokens
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'cecom-auth-token',
    flowType: 'pkce'
  }
});

// Handle auth state changes and clear invalid tokens
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully');
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    }
    
    // Clear invalid refresh tokens
    if (event === 'USER_UPDATED' && !session) {
      localStorage.removeItem('cecom-auth-token');
    }
  });
}

export type UserRole = 'admin' | 'employee' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  active: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const signUp = async (email: string, password: string, userData: {
  first_name: string;
  last_name: string;
  role?: UserRole;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  
  if (data.user && !error) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || 'user',
        approval_status: 'pending'
      });
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const result = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  // If email not confirmed, provide helpful error message
  if (result.error && result.error.message === 'Email not confirmed') {
    return {
      ...result,
      error: {
        ...result.error,
        message: 'Email no confirmado. Contacta al administrador del sistema para confirmar tu cuenta.'
      }
    };
  }
  
  return result;
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Fetches a user profile from the database
 * @param userId The ID of the user to fetch
 * @returns UserProfile if found, null otherwise
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) {
    console.error('❌ No user ID provided to getUserProfile');
    return null;
  }

  try {
    console.log(`🔍 Fetching user profile for ID: ${userId}`);
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out after 10 seconds'));
      }, 10000);
    });

    // Create the Supabase query promise
    const queryPromise = supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Race the query against the timeout
    const { data, error } = await Promise.race([
      queryPromise,
      timeoutPromise.then(() => ({ data: null, error: { code: 'TIMEOUT', message: 'Request timed out' } }))
    ]);
    
    if (error) {
      // Handle specific error cases
      switch (error.code) {
        case '42P01': // Table doesn't exist
          console.error('❌ The user_profiles table does not exist. Please run your database migrations.');
          break;
          
        case '42501': // Permission denied
          console.error('🔒 Permission denied when accessing user_profiles table. Check RLS policies.');
          break;
          
        case 'PGRST116': // Not found
          console.warn(`ℹ️ User profile not found for ID: ${userId}`);
          break;
          
        case 'ABORT_ERR':
          console.error('⏱️ Request timed out while fetching user profile');
          break;
          
        default: {
          const details = 'details' in error ? error.details : undefined;
          const hint = 'hint' in error ? error.hint : undefined;

          console.error('❌ Error fetching user profile:', {
            code: error.code,
            message: error.message,
            ...(details ? { details } : {}),
            ...(hint ? { hint } : {})
          });
          break;
        }
      }
      return null;
    }
    
    if (!data) {
      console.warn(`ℹ️ No data returned for user ID: ${userId}`);
      return null;
    }
    
    console.log(`✅ Successfully retrieved profile for user: ${data.email || userId}`);
    return data;
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error);
    return null;
  }
};

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const canModifyContent = (userRole: UserRole): boolean => {
  return hasPermission(userRole, ['admin', 'employee']);
};

export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

export const isEmployee = (userRole: UserRole): boolean => {
  return userRole === 'employee';
};

export const isUser = (userRole: UserRole): boolean => {
  return userRole === 'user';
};