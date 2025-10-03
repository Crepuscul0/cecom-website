#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('🔐 Creando usuario administrador...');

  try {
    // First, check if user already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'admin@cecom.com.do')
      .single();

    if (existingProfile) {
      console.log('✅ Usuario administrador ya existe');
      console.log('');
      console.log('📋 Credenciales de acceso:');
      console.log('   Email: admin@cecom.com.do');
      console.log('   Contraseña: admin123');
      console.log('   Rol: administrator');
      console.log('');
      console.log('🔗 Accede al panel en: http://localhost:3000/admin');
      console.log('');
      console.log('💡 Si no puedes iniciar sesión, el usuario puede necesitar confirmación de email.');
      console.log('   Ve a la configuración de Supabase Auth para desactivar la confirmación de email.');
      return;
    }

    // Create admin user with email confirmation disabled
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@cecom.com.do',
      password: 'admin123',
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'CECOM',
          role: 'administrator'
        },
        emailRedirectTo: undefined // Disable email confirmation redirect
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('⚠️  Usuario ya existe pero puede necesitar confirmación');
        console.log('');
        console.log('🔧 Soluciones:');
        console.log('1. Ve a Supabase Dashboard > Authentication > Settings');
        console.log('2. Desactiva "Enable email confirmations"');
        console.log('3. O confirma manualmente el email en Users > admin@cecom.com.do');
        return;
      }
      console.error('❌ Error creando usuario:', error.message);
      return;
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: 'admin@cecom.com.do',
          first_name: 'Admin',
          last_name: 'CECOM',
          role: 'administrator',
          active: true
        });

      if (profileError) {
        console.error('❌ Error creando perfil:', profileError.message);
        return;
      }

      console.log('✅ Usuario administrador creado exitosamente');
      console.log('');
      console.log('📋 Credenciales de acceso:');
      console.log('   Email: admin@cecom.com.do');
      console.log('   Contraseña: admin123');
      console.log('   Rol: administrator');
      console.log('');
      
      if (!data.user.email_confirmed_at) {
        console.log('⚠️  IMPORTANTE: El email necesita confirmación');
        console.log('');
        console.log('🔧 Para solucionarlo:');
        console.log('1. Ve a: https://supabase.com/dashboard/project/kfhrhdhtngtmnescqcnv/auth/users');
        console.log('2. Busca admin@cecom.com.do');
        console.log('3. Haz clic en "..." > "Confirm email"');
        console.log('');
        console.log('O desactiva la confirmación de email:');
        console.log('1. Ve a: https://supabase.com/dashboard/project/kfhrhdhtngtmnescqcnv/auth/settings');
        console.log('2. Desactiva "Enable email confirmations"');
      }
      
      console.log('🔗 Accede al panel en: http://localhost:3000/admin');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

createAdminUser();