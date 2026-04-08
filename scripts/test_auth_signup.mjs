
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

async function testSignup() {
  const email = `rjtest_${Math.floor(Math.random() * 10000)}@gmail.com`;
  const password = 'Password123!';

  console.log(`--- Testing Signup with ${email} ---`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('❌ Signup failed:', error.message);
    if (error.status === 429) {
      console.log('💡 Tip: You hit the rate limit. Wait a few minutes or use a different IP/service.');
    }
  } else {
    console.log('✅ Signup request successful');
    console.log('User ID:', data.user?.id);
    console.log('Session present:', !!data.session);
    
    if (!data.session && data.user && data.user.identities?.length === 0) {
        console.log('⚠️ User already exists or other identity issue.');
    } else if (!data.session) {
        console.log('ℹ️ Confirmation email likely sent (Session is null).');
    } else {
        console.log('🚀 Logged in immediately! (No confirmation required)');
    }
  }
}

testSignup();
