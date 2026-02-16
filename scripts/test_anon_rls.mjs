
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnon() {
  console.log('--- Testing Anon Permissions ---');

  // 1. Products read
  console.log('Testing: Anon read products...');
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('id, name')
    .limit(1);
  
  if (pError) {
    console.error('❌ Products read failed:', pError.message);
  } else {
    console.log('✅ Products read success:', products.length, 'item(s)');
  }

  // 2. Products insert (should fail)
  console.log('Testing: Anon insert product (should fail)...');
  const { error: piError } = await supabase
    .from('products')
    .insert({ name: 'Test Product', price: 99.99 });
  
  if (piError && piError.message.includes('violates row-level security policy')) {
    console.log('✅ Products insert blocked (Correct)');
  } else if (piError) {
    console.error('❓ Products insert failed with unexpected error:', piError.message);
  } else {
    console.error('❌ Products insert succeeded (Security Risk!)');
  }

  // 4. Check profiles for the test user
  console.log('Testing: Check profiles for rjtest_4543@gmail.com...');
  // Since we can't select by email directly in profiles (only ID), 
  // and we don't have the ID unless signup succeeded, 
  // we'll just check if ANY profile exists that was created recently.
  const { data: profiles, error: prError } = await supabase
    .from('profiles')
    .select('id, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (prError) {
    console.error('❌ Profiles read failed:', prError.message);
  } else {
    console.log('✅ Profiles read success. Latest profiles:', profiles);
  }

  console.log('--- Anon Testing Complete ---');
}

testAnon();
