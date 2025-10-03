#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('🧪 Creando usuario de prueba...');

  try {
    // Try with a different email that might not require confirmation
    const testEmail = 'test@cecom.local';
    const testPassword = 'test123';

    // Create test user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          role: 'administrator'
        }
      }
    });

    if (error) {
      console.error('❌ Error creando usuario de prueba:', error.message);
      
      // Try to sign in with existing credentials
      console.log('🔄 Intentando iniciar sesión con credenciales existentes...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@cecom.com.do',
        password: 'admin123'
      });

      if (signInError) {
        console.log('❌ Error de inicio de sesión:', signInError.message);
        console.log('');
        console.log('🔧 Soluciones recomendadas:');
        console.log('1. Ve a Supabase Dashboard: https://supabase.com/dashboard/project/kfhrhdhtngtmnescqcnv');
        console.log('2. Authentication > Settings');
        console.log('3. Desactiva "Enable email confirmations"');
        console.log('4. O ve a Users y confirma manualmente admin@cecom.com.do');
        return;
      } else {
        console.log('✅ Inicio de sesión exitoso con credenciales existentes');
        console.log('📋 Usa: admin@cecom.com.do / admin123');
        return;
      }
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: testEmail,
          first_name: 'Test',
          last_name: 'User',
          role: 'administrator',
          active: true
        });

      if (profileError) {
        console.error('❌ Error creando perfil de prueba:', profileError.message);
        return;
      }

      console.log('✅ Usuario de prueba creado exitosamente');
      console.log('');
      console.log('📋 Credenciales de prueba:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Contraseña: ${testPassword}`);
      console.log('   Rol: administrator');
      console.log('');
      console.log('🔗 Accede al panel en: http://localhost:3000/admin');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

createTestUser();