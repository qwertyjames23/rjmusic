
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkSchema() {
  console.log('--- Checking Schema Visibility ---');

  // 1. Check Orders columns
  console.log('Checking orders table columns...');
  // Try to select the 'address' column explicitly
  const { data, error } = await supabase
    .from('orders')
    .select('address, city, region, postal_code')
    .limit(1);

  if (error) {
    console.error('❌ Error accessing new columns:', error.message);
    if (error.message.includes('Could not find')) {
      console.log('💡 Schema cache is stale. Please reload schema in Dashboard > API > Schema Cache.');
    }
  } else {
    console.log('✅ Success! Columns are visible.');
  }

  // 2. Check Trigger existence (hard via API, but we can infer from behavior)
  console.log('Checking trigger behavior (mocking update)...');
  // We'll create a dummy user and try to update their role.
  
  // Create dummy
  const email = `test_trigger_${Date.now()}@example.com`;
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true
  });
  
  if (createError) {
    console.error('❌ User create failed:', createError.message);
    return;
  }
  
  const uid = user.user.id;
  console.log('Created user:', uid);

  // Authenticate as this user
  const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await userClient.auth.signInWithPassword({ email, password: 'password123' });

  // Try to update role
  const { error: updateError } = await userClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', uid);

  // Check result via admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', uid)
    .single();

  if (profile.role === 'admin') {
     console.error('❌ CRITICAL: Trigger failed. User became admin.');
  } else {
     console.log('✅ Trigger worked! Role is still:', profile.role);
     if (updateError) console.log('   (Update error was:', updateError.message + ')');
  }

  // Cleanup
  await supabase.auth.admin.deleteUser(uid);
  console.log('Cleanup done.');
}

checkSchema();
