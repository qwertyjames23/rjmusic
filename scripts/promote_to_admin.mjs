
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error('❌ Service Role Key missing from .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const EMAIL = 'raffyjames65@gmail.com';

async function promote() {
  console.log(`--- Promoting ${EMAIL} to Admin ---`);

  // 1. Get the user ID from auth.users (via admin API)
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Error listing users:', userError.message);
    return;
  }

  const targetUser = users.users.find(u => u.email === EMAIL);

  if (!targetUser) {
    console.error(`❌ User with email ${EMAIL} not found. Please sign up first!`);
    return;
  }

  const userId = targetUser.id;
  console.log(`Found user ID: ${userId}`);

  // 2. Update the role in public.profiles
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (updateError) {
    console.error('❌ Error updating role:', updateError.message);
  } else {
    console.log(`✅ Success! ${EMAIL} is now an Admin.`);
  }

  console.log('--- Promotion Complete ---');
}

promote();
