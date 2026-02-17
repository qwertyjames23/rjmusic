import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const sql = `
-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Conversations table
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_email TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_from_admin BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "conversations_select" ON conversations
    FOR SELECT USING (
        customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

CREATE POLICY "conversations_insert" ON conversations
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "conversations_update" ON conversations
    FOR UPDATE USING (
        customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- Policies for messages
CREATE POLICY "messages_select" ON messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.customer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

CREATE POLICY "messages_insert" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
    );

CREATE POLICY "messages_update" ON messages
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.customer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );
`;

// Execute via Supabase SQL endpoint (uses the pg_query endpoint)
async function run() {
    console.log("🔧 Dropping and recreating messages & conversations tables...\n");

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
        },
    });

    // The RPC endpoint won't work for raw SQL. Let's use the SQL API directly.
    // Supabase exposes a /pg endpoint for service role
    const sqlResponse = await fetch(`${supabaseUrl}/pg`, {
        method: 'POST',
        headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
    });

    if (sqlResponse.ok) {
        const result = await sqlResponse.json();
        console.log("✅ Tables created successfully!", result);
    } else {
        // Fallback: try the /sql endpoint
        console.log("Trying alternate endpoint...");

        // Extract project ref from URL
        const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

        if (!projectRef) {
            console.error("❌ Could not extract project ref from URL");
            console.log("\n📋 Please run this SQL manually in Supabase Dashboard > SQL Editor:");
            console.log("   URL: https://supabase.com/dashboard/project/" + (projectRef || 'YOUR_PROJECT') + "/sql");
            console.log("\n" + sql);
            process.exit(1);
        }

        // Try the management API
        const mgmtResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: sql })
        });

        if (mgmtResponse.ok) {
            console.log("✅ Tables created successfully via management API!");
        } else {
            console.log("❌ Could not run SQL via API. Status:", mgmtResponse.status);
            console.log("\n📋 Please run this SQL manually in Supabase Dashboard > SQL Editor:");

            const projectRef2 = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
            console.log(`   URL: https://supabase.com/dashboard/project/${projectRef2}/sql/new\n`);
            console.log(sql);
        }
    }
}

run().catch(console.error);
