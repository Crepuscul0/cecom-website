#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - usando service role key para operaciones admin
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5NzIxOCwiZXhwIjoyMDcwNjczMjE4fQ.Ej6qJGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmAdminUser() {
  console.log('✉️  Confirmando email del usuario administrador...');

  try {
    // Get user by email
    const { data: users, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('❌ Error obteniendo usuarios:', getUserError.message);
      return;
    }

    const adminUser = users.users.find(user => user.email === 'admin@cecom.com.do');
    
    if (!adminUser) {
      console.error('❌ Usuario admin@cecom.com.do no encontrado');
      console.log('💡 Ejecuta primero: npm run create:admin');
      return;
    }

    if (adminUser.email_confirmed_at) {
      console.log('✅ El email ya está confirmado');
      console.log('🔗 Puedes iniciar sesión en: http://localhost:3000/admin');
      return;
    }

    // Confirm user email
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { 
        email_confirm: true,
        email_confirmed_at: new Date().toISOString()
      }
    );

    if (error) {
      console.error('❌ Error confirmando email:', error.message);
      return;
    }

    console.log('✅ Email confirmado exitosamente');
    console.log('');
    console.log('📋 Credenciales de acceso:');
    console.log('   Email: admin@cecom.com.do');
    console.log('   Contraseña: admin123');
    console.log('   Estado: Email confirmado ✓');
    console.log('');
    console.log('🔗 Accede al panel en: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    console.log('');
    console.log('🔧 Solución alternativa:');
    console.log('1. Ve a: https://supabase.com/dashboard/project/kfhrhdhtngtmnescqcnv/auth/users');
    console.log('2. Busca admin@cecom.com.do');
    console.log('3. Haz clic en "..." > "Confirm email"');
  }
}

confirmAdminUser();