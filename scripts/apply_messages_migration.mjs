import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Read and split the SQL migration into individual statements
const sql = readFileSync('supabase/migrations/20260216000000_setup_messages.sql', 'utf8');

// Split by semicolons, keeping only non-empty statements
const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

// Execute each statement via rpc or direct query
// Since supabase-js doesn't support raw SQL, we'll use the REST API directly
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

async function executeSQL(statement) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: statement })
    });
    return response;
}

// Try using the Supabase SQL API endpoint
async function executeSQLDirect(sqlText) {
    // Use the pg_net or direct SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'return=minimal'
        }
    });
    return response;
}

// The simplest approach: check if tables exist first, then create via individual operations
async function main() {
    console.log('🔍 Checking if conversations table exists...');

    const { error: convCheck } = await supabase.from('conversations').select('id').limit(1);

    if (!convCheck) {
        console.log('✅ conversations table already exists');
    } else if (convCheck.message?.includes('does not exist') || convCheck.code === '42P01') {
        console.log('❌ conversations table does not exist');
        console.log('\n⚠️  You need to run the SQL migration manually in the Supabase Dashboard.');
        console.log('   Go to: SQL Editor in your Supabase Dashboard');
        console.log(`   URL: ${supabaseUrl.replace('.supabase.co', '.supabase.co')}/project/default/sql`);
        console.log('\n   Copy and paste the contents of:');
        console.log('   supabase/migrations/20260216000000_setup_messages.sql\n');
        process.exit(1);
    } else {
        console.log('⚠️  Unexpected error:', convCheck.message);
    }

    console.log('\n🔍 Checking if messages table exists...');
    const { error: msgCheck } = await supabase.from('messages').select('id').limit(1);

    if (!msgCheck) {
        console.log('✅ messages table already exists');
    } else if (msgCheck.message?.includes('does not exist') || msgCheck.code === '42P01') {
        console.log('❌ messages table does not exist');
        console.log('\n⚠️  Run the migration SQL in Supabase Dashboard SQL Editor.');
        process.exit(1);
    } else {
        console.log('⚠️  Unexpected error:', msgCheck.message);
    }

    console.log('\n✅ Both tables exist! Messaging system is ready.');
}

main().catch(console.error);
