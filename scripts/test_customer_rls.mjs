import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error('❌ Service Role Key missing from .env.local');
    process.exit(1);
}

// 1. Admin Client (uses Service Role Key to bypass RLS and confirm users)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 2. Client-side Client (uses Anon Key + Login session to test RLS)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const EMAIL = 'rjtest_auto_confirmed@gmail.com';
const PASSWORD = 'Password123!';

async function testCustomer() {
  console.log(`--- Setting up Test User: ${EMAIL} ---`);

  // 0. Clean up existing user (if any)
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers.users.find(u => u.email === EMAIL);
  
  if (existingUser) {
    console.log('🗑️ Deleting existing test user...');
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  }

  // A. Create User (Admin bypass)
  console.log('✨ Creating new confirmed user...');
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true
  });

  if (createError) {
    console.error('❌ User creation failed:', createError.message);
    return;
  }
  console.log('✅ User created and auto-confirmed via Admin API.');

  // B. Login as Customer (Standard client flow)
  console.log('--- Logging in as Customer ---');
  const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (authError) {
    console.error('❌ Login failed:', authError.message);
    return;
  }
  console.log('✅ Login successful. User ID:', authData.user.id);
  const userId = authData.user.id;

  // C. Test RLS Permissions

  // 1. Read products
  console.log('Testing: Read products...');
  const { error: pError } = await supabaseClient.from('products').select('id').limit(1);
  if (pError) console.error('❌ Products read failed:', pError.message);
  else console.log('✅ Products read success');

  // 2. Insert product (should fail)
  console.log('Testing: Insert product (should fail)...');
  const { error: piError } = await supabaseClient.from('products').insert({ name: 'Hack', price: 0 });
  if (piError && piError.message.includes('row-level security')) console.log('✅ Products insert blocked');
  else if (piError) console.error('❓ Unexpected error:', piError.message);
  else console.error('❌ Products insert succeeded (Security Risk!)');

  // 3. Insert order
  console.log('Testing: Insert order...');
  const { data: newOrder, error: niError } = await supabaseClient.from('orders').insert({
    user_id: userId,
    customer_name: 'Test Customer',
    customer_email: EMAIL,
    address: '123 Test St',
    city: 'Test City',
    total_amount: 100,
    payment_method: 'test'
  }).select().single();
  
  if (niError) console.error('❌ Order insert failed:', niError.message);
  else console.log('✅ Order insert success. Order ID:', newOrder.id);

  // 4. Read own orders
  console.log('Testing: Read own orders...');
  const { data: orders, error: oError } = await supabaseClient.from('orders').select('id');
  if (oError) console.error('❌ Orders read failed:', oError.message);
  else console.log('✅ Orders read success. Found:', orders.length);

  // 5. Security Check: Self-promotion to admin
  console.log('Testing Security: Attempt self-promotion to admin...');
  await supabaseClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);
  
  // Even if update "succeeds" (no error), RLS policy might silently ignore it or return 0 rows affected.
  // Verify strictly by re-fetching profile.
  const { data: profile } = await supabaseAdmin // Use admin to read truth
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (profile?.role === 'admin') {
    console.error('❌ CRITICAL: Self-promotion to admin succeeded!');
  } else {
    console.log(`✅ Role check: User is still '${profile?.role}' (Safe).`);
  }

  // Cleanup (using Admin client)
  console.log('--- Cleanup ---');
  if (newOrder) {
      await supabaseAdmin.from('orders').delete().eq('id', newOrder.id);
      console.log('✅ Test order cleaned up.');
  }
  // Optional: delete user to keep test environment clean
  // await supabaseAdmin.auth.admin.deleteUser(userId);

  console.log('--- Customer Testing Complete ---');
}

testCustomer();
