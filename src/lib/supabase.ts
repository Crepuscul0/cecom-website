import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'administrator' | 'seller' | 'employee';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  active: boolean;
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
        role: userData.role || 'employee'
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

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const canModifyContent = (userRole: UserRole): boolean => {
  return hasPermission(userRole, ['administrator', 'seller']);
};

export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === 'administrator';
};