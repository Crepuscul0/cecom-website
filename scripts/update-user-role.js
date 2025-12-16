/**
 * Update User Role Script
 * Updates a user's role in the user_profiles table
 * 
 * Usage: node scripts/update-user-role.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateUserRole(email, newRole) {
  console.log('🔄 Updating user role...');
  console.log(`Email: ${email}`);
  console.log(`New Role: ${newRole}`);
  console.log('');

  try {
    // First, find the user by email
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email);

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ User not found with email:', email);
      return;
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Active: ${user.active}`);
    console.log(`   Approval Status: ${user.approval_status}`);
    console.log('');

    // Update the user's role
    const { data: updatedUser, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        role: newRole,
        approval_status: 'approved',
        active: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select();

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);
      return;
    }

    console.log('✅ User role updated successfully!');
    console.log('');
    console.log('Updated user:');
    console.log(`   ID: ${updatedUser[0].id}`);
    console.log(`   Email: ${updatedUser[0].email}`);
    console.log(`   New Role: ${updatedUser[0].role}`);
    console.log(`   Active: ${updatedUser[0].active}`);
    console.log(`   Approval Status: ${updatedUser[0].approval_status}`);
    console.log('');
    console.log('🎉 Done! User can now access admin features.');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

// Main execution
const email = 'admin@cecom.com.do';
const newRole = 'admin';

console.log('═══════════════════════════════════════════════════════════');
console.log('  Update User Role to Administrator');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

updateUserRole(email, newRole)
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
