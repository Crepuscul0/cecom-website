const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestAdmin() {
  try {
    console.log('Creating test admin user...')
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'Admin'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return
    }

    console.log('Auth user created:', authData.user.email)

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin',
        approval_status: 'approved',
        approved_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      return
    }

    console.log('✅ Test admin created successfully!')
    console.log('📧 Email: admin@test.com')
    console.log('🔑 Password: admin123')
    console.log('🎯 Role: admin (approved)')
    
  } catch (error) {
    console.error('Error creating test admin:', error)
  }
}

createTestAdmin()
